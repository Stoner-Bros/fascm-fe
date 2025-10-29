import { LandingHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { TopProductsSection } from '@/components/landing/top-products-section';
import { AboutSection } from '@/components/landing/about-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { CTASection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/footer';
import { TrackingSection } from '@/components/landing';

export default function LandingPage() {
  return (
    <div className='min-h-screen'>
      <LandingHeader />
      <main>
        <HeroSection />
        <TopProductsSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TrackingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
