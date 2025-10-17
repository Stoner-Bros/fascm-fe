import { LandingHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { AboutSection } from '@/components/landing/about-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CTASection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className='min-h-screen'>
      <LandingHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
