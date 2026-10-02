import React from 'react';

export const TornPaperEdge = ({ fillColor = "#FFF9E9", flip = false }) => {
  return (
    <div className={`w-full overflow-hidden leading-none z-20 relative ${flip ? 'rotate-180 -mt-1' : '-mb-1'}`}>
      <svg
        className="relative block w-full h-12 md:h-20"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 
             C150,90 350,-40 500,65 
             C650,140 900,-20 1050,75 
             C1150,115 1180,30 1200,50 
             L1200,120 L0,120 Z"
          fill={fillColor}
        />
        {/* Subtle fibrous edge detail */}
        <path
          d="M0,4 C140,84 360,-35 495,68 C645,138 905,-15 1045,78 L1200,53"
          stroke="#286B3F"
          strokeWidth="0.8"
          strokeOpacity="0.25"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default TornPaperEdge;
