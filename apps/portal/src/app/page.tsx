import { LandingHeader } from '@/features/landing/header';
import { HeroSection } from '@/features/landing/hero-section';
import { TopProductsSection } from '@/features/landing/top-products-section';
import { AboutSection } from '@/features/landing/about-section';
import { FeaturesSection } from '@/features/landing/features-section';
import { HowItWorksSection } from '@/features/landing/how-it-works-section';
import { CTASection } from '@/features/landing/cta-section';
import { LandingFooter } from '@/features/landing/footer';
import { TrackingSection } from '@/features/landing';

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
