import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrustSection from '@/components/TrustSection';
// import NationwideDeliveryCarousel from '@/components/NationwideDeliveryCarousel';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FeaturedProducts />
      <TrustSection />
      {/* <NationwideDeliveryCarousel /> */}
      <Footer />
    </div>
  );
};

export default Index;
