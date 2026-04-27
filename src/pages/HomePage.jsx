import Navbar from '../components/Customer/Navbar';
import HeroSection from '../components/customer/HeroSection';
import FlowSection from '../components/customer/FlowSection';
import TestimonialsSection from '../components/customer/TestimonialsSection';
import CTASection from '../components/customer/CTASection';
import Footer from '../components/customer/Footer';

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
