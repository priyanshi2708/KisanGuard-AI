import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PlantingTimelineVisualizer = ({ cropId = "groundnut" }) => {
  const { language } = useLanguage();

  const timeline = [
    {
      weekGu: "અઠવાડિયું ૧",
      weekEn: "Week 1",
      phaseGu: "જમીનની ખેડ અને ખાતર ઉમેરવું",
      phaseEn: "Soil Preparation",
      descGu: "ખેતરની ઊંડી ખેડ કરો, પ્રતિ એકર ૫ ટન સેન્દ્રિય દેશી ખાતર અથવા કમ્પોસ્ટ ઉમેરો."
    },
    {
      weekGu: "અઠવાડિયું ૨",
      weekEn: "Week 2",
      phaseGu: "બીજ માવજત અને વાવણી",
      phaseEn: "Seed Selection & Sowing",
      descGu: "પ્રમાણિત બીજને ટ્રાઇકોડર્મા પાવડરની પટ આપી ૪૫ સેમીના અંતરે વાવણી કરો."
    },
    {
      weekGu: "અઠવાડિયું ૪",
      weekEn: "Week 4",
      phaseGu: "પ્રથમ પીયત અને નિંદામણ",
      phaseEn: "First Irrigation & Weeding",
      descGu: "જમીનમાં ભેજ ચકાસી પ્રથમ પીયત આપો અને આંતરખેડ કરી નિંદામણ દૂર કરો."
    },
    {
      weekGu: "અઠવાડિયું ૭",
      weekEn: "Week 7",
      phaseGu: "ફૂલ બેસવા અને જિપ્સમ આપવું",
      phaseEn: "Flowering & Gypsum Application",
      descGu: "સૂય બેસવાની અવસ્થાએ પ્રતિ એકર ૧૦૦ કિગ્રા જિપ્સમ આપો જેથી કાળી મજબૂત બને."
    },
    {
      weekGu: "અઠવાડિયું ૧૧",
      weekEn: "Week 11",
      phaseGu: "પોપટા ભરાવા અને રોગ તપાસ",
      phaseEn: "Pod Filling & Inspection",
      descGu: "પાંદડા પર ગેરુ કે ટપકાં રોગની તપાસ કરો. જમીનમાં હળવો ભેજ જાળવી રાખો."
    },
    {
      weekGu: "અઠવાડિયું ૧૪-૧૬",
      weekEn: "Week 14–16",
      phaseGu: "પાકની લણણી અને સુકવણી",
      phaseEn: "Harvesting & Curing",
      descGu: "છોડ પીળા પડે ત્યારે છોડ ઉપાડી લણણી કરો. ૩-૪ દિવસ તડકામાં બરાબર સુકવો."
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/15 space-y-6 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-green" />
            <span>{language === 'gu' ? '📅 વાવણીથી લણણી સુધીનું અઠવાડિયાવાર આયોજન' : '📅 YOUR CROP PLAN & TIMELINE'}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu' ? 'જમીનની તૈયારીથી લઈને લણણી સુધી ખેતરના મુખ્ય કાર્યો' : 'Week-by-week field tasks from soil preparation to harvesting'}
          </p>
        </div>

        <span className="text-xs font-bold text-forest-green bg-light-leaf/60 px-3 py-1 rounded-full self-start sm:self-auto">
          {language === 'gu' ? '૧૪ અઠવાડિયાનું શેડ્યૂલ' : '14-Week Schedule'}
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-dashed border-forest-green/30 space-y-6">
        {timeline.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="relative space-y-1"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full bg-forest-green text-white flex items-center justify-center text-xs font-bold shadow">
              <Sprout className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-light-leaf/80 text-forest-green font-mono">
                {language === 'gu' ? item.weekGu : item.weekEn}
              </span>
              <h3 className="font-bold font-serif text-sm sm:text-base text-deep-forest">
                {language === 'gu' ? item.phaseGu : item.phaseEn}
              </h3>
            </div>

            <p className="text-xs text-earth-brown leading-relaxed font-medium">
              {language === 'gu' ? item.descGu : item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlantingTimelineVisualizer;
