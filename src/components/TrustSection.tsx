
import { Shield, Users, Clock, Award, CheckCircle } from 'lucide-react';

const trustFeatures = [
  {
    icon: Shield,
    title: "Licensed Pharmacies Only",
    description: "All partner pharmacies are verified and licensed by the Ministry of Health Malaysia",
    stat: "500+",
    label: "Verified Partners",
    color: "primary"
  },
  {
    icon: Award,
    title: "MAL Registered Products",
    description: "Every product displays its official Malaysian Drug Registration Number for authenticity",
    stat: "100%",
    label: "Authentic",
    color: "secondary"
  },
  {
    icon: Users,
    title: "Expert Pharmacist Support",
    description: "Get professional advice from qualified pharmacists for your health queries",
    stat: "24/7",
    label: "Available",
    color: "info"
  },
  {
    icon: Clock,
    title: "Fast & Secure Delivery",
    description: "Same-day delivery in major cities with secure packaging and tracking",
    stat: "2-4 Hours",
    label: "Delivery",
    color: "warning"
  }
];

const trustBadges = [
  { title: "Ministry of Health", subtitle: "Malaysia Certified" },
  { title: "SSL Secured", subtitle: "256-bit Encryption" },
  { title: "PCI Compliant", subtitle: "Secure Payments" },
  { title: "GDPR Compliant", subtitle: "Privacy Protected" }
];

const TrustSection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background-subtle/50 to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-light border border-secondary/20 rounded-full mb-4">
            <CheckCircle className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Trusted by Malaysians</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Trust PharmaEase?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We prioritize your health and safety by connecting you only with verified, licensed pharmacies
            and ensuring every product meets Malaysian health standards.
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className="card-elevated bg-card h-full p-8 text-center space-y-4 rounded-2xl">
                {/* Icon with gradient background */}
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <div className={`absolute inset-0 bg-${feature.color}/10 rounded-2xl group-hover:scale-110 transition-transform duration-300`}></div>
                  <div className={`relative w-full h-full flex items-center justify-center rounded-2xl bg-${feature.color}/5 group-hover:bg-${feature.color} transition-colors duration-300`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color} group-hover:text-${feature.color}-foreground transition-colors duration-300`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Stat Badge */}
                <div className="pt-2">
                  <div className={`inline-flex flex-col items-center px-6 py-3 bg-${feature.color}-light rounded-xl`}>
                    <span className={`text-2xl font-bold text-${feature.color}`}>{feature.stat}</span>
                    <span className={`text-sm font-medium text-${feature.color}`}>{feature.label}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="pt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wide">
            Certified & Secured By
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="group">
                <div className="glass rounded-xl p-6 hover:shadow-soft transition-smooth min-w-[160px]">
                  <p className="text-sm font-semibold text-foreground text-center mb-1">
                    {badge.title}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
