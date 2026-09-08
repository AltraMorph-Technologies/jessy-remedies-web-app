import { SiteHeader } from '@/components/site-header';
import {
  AboutSection,
  ApplicationCta,
  BenefitsSection,
  CalculatorSection,
  CompanyHighlights,
  FaqSection,
  HeroSection,
  ProcessSection,
  ProductsSection,
  SiteFooter,
} from '@/features/home';

export default function HomePage() {
  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-[#f7f8fb] text-[#101b36]"
    >
      <SiteHeader />
      <HeroSection />
      <CompanyHighlights />
      <ProductsSection />
      <CalculatorSection />
      <BenefitsSection />
      <AboutSection />
      <ProcessSection />
      <FaqSection />
      <ApplicationCta />
      <SiteFooter />
    </main>
  );
}
