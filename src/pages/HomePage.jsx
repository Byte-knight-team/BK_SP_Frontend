import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import StepsSection from '../components/StepsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ExperienceSection from '../components/ExperienceSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <TestimonialsSection />
      <ExperienceSection />
      <CTASection />
      <Footer />
    </>
  );
}
