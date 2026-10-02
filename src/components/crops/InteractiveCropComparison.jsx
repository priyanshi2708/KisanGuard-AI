import React, { useState } from 'react';
import { Scale, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const InteractiveCropComparison = ({ allCrops = [] }) => {
  const { language } = useLanguage();
  const safeCrops = Array.isArray(allCrops) ? allCrops : (allCrops?.data?.recommendedCrops || []);
  const [selectedIds, setSelectedIds] = useState(['groundnut', 'cotton', 'wheat']);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedCrops = safeCrops.filter((crop) => selectedIds.includes(crop.id));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/15 space-y-6 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <Scale className="w-5 h-5 text-forest-green" />
            <span>{language === 'gu' ? '⚖️ પાક સરખામણી કોષ્ટક' : '⚖️ COMPARE CROPS'}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu' ? 'પાસ-પાસે તુલના કરવા ૩ પાક સુધી પસંદ કરો:' : 'Select up to 3 crops to compare side-by-side:'}
          </p>
        </div>

        {/* Selection Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {safeCrops.map((c) => {
            const isChecked = selectedIds.includes(c.id);
            const cName = language === 'gu' ? (c.gujaratiName || c.name) : c.name;
            return (
              <button
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isChecked
                    ? 'bg-forest-green text-white border-forest-green shadow-sm'
                    : 'bg-warm-cream/60 border-forest-green/20 text-deep-forest hover:bg-light-leaf/40'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{cName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-forest-green/15 rounded-2xl">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-light-leaf/50 text-forest-green uppercase text-[11px] tracking-wider border-b border-forest-green/10">
            <tr>
              <th className="p-4 font-bold">{language === 'gu' ? 'મુખ્ય પરિમાણ' : 'Parameter'}</th>
              {selectedCrops.map((crop) => (
                <th key={crop.id} className="p-4 font-bold font-serif text-sm text-deep-forest">
                  {crop.gujaratiName || crop.name} <span className="text-xs text-forest-green font-normal">({crop.name})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-green/10 font-semibold text-deep-forest">
            <tr>
              <td className="p-4 text-earth-brown font-bold">{language === 'gu' ? 'સિંચાઈ પાણી જરૂરિયાત' : 'Water Requirement'}</td>
              {selectedCrops.map((c) => (
                <td key={c.id} className="p-4 text-forest-green">{c.waterRequirement}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-earth-brown font-bold">{language === 'gu' ? 'જોખમ સ્તર' : 'Risk Level'}</td>
              {selectedCrops.map((c) => (
                <td key={c.id} className="p-4 text-emerald-700">{c.risk}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-earth-brown font-bold">{language === 'gu' ? 'પાક સમયગાળો' : 'Growth Period'}</td>
              {selectedCrops.map((c) => (
                <td key={c.id} className="p-4 font-mono">{c.growthPeriodDays} {language === 'gu' ? 'દિવસ' : 'Days'}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-earth-brown font-bold">{language === 'gu' ? 'અંદાજિત ખર્ચ' : 'Estimated Cost'}</td>
              {selectedCrops.map((c) => (
                <td key={c.id} className="p-4 font-mono">₹{c.estimatedCost.toLocaleString()}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-earth-brown font-bold">{language === 'gu' ? 'અંદાજિત આવક' : 'Estimated Revenue'}</td>
              {selectedCrops.map((c) => (
                <td key={c.id} className="p-4 font-mono text-forest-green">₹{c.estimatedRevenue.toLocaleString()}</td>
              ))}
            </tr>
            <tr className="bg-light-leaf/30">
              <td className="p-4 text-deep-forest font-bold">{language === 'gu' ? 'અંદાજિત ચોખ્ખો નફો' : 'Estimated Profit'}</td>
              {selectedCrops.map((c) => (
                <td key={c.id} className="p-4 font-mono text-forest-green text-sm font-bold">₹{c.estimatedProfit.toLocaleString()}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Horizontal Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden text-xs">
        {selectedCrops.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/20 space-y-2">
            <div className="font-bold text-base font-serif text-deep-forest flex justify-between">
              <span>{c.gujaratiName || c.name} ({c.name})</span>
              <span className="text-forest-green font-mono">₹{c.estimatedProfit.toLocaleString()} Net</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-earth-brown bg-white p-2.5 rounded-xl">
              <div>{language === 'gu' ? 'સિંચાઈ:' : 'Water:'} <span className="text-deep-forest font-bold">{c.waterRequirement}</span></div>
              <div>{language === 'gu' ? 'જોખમ:' : 'Risk:'} <span className="text-emerald-700 font-bold">{c.risk}</span></div>
              <div>{language === 'gu' ? 'સમયગાળો:' : 'Growth:'} <span className="text-deep-forest font-bold">{c.growthPeriodDays} {language === 'gu' ? 'દિવસ' : 'Days'}</span></div>
              <div>{language === 'gu' ? 'ખર્ચ:' : 'Cost:'} <span className="text-deep-forest font-bold">₹{c.estimatedCost.toLocaleString()}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveCropComparison;
