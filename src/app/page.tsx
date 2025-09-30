'use client';

import HeroSection from '@/components/homepage/HeroSection';
import ServicesSection from '@/components/homepage/ServicesSection';
import DifferentiatorSection from '@/components/homepage/DifferentiatorSection';
import ClientLogosSection from '@/components/homepage/ClientLogosSection';
import TestimonialSection from '@/components/homepage/TestimonialSection';
import FAQSection from '@/components/homepage/FAQSection';
import FinalCTASection from '@/components/homepage/FinalCTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-stretch justify-start">
      <HeroSection />
      <ClientLogosSection />
      <ServicesSection />
      <DifferentiatorSection />
      <TestimonialSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  );
}