
import { Shield, Users, Clock, Award } from 'lucide-react';

const trustFeatures = [
  {
    icon: Shield,
    title: "Licensed Pharmacies Only",
    description: "All partner pharmacies are verified and licensed by the Ministry of Health Malaysia",
    stat: "500+ Verified Partners"
  },
  {
    icon: Award,
    title: "MAL Registered Products",
    description: "Every product displays its official Malaysian Drug Registration Number for authenticity",
    stat: "100% Authentic"
  },
  {
    icon: Users,
    title: "Expert Pharmacist Support",
    description: "Get professional advice from qualified pharmacists for your health queries",
    stat: "24/7 Available"
  },
  {
    icon: Clock,
    title: "Fast & Secure Delivery",
    description: "Same-day delivery in major cities with secure packaging and tracking",
    stat: "2-4 Hours Delivery"
  }
];

const TrustSection = () => {
  return (
    <section className="py-16 bg-pharma-beige">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Trust PharmaEase?
          </h2>
          <p className="text-lg text-pharma-gray max-w-3xl mx-auto">
            We prioritize your health and safety by connecting you only with verified, licensed pharmacies 
            and ensuring every product meets Malaysian health standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <feature.icon className="w-8 h-8 text-pharma-blue" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-pharma-gray mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="inline-block bg-pharma-green text-white px-4 py-2 rounded-full text-sm font-semibold">
                {feature.stat}
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-semibold text-pharma-gray">Ministry of Health</p>
                <p className="text-xs text-pharma-gray">Malaysia Certified</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-semibold text-pharma-gray">SSL Secured</p>
                <p className="text-xs text-pharma-gray">256-bit Encryption</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-semibold text-pharma-gray">PCI Compliant</p>
                <p className="text-xs text-pharma-gray">Secure Payments</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-semibold text-pharma-gray">GDPR Compliant</p>
                <p className="text-xs text-pharma-gray">Privacy Protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
