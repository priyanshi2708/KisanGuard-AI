import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Sparkles, ShieldCheck, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CropPhotoPreviewModal = ({ isOpen, onClose, onSendPhoto }) => {
  const { t } = useLanguage();

  const [images, setImages] = useState([]); // Array of { file, url, name, label }

  const photoTypes = [
    { key: 'leaf', label: '🌿 Leaf Close-up' },
    { key: 'plant', label: '🌱 Whole Plant' },
    { key: 'stem', label: '🌾 Stem / Stalk' },
    { key: 'affected', label: '🔍 Affected Area' }
  ];

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 4 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const typeObj = photoTypes[images.length + idx] || photoTypes[0];
        setImages((prev) => [
          ...prev,
          {
            file,
            url: reader.result,
            name: file.name,
            label: typeObj.label
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (images.length > 0) {
      onSendPhoto(images[0]); // Send primary image payload with full list attached
      setImages([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-forest-green/10 space-y-5 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-deep-forest">
                  📷 Multimodal Vision AI Upload
                </h3>
                <p className="text-xs text-earth-brown">Upload up to 4 photos for higher precision</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-earth-brown/60 hover:text-deep-forest hover:bg-forest-green/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border-2 border-forest-green/30 h-32 group shadow-sm bg-black">
                  <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {img.label}
                  </div>
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label className="border-2 border-dashed border-forest-green/30 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-forest-green hover:bg-warm-cream/40 transition-all text-center p-3 space-y-1">
                  <Plus className="w-6 h-6 text-forest-green" />
                  <span className="text-xs font-bold text-deep-forest">
                    {images.length === 0 ? 'Upload Crop Photo' : 'Add Another Photo'}
                  </span>
                  <span className="text-[10px] text-earth-brown font-mono">
                    ({images.length}/4 photos)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileAdd}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Diagnostic Criteria */}
          <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-1.5 text-xs">
            <div className="font-bold text-deep-forest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-forest-green" />
              <span>Multimodal Vision AI Analysis Rules:</span>
            </div>
            <div className="text-[11px] text-earth-brown font-medium space-y-0.5">
              <div>• Crop is identified independently from photo (Not profile crop)</div>
              <div>• Evaluates leaf chlorosis, pest holes, wilt & stem health</div>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>AI visual diagnosis is advisory. Confirm before applying chemicals.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-forest-green/10">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-earth-brown font-bold text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={images.length === 0}
              onClick={handleSend}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md ${
                images.length > 0
                  ? 'bg-forest-green hover:bg-deep-forest cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Analyze {images.length > 0 ? `(${images.length} Photos)` : ''}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CropPhotoPreviewModal;
