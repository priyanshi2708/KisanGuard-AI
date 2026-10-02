import React from 'react';

export const GrassEdge = ({ fillColor = "#3B2417" }) => {
  return (
    <div className="w-full overflow-hidden leading-none z-20 relative -mb-1">
      <svg
        className="relative block w-full h-10 md:h-16 text-forest-green"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
      >
        {/* Layer 1: Soil fill */}
        <path
          d="M0,40 Q150,10 300,45 T600,20 T900,50 T1200,30 L1200,80 L0,80 Z"
          fill={fillColor}
        />
        {/* Layer 2: Grass blades SVG path */}
        <path
          d="M0,45 L15,15 L30,45 L45,10 L60,45 L75,20 L90,45 L105,5 L120,45 L135,25 L150,45
             L165,12 L180,45 L195,18 L210,45 L225,8 L240,45 L255,22 L270,45 L285,15 L300,45
             L315,10 L330,45 L345,20 L360,45 L375,5 L390,45 L405,25 L420,45 L435,12 L450,45
             L465,18 L480,45 L495,8 L510,45 L525,22 L540,45 L555,15 L570,45 L585,10 L600,45
             L615,20 L630,45 L645,5 L660,45 L675,25 L690,45 L705,12 L720,45 L735,18 L750,45
             L765,8 L780,45 L795,22 L810,45 L825,15 L840,45 L855,10 L870,45 L885,20 L900,45
             L915,5 L930,45 L945,25 L960,45 L975,12 L990,45 L1005,18 L1020,45 L1035,8 L1050,45
             L1065,22 L1080,45 L1095,15 L1110,45 L1125,10 L1140,45 L1155,20 L1170,45 L1185,12 L1200,45 L1200,80 L0,80 Z"
          fill="#286B3F"
        />
        {/* Layer 3: Accent bright grass blades */}
        <path
          d="M10,45 L20,25 L35,45 L50,18 L65,45 L80,28 L95,45 L110,12 L125,45 L140,30 L155,45
             L410,45 L425,20 L440,45 L700,45 L715,20 L730,45 L1010,45 L1025,20 L1040,45"
          fill="#65B741"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};

export default GrassEdge;
