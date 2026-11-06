'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ValuePropSection } from './ValuePropSection';
import { ProblemSection } from './ProblemSection';
import { ProductShowcaseSection } from './ProductShowcaseSection';
import { FeatureGridSection } from './FeatureGridSection';
import { CategoriesSection } from './CategoriesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { UseCasesSection } from './UseCasesSection';
import { SampleProjectSection } from './SampleProjectSection';
import { WhyDevBlueprintSection } from './WhyDevBlueprintSection';
import { PricingSection } from './PricingSection';
import { FaqSection } from './FaqSection';
import { FinalCtaSection } from './FinalCtaSection';
import { Footer } from './Footer';

export function LandingPageView() {
  const { initAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    initAuth();
  }, [initAuth, initTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors">
      {/* 1. Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Trust and Value Proposition */}
        <ValuePropSection />

        {/* 4. The Problem */}
        <ProblemSection />

        {/* 5. Product Showcase */}
        <ProductShowcaseSection />

        {/* 6. Feature Grid */}
        <FeatureGridSection />

        {/* 7. Documentation Categories */}
        <CategoriesSection />

        {/* 8. How It Works */}
        <HowItWorksSection />

        {/* 9. Use Cases */}
        <UseCasesSection />

        {/* 10. Sample Project Demonstration */}
        <SampleProjectSection />

        {/* 11. Why DevBlueprint */}
        <WhyDevBlueprintSection />

        {/* 12. Pricing */}
        <PricingSection />

        {/* 13. Frequently Asked Questions */}
        <FaqSection />

        {/* 14. Final CTA */}
        <FinalCtaSection />
      </main>

      {/* 15. Footer */}
      <Footer />
    </div>
  );
}

