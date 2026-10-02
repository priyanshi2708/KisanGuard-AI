import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TornPaperEdge from '../components/TornPaperEdge';

import HeroSection from '../sections/HeroSection';
import DecisionSection from '../sections/DecisionSection';
import FeatureLandscape from '../sections/FeatureLandscape';
import SoilRootsSection from '../sections/SoilRootsSection';
import MadeForFarmersSection from '../sections/MadeForFarmersSection';
import AiAssistantSection from '../sections/AiAssistantSection';
import FarmBookSection from '../sections/FarmBookSection';
import FinalCtaSection from '../sections/FinalCtaSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-warm-cream font-sans overflow-x-hidden">
      <Navbar />

      {/* Section 1: Hero */}
      <HeroSection />

      {/* Organic Torn Paper Edge Transition */}
      <TornPaperEdge fillColor="#FFF9E9" />

      {/* Section 2: Decision Storytelling */}
      <DecisionSection />

      {/* Section 3: Feature Landscape */}
      <FeatureLandscape />

      {/* Section 4: Soil + Roots Timeline */}
      <SoilRootsSection />

      {/* Section 5: Made for Farmers */}
      <MadeForFarmersSection />

      {/* Section 6: AI Assistant */}
      <AiAssistantSection />

      {/* Section 7: Digital Farm Book */}
      <FarmBookSection />

      {/* Section 8: Final CTA */}
      <FinalCtaSection />

      <Footer />
    </div>
  );
};

export default LandingPage;
