import React from 'react';
import { CircleDollarSign, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmEconomicsVisualizer = ({ selectedCrop }) => {
  const { language } = useLanguage();

  if (!selectedCrop) return null;

  const cropName = language === 'gu' ? (selectedCrop.gujaratiName || selectedCrop.name) : selectedCrop.name;
  const cost = selectedCrop.estimatedCost || 18000;
  const revenue = selectedCrop.estimatedRevenue || 48000;
  const profit = selectedCrop.estimatedProfit || 29500;

  const maxVal = revenue > 0 ? revenue : 50000;
  const costWidth = Math.round((cost / maxVal) * 100);
  const profitWidth = Math.round((profit / maxVal) * 100);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/15 space-y-6 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-forest-green" />
            <span>{language === 'gu' ? `💰 અંદાજિત ખેતર આર્થિક હિસાબ (${cropName})` : `💰 ESTIMATED FARM ECONOMICS (${selectedCrop.name})`}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu'
              ? 'પ્રતિ એકર ઉત્પાદન વાવણી ખર્ચ, કુલ વેચાણ આવક અને ચોખ્ખો નફો'
              : 'Per-acre input costs, gross revenues, and net profit allocation'}
          </p>
        </div>

        <span className="text-xs font-bold text-forest-green bg-light-leaf/60 px-3 py-1 rounded-full self-start sm:self-auto">
          {language === 'gu' ? '૨.૫ એકર આધારિત ગણતરી' : '2.5 Acres Benchmark'}
        </span>
      </div>

      {/* Visual Bars */}
      <div className="space-y-4 font-sans text-xs">
        {/* Cost Bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-deep-forest">
            <span>{language === 'gu' ? 'વાવણી ખર્ચ (INPUT COST)' : 'INPUT COST'}</span>
            <span className="font-mono text-earth-brown">₹{cost.toLocaleString()}</span>
          </div>
          <div className="w-full h-4 bg-warm-cream rounded-full overflow-hidden border border-forest-green/10">
            <div className="h-full bg-earth-brown/70 rounded-full" style={{ width: `${costWidth}%` }} />
          </div>
        </div>

        {/* Revenue Bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-deep-forest">
            <span>{language === 'gu' ? 'કુલ આવક (GROSS REVENUE)' : 'GROSS REVENUE'}</span>
            <span className="font-mono text-forest-green">₹{revenue.toLocaleString()}</span>
          </div>
          <div className="w-full h-4 bg-warm-cream rounded-full overflow-hidden border border-forest-green/10">
            <div className="h-full bg-forest-green rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Net Profit Bar */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-deep-forest">
            <span>{language === 'gu' ? 'અંદાજિત ચોખ્ખો નફો (NET PROFIT)' : 'ESTIMATED NET PROFIT'}</span>
            <span className="font-mono text-leaf-green text-sm font-extrabold">₹{profit.toLocaleString()}</span>
          </div>
          <div className="w-full h-4 bg-warm-cream rounded-full overflow-hidden border border-forest-green/10">
            <div className="h-full bg-golden-wheat rounded-full" style={{ width: `${profitWidth}%` }} />
          </div>
        </div>
      </div>

      {/* Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
        <span>
          {language === 'gu'
            ? 'ડિસ્ક્લેમર: આપેલી રકમ આયોજન માટેના સંભવિત અંદાજો છે. વાસ્તવિક આવક ચોમાસાનો વરસાદ, માર્કેટ યાર્ડના ભાવ અને ખેતર સંભાળ પર આધાર રાખે છે.'
            : 'Disclaimer: Figures represent estimated potential returns. Actual financial outcomes depend on monsoon rainfall, market commodity prices, input prices, and crop management practices.'}
        </span>
      </div>
    </div>
  );
};

export default FarmEconomicsVisualizer;
