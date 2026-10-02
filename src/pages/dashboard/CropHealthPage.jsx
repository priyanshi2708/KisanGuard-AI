import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CropPhotoAnalysisCard from '../../components/dashboard/CropPhotoAnalysisCard';
import { Camera, Sparkles, AlertCircle } from 'lucide-react';

export const CropHealthPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-forest-green to-leaf-green text-white shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-light-leaf text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4 text-golden-wheat" />
            <span>Computer Vision Crop Diagnostic Scanner</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
            📷 Crop Health Photo Diagnosis
          </h1>
          <p className="text-xs sm:text-sm text-light-leaf/90 max-w-2xl">
            Upload leaf photos to instantly diagnose yellowing, pest infections, or nutrient deficiencies.
          </p>
        </div>

        <CropPhotoAnalysisCard />
      </div>
    </DashboardLayout>
  );
};

export default CropHealthPage;
