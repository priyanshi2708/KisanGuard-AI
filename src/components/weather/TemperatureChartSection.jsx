import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Thermometer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TemperatureChartSection = ({ forecastList }) => {
  const { t } = useLanguage();

  if (!forecastList || !Array.isArray(forecastList) || forecastList.length === 0) return null;

  // Extract High and Low temps
  const highTemps = forecastList.map(item => item.tempHigh);
  const lowTemps = forecastList.map(item => item.tempLow);
  const days = forecastList.map(item => item.dayName);

  const maxTemp = Math.max(...highTemps) + 2;
  const minTemp = Math.min(...lowTemps) - 2;
  const tempRange = maxTemp - minTemp || 1;

  // Chart dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getX = (index) => paddingX + (index / (forecastList.length - 1)) * chartW;
  const getY = (val) => paddingY + chartH - ((val - minTemp) / tempRange) * chartH;

  const highPoints = highTemps.map((val, idx) => ({ x: getX(idx), y: getY(val), val }));
  const lowPoints = lowTemps.map((val, idx) => ({ x: getX(idx), y: getY(val), val }));

  // Helper to make smooth SVG path
  const makePath = (points) => {
    return points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + point.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
    }, '');
  };

  const highPath = makePath(highPoints);
  const lowPath = makePath(lowPoints);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-leaf-green" />
            <span>TEMPERATURE ANALYSIS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
            {t('weatherPage.tempChartTitle')}
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-amber-600">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>{t('weatherPage.highTemp')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-600">
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
            <span>{t('weatherPage.lowTemp')}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Wrapper */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1={paddingX} y1={paddingY + chartH / 2} x2={width - paddingX} y2={paddingY + chartH / 2} stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1={paddingX} y1={paddingY + chartH} x2={width - paddingX} y2={paddingY + chartH} stroke="#E2E8F0" strokeDasharray="4 4" />

            {/* High Temp Path */}
            <motion.path
              d={highPath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />

            {/* Low Temp Path */}
            <motion.path
              d={lowPath}
              fill="none"
              stroke="#0284C7"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            />

            {/* Data Points */}
            {highPoints.map((pt, i) => (
              <g key={`high-${i}`}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#D97706" fontSize="12" fontWeight="bold">
                  {pt.val}°
                </text>
                <text x={pt.x} y={height - 5} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="bold">
                  {days[i]}
                </text>
              </g>
            ))}

            {lowPoints.map((pt, i) => (
              <g key={`low-${i}`}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                <text x={pt.x} y={pt.y + 18} textAnchor="middle" fill="#0369A1" fontSize="11" fontWeight="bold">
                  {pt.val}°
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TemperatureChartSection;
