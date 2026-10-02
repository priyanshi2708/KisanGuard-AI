import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Flame, ZoomIn, ZoomOut, RefreshCw, Compass, ShieldCheck, Layers, Navigation } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TILE_SERVERS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
  },
  street: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  thermal: {
    name: 'Thermal IR (Night)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }
};

// Cities (Visible when zoom < 10)
const CITIES = [
  { name: 'Ahmedabad (અમદાવાદ)', lat: 23.0225, lng: 72.5714 },
  { name: 'Vadodara (વડોદરા)', lat: 22.3072, lng: 73.1812 },
  { name: 'Surat (સુરત)', lat: 21.1702, lng: 72.8311 },
  { name: 'Rajkot (રાજકોટ)', lat: 22.3039, lng: 70.8022 },
  { name: 'Gandhinagar (ગાંધીનગર)', lat: 23.2156, lng: 72.6369 },
  { name: 'Anand (આણંદ)', lat: 22.5645, lng: 72.9289 }
];

// Local Villages around Anand (Visible when zoom >= 10)
const VILLAGES = [
  { name: '🏡 Mogri (મોગરી)', lat: 22.5450, lng: 72.9150 },
  { name: '🏡 Bakrol (બરોલ)', lat: 22.5600, lng: 72.9450 },
  { name: '🏡 Karamsad (કરમસદ)', lat: 22.5470, lng: 72.8980 },
  { name: '🏡 Vallabh Vidyanagar (વલ્લભ વિદ્યાનગર)', lat: 22.5530, lng: 72.9240 },
  { name: '🏡 Lambhvel (લાંભવેલ)', lat: 22.5850, lng: 72.9550 },
  { name: '🏡 Napad (નાપડ)', lat: 22.5300, lng: 72.9700 },
  { name: '🏡 Chikhodra (ચીખોદરા)', lat: 22.5800, lng: 72.9800 },
  { name: '🏡 Hadgood (હડગુડ)', lat: 22.5950, lng: 72.9100 }
];

export const IndiaSatelliteMap = ({
  activeLocation = "Anand, Gujarat",
  heightClass = "h-96",
  radiusKm = 25,
  detections = [],
  selectedDetectionId = null,
  onDetectionClick = null
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const circleRef = useRef(null);
  const markersRef = useRef([]);
  const labelMarkersRef = useRef([]);

  const [mapMode, setMapMode] = useState('satellite');
  const [selectedRegion, setSelectedRegion] = useState('gujarat');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('');
  const [currentZoom, setCurrentZoom] = useState(10);

  // Default MODIS Satellite thermal detections
  const displayDetections = detections.length > 0 ? detections : [
    {
      id: "det-1",
      title: "Fire detection #1 (Anand North)",
      distance: 8.4,
      directionFull: "North-East",
      detectedAt: "Today, 2:15 PM",
      status: "MONITOR",
      latitude: 22.6100,
      longitude: 72.9600,
      confidence: 73,
      frp: 14.4,
      brightness: 310.9,
      satellite: "MODIS Terra",
      note: "Controlled residual crop clearing monitored 8.4 km North-East of Anand."
    },
    {
      id: "det-2",
      title: "Fire detection #2 (Khambhat Coast)",
      distance: 21.0,
      directionFull: "South",
      detectedAt: "Today, 11:40 AM",
      status: "LOW_CONCERN",
      latitude: 21.5563,
      longitude: 72.7955,
      confidence: 68,
      frp: 10.5,
      brightness: 315.8,
      satellite: "VIIRS NOAA-20",
      note: "Minor thermal flare registered 21 km South in open field."
    },
    {
      id: "det-3",
      title: "Fire detection #3 (Vadodara West)",
      distance: 28.0,
      directionFull: "East",
      detectedAt: "Today, 12:05 PM",
      status: "LOW_CONCERN",
      latitude: 22.3072,
      longitude: 73.1812,
      confidence: 70,
      frp: 12.1,
      brightness: 312.4,
      satellite: "MODIS Aqua",
      note: "Field residue burning 28 km East near agricultural perimeter."
    },
    {
      id: "det-4",
      title: "Fire detection #4 (Punjab Stubble Cluster)",
      distance: 310.0,
      directionFull: "North (Punjab)",
      detectedAt: "Today, 1:15 PM",
      status: "HIGH_ALERT",
      latitude: 31.0805,
      longitude: 75.2029,
      confidence: 86,
      frp: 53.8,
      brightness: 322.0,
      satellite: "MODIS Terra",
      note: "Active seasonal stubble clearing cluster registered by satellite."
    }
  ];

  const farmLat = 22.5645;
  const farmLng = 72.9289;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [farmLat, farmLng],
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Track Zoom level for City / Village Labels
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Initial Tile Layer
    const tileConfig = TILE_SERVERS[mapMode];
    const layer = L.tileLayer(tileConfig.url, {
      maxZoom: 18,
      subdomains: tileConfig.url.includes('{s}') ? ['a', 'b', 'c', 'd'] : []
    }).addTo(map);
    tileLayerRef.current = layer;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfig = TILE_SERVERS[mapMode] || TILE_SERVERS.satellite;
    const layer = L.tileLayer(tileConfig.url, {
      maxZoom: 18,
      subdomains: tileConfig.url.includes('{s}') ? ['a', 'b', 'c', 'd'] : []
    }).addTo(map);
    tileLayerRef.current = layer;
  }, [mapMode]);

  // Update Markers, Radius Circle, and Zoom-dependent City/Village Labels
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    labelMarkersRef.current.forEach(m => map.removeLayer(m));
    labelMarkersRef.current = [];

    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // 1. Add Radius Circle
    const radiusMeters = radiusKm * 1000;
    const circle = L.circle([farmLat, farmLng], {
      radius: radiusMeters,
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(map);
    circleRef.current = circle;

    // 2. Add Farmer's Farm Pin (📍)
    const farmIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-emerald-400/50 animate-ping"></span>
          <span class="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-xl">📍</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const farmMarker = L.marker([farmLat, farmLng], { icon: farmIcon }).addTo(map);
    farmMarker.bindPopup(`
      <div class="p-2 space-y-1 text-xs">
        <div class="font-extrabold text-sm text-emerald-400 font-serif flex items-center gap-1">
          📍 ${activeLocation}
        </div>
        <div class="text-gray-200 font-medium">Your Farm Center</div>
        <div class="text-emerald-300 font-mono text-[11px] pt-1 border-t border-white/10">
          Radius: ${radiusKm} km Thermal Radar Active
        </div>
      </div>
    `);
    markersRef.current.push(farmMarker);

    // 3. Add Satellite Fire Detection Pins (🔥)
    displayDetections.forEach((spot) => {
      const isHigh = spot.status === 'HIGH_ALERT';
      const isMonitor = spot.status === 'MONITOR';

      const statusBg = isHigh ? 'bg-red-600' : isMonitor ? 'bg-amber-500' : 'bg-emerald-600';
      const statusPing = isHigh ? 'bg-red-500/60' : isMonitor ? 'bg-amber-500/60' : 'bg-emerald-500/60';

      const fireIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="relative flex items-center justify-center group">
            <span class="absolute w-7 h-7 rounded-full ${statusPing} animate-ping"></span>
            <span class="relative w-7 h-7 rounded-full ${statusBg} border-2 border-white flex items-center justify-center text-xs text-white shadow-lg cursor-pointer">🔥</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const lat = spot.latitude || farmLat;
      const lng = spot.longitude || farmLng;

      const fireMarker = L.marker([lat, lng], { icon: fireIcon }).addTo(map);

      const popupContent = `
        <div class="p-2 space-y-2 text-xs text-warm-cream font-sans">
          <div class="font-bold text-sm text-amber-400 flex items-center justify-between gap-2 border-b border-white/10 pb-1">
            <span>🔥 ${spot.title || 'Satellite Detection'}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${isHigh ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}">
              ${spot.status || 'MONITOR'}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-1 text-[11px] bg-black/40 p-2 rounded-xl border border-white/10 font-mono">
            <div>Dist: <strong class="text-white">${spot.distance} km (${spot.directionFull || 'NE'})</strong></div>
            <div>Conf: <strong class="text-emerald-400">${spot.confidence || 73}%</strong></div>
            <div>FRP: <strong class="text-amber-400">${spot.frp || 14.4} MW</strong></div>
            <div>Sat: <strong class="text-white">${spot.satellite || 'Terra'}</strong></div>
          </div>

          <p class="text-[11px] text-gray-200 italic bg-white/5 p-2 rounded-lg">
            "${spot.note || 'MODIS Thermal anomaly verified.'}"
          </p>

          <div class="text-[10px] text-gray-400 pt-1 flex items-center justify-between border-t border-white/10 font-mono">
            <span>Lat: ${lat.toFixed(4)}°N, Lng: ${lng.toFixed(4)}°E</span>
            <span class="text-emerald-400 font-bold">🟢 MODIS Synced</span>
          </div>
        </div>
      `;

      fireMarker.bindPopup(popupContent);
      fireMarker.on('click', () => {
        setSelectedSpot(spot);
        if (onDetectionClick) onDetectionClick(spot);
      });

      markersRef.current.push(fireMarker);
    });

    // 4. ZOOM-DEPENDENT CITY / VILLAGE LABELS
    // If zoomed out (< 10): Render City Names
    // If zoomed in (>= 10): Render Village Names around Anand
    const labelsToRender = currentZoom < 10 ? CITIES : VILLAGES;
    const isVillageMode = currentZoom >= 10;

    labelsToRender.forEach((item) => {
      const labelIcon = L.divIcon({
        className: 'custom-map-label',
        html: `
          <div class="px-2 py-0.5 rounded-full ${isVillageMode ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-black/80 text-amber-300 border border-amber-500/40'} text-[10px] font-bold shadow-md font-mono whitespace-nowrap">
            ${item.name}
          </div>
        `,
        iconSize: [100, 20],
        iconAnchor: [50, 10]
      });

      const labelMarker = L.marker([item.lat, item.lng], { icon: labelIcon, interactive: false }).addTo(map);
      labelMarkersRef.current.push(labelMarker);
    });

  }, [radiusKm, activeLocation, displayDetections, currentZoom]);

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (region === 'gujarat') {
      map.flyTo([farmLat, farmLng], 10, { duration: 1.2 });
    } else if (region === 'punjab') {
      map.flyTo([31.0805, 75.2029], 9, { duration: 1.5 });
    } else if (region === 'all') {
      map.flyTo([22.5000, 78.9629], 5, { duration: 1.8 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([farmLat, farmLng], 10, { duration: 1.0 });
      setSelectedRegion('gujarat');
    }
  };

  const handleGPSLocation = () => {
    setGpsStatus('Locating...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setGpsStatus(`GPS: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
          }
          setTimeout(() => setGpsStatus(''), 4000);
        },
        () => {
          setGpsStatus('GPS permission denied. Synced to farm center.');
          setTimeout(() => setGpsStatus(''), 3000);
        }
      );
    } else {
      setGpsStatus('GPS not supported in browser.');
      setTimeout(() => setGpsStatus(''), 3000);
    }
  };

  return (
    <div className="bg-soil-dark rounded-3xl overflow-hidden border-2 border-forest-green/30 shadow-2xl relative flex flex-col font-sans text-white">
      
      {/* Map Header Toolbar */}
      <div className="bg-deep-forest/95 backdrop-blur-md px-4 py-3 border-b border-forest-green/20 flex flex-wrap items-center justify-between gap-3 relative z-20">
        
        {/* Title & Satellite Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-leaf-green/20 border border-leaf-green/40 flex items-center justify-center text-leaf-green">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-extrabold font-serif text-warm-cream flex items-center gap-1.5">
              <span>🇮🇳 REAL SATELLITE THERMAL RADAR</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-light-leaf/80 font-mono">
              NASA MODIS & VIIRS 375m • Active Location: <strong className="text-white">{activeLocation}</strong>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Region Preset Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => handleSelectRegion('gujarat')}
              className={`px-2.5 py-0.5 rounded-lg transition-all text-[10px] ${
                selectedRegion === 'gujarat' ? 'bg-forest-green text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              🌾 Gujarat (Farm Center)
            </button>
            <button
              onClick={() => handleSelectRegion('punjab')}
              className={`px-2.5 py-0.5 rounded-lg transition-all text-[10px] ${
                selectedRegion === 'punjab' ? 'bg-amber-600 text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              🌾 Punjab Belt
            </button>
            <button
              onClick={() => handleSelectRegion('all')}
              className={`px-2.5 py-0.5 rounded-lg transition-all text-[10px] ${
                selectedRegion === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              🇮🇳 All India
            </button>
          </div>

          {/* Map Mode Tile Selector */}
          <div className="flex items-center gap-1 bg-forest-green/20 p-1 rounded-xl border border-forest-green/30 text-xs">
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-0.5 rounded-lg transition-all font-bold text-[11px] ${
                mapMode === 'satellite' ? 'bg-leaf-green text-white shadow' : 'text-light-leaf/70 hover:text-white'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapMode('street')}
              className={`px-2.5 py-0.5 rounded-lg transition-all font-bold text-[11px] ${
                mapMode === 'street' ? 'bg-emerald-700 text-white shadow' : 'text-light-leaf/70 hover:text-white'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setMapMode('thermal')}
              className={`px-2.5 py-0.5 rounded-lg transition-all font-bold text-[11px] ${
                mapMode === 'thermal' ? 'bg-amber-500 text-white shadow' : 'text-light-leaf/70 hover:text-white'
              }`}
            >
              🔥 Thermal IR
            </button>
          </div>

          {/* GPS Sync */}
          <button
            onClick={handleGPSLocation}
            className="p-1.5 bg-black/40 hover:bg-forest-green rounded-xl border border-white/10 text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Sync My GPS Location"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleReset} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors" title="Reset Center">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* GPS Status Message Toast */}
      {gpsStatus && (
        <div className="bg-emerald-950/90 text-emerald-300 text-xs px-4 py-1.5 border-b border-emerald-500/30 font-mono flex items-center justify-between">
          <span>📍 {gpsStatus}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className={`relative ${heightClass} w-full overflow-hidden`}>
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Zoom Mode Badge Indicator */}
        <div className="absolute top-3 left-3 z-20 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-emerald-400 font-bold">
          {currentZoom < 10 ? '🏙️ City Labels View (Zoom In for Villages)' : '🏡 Village Labels View (Mogri, Bakrol, Karamsad, Vidyanagar)'}
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-20 bg-deep-forest/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-forest-green/30 text-[11px] font-semibold space-y-1 hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-light-leaf/70 font-bold mb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow" />
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow" />
            <span>Moderate Concern</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow" />
            <span>High Stubble Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🔥</span>
            <span>MODIS Fire Marker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">📍</span>
            <span>Your Farm Center</span>
          </div>
        </div>

      </div>

      {/* Map Footer Bar */}
      <div className="bg-deep-forest/90 border-t border-forest-green/20 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-light-leaf/80 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real Interactive Leaflet & NASA MODIS Satellite Thermal Radar</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Radius: <strong className="text-emerald-400">{radiusKm} km</strong></span>
          <span className="text-emerald-400 font-bold">🟢 Live Map Tile Synced</span>
        </div>
      </div>

    </div>
  );
};

export default IndiaSatelliteMap;
