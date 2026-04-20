import Navbar from '../components/Customer/Navbar';
import HeroSection from '../components/Customer/HeroSection';
import FlowSection from '../components/Customer/FlowSection';
import TestimonialsSection from '../components/Customer/TestimonialsSection';
import CTASection from '../components/Customer/CTASection';
import Footer from '../components/Customer/Footer';

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