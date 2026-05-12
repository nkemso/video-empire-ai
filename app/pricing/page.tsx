import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
}
