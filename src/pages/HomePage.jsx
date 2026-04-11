import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FlowSection from '../components/FlowSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FlowSection />
      <FlowSection flowKey="online" />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </>
  );
}