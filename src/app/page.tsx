import HeroSection from '@/components/homepage/HeroSection'
import DifferentiatorSection from '@/components/homepage/DifferentiatorSection'
import ServicesSection from '@/components/homepage/ServicesSection'
import CaseStudiesSection from '@/components/homepage/CaseStudiesSection'
import ClientLogosSection from '@/components/homepage/ClientLogosSection'
import TestimonialSection from '@/components/homepage/TestimonialSection'
import FAQSection from '@/components/homepage/FAQSection'
import FinalCTASection from '@/components/homepage/FinalCTASection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <DifferentiatorSection />
      <ServicesSection />
      <CaseStudiesSection />
      <ClientLogosSection />
      <TestimonialSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  )
}