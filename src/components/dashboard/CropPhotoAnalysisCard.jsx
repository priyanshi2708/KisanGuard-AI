import React, { useState } from 'react';
import { Camera, Upload, CheckCircle, AlertTriangle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeCropImage } from '../../services/cropVisionService';
import { getFarmerContext } from '../../services/farmerContextService';

export const CropPhotoAnalysisCard = () => {
  const { language, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalyzing(true);
      setResult(null);

      const farmerContext = getFarmerContext();
      const visionResult = await analyzeCropImage({
        images: [{ url: imageUrl, name: file.name }],
        farmerContext,
        language
      });

      setAnalyzing(false);
      setResult(visionResult);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-5 font-sans">
      
      <div className="flex items-center gap-3 border-b border-forest-green/10 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-forest-green/10 text-forest-green flex items-center justify-center font-bold">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif text-deep-forest">
            {t('dashboard.cropDiagnosticTitle')}
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            Independent Multimodal Visual Crop Diagnostic
          </p>
        </div>
      </div>

      {!selectedImage ? (
        <div className="border-2 border-dashed border-forest-green/20 rounded-2xl p-8 text-center space-y-4 bg-warm-cream/40">
          <Camera className="w-10 h-10 text-forest-green mx-auto opacity-80" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-deep-forest">{t('common.uploadPhoto')}</div>
            <div className="text-xs text-earth-brown">Supports JPG, PNG, WEBP files (Analyzed independently from profile)</div>
          </div>

          <label className="inline-flex items-center gap-2 bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow hover:scale-105 transition-transform">
            <Upload className="w-4 h-4" />
            <span>{t('common.uploadPhoto')}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4 bg-warm-cream/60 p-4 rounded-2xl border border-forest-green/20">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <img
              src={selectedImage}
              alt="Uploaded crop preview"
              className="w-32 h-32 object-cover rounded-xl border-2 border-white shadow-md shrink-0 mx-auto sm:mx-0"
            />

            <div className="flex-1 space-y-3 text-left w-full">
              {analyzing ? (
                <div className="flex items-center gap-2 text-xs font-bold text-forest-green animate-pulse p-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'gu' ? 'પાંદડાનું એઆઈ વિશ્લેષણ ચાલુ છે...' : 'Analyzing crop photo with Real Vision AI...'}</span>
                </div>
              ) : result ? (
                <div className="space-y-3 text-xs">
                  
                  {/* STATE A — SUCCESSFUL IDENTIFICATION */}
                  {result.status === 'analyzed' && result.crop && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-sm">
                        <div className="font-extrabold text-sm text-forest-green flex items-center gap-1.5">
                          <span>🌱 પાક ઓળખાયો:</span>
                          <span className="text-deep-forest underline decoration-leaf-green">{result.crop.nameGu || result.crop.nameEn}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Confidence: {result.crop.confidenceLabel || 'High'}
                        </span>
                      </div>

                      {result.isProfileMismatch && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-900 leading-relaxed font-medium">
                          ⚠️ Profile crop is <strong>{result.profileCropName}</strong>, but image visual analysis indicates <strong>{result.crop.nameEn}</strong>.
                        </div>
                      )}

                      {result.observations && result.observations.length > 0 && (
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-forest-green/10">
                          <div className="font-bold text-deep-forest text-[11px]">🔎 દ્રશ્ય નિરીક્ષણ (Visible Observations):</div>
                          {result.observations.map((obs, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-earth-brown">
                              <span className="text-forest-green font-bold">•</span>
                              <span>{obs}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {result.possibleCauses && result.possibleCauses.length > 0 && (
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-forest-green/10">
                          <div className="font-bold text-deep-forest text-[11px] flex items-center justify-between">
                            <span>💡 સંભવિત કારણો (Possible Causes):</span>
                            {result.ragKnowledgeFound && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                📚 RAG Verified
                              </span>
                            )}
                          </div>
                          {result.possibleCauses.map((cause, idx) => (
                            <div key={idx} className="text-[11px] text-earth-brown flex items-start gap-1 font-medium">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{typeof cause === 'string' ? cause : (cause.name || cause.issue)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {result.whatToCheck && result.whatToCheck.length > 0 && (
                        <div className="space-y-1 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                          <div className="font-bold text-amber-950 text-[11px]">🔍 તમે શું ચકાસી શકો (What You Should Check):</div>
                          {result.whatToCheck.map((chk, idx) => (
                            <div key={idx} className="text-[11px] text-amber-900 flex items-start gap-1 font-medium">
                              <span className="text-amber-700 font-bold">•</span>
                              <span>{chk}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {result.actionStepsGu && result.actionStepsGu.length > 0 && (
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-forest-green/10">
                          <div className="font-bold text-deep-forest text-[11px]">📋 વ્યવહારુ સાવચેતીના પગલાં (Safe Next Steps):</div>
                          {result.actionStepsGu.map((step, idx) => (
                            <div key={idx} className="text-[11px] text-earth-brown flex items-start gap-1">
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-earth-brown/80 italic pt-1 border-t border-forest-green/10">
                        {result.disclaimerGu || result.disclaimerEn}
                      </div>
                    </>
                  )}

                  {/* STATE B — IMAGE UNCLEAR / CANNOT IDENTIFY */}
                  {result.status === 'unclear' && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-amber-900">
                      <div className="font-bold text-sm flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>🌱 પાક ઓળખી શકાયો નથી</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        ફોટો પૂરતો સ્પષ્ટ નથી અથવા પાક ઓળખી શકાયો નથી.
                      </p>
                      <p className="text-xs font-semibold text-amber-950">
                        કૃપા કરીને પાન/છોડનો નજીકથી અને સ્પષ્ટ ફોટો લો.
                      </p>
                    </div>
                  )}

                  {/* STATE C — API / AI FAILURE */}
                  {result.status === 'api_unavailable' && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 text-red-900">
                      <div className="font-bold text-sm flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>🤖 AI સેવા હાલમાં ઉપલબ્ધ નથી</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {result.textGu || 'ફોટાનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી.'}
                      </p>
                      <p className="text-xs font-semibold text-red-950">
                        થોડીવાર પછી ફરી પ્રયાસ કરો.
                      </p>
                    </div>
                  )}

                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-forest-green/10">
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-green cursor-pointer hover:underline">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Another Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

    </div>
  );
};

export default CropPhotoAnalysisCard;
