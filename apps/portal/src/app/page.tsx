import { LandingHeader } from '@/features/landing/header';
import { HeroSection } from '@/features/landing/hero-section';
import { AboutSection } from '@/features/landing/about-section';
import { FeaturesSection } from '@/features/landing/features-section';
import { HowItWorksSection } from '@/features/landing/how-it-works-section';
import { CTASection } from '@/features/landing/cta-section';
import { LandingFooter } from '@/features/landing/footer';

export default function LandingPage() {
  return (
    <div className='min-h-screen overflow-y-auto'>
      <LandingHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
