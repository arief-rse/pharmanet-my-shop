
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-toggle';
import { Shield, Truck, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-to-br from-background via-background-subtle to-primary-light/10 py-20 md:py-28 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light border border-primary/20 rounded-full animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Malaysia's #1 Digital Health Platform</span>
            </div>

            {/* Main heading */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-foreground">Your Health,</span>{' '}
                <span className="gradient-text">Delivered</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-6 text-base shadow-glow btn-glow group"
              >
                {t('hero.shopNow')}
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-base transition-smooth"
              >
                {t('hero.joinPartner')}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="p-2 bg-secondary-light rounded-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-foreground">{t('hero.licensedPharmacies')}</span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="p-2 bg-info-light rounded-lg group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5 text-info" />
                </div>
                <span className="text-sm font-medium text-foreground">{t('hero.fastDelivery')}</span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="p-2 bg-warning-light rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <span className="text-sm font-medium text-foreground">{t('hero.support247')}</span>
              </div>
            </div>
          </div>

          {/* Right content - Feature cards with glass effect */}
          <div className="relative animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full"></div>

            <div className="relative space-y-4">
              {/* Card 1 */}
              <div className="glass rounded-2xl p-6 card-elevated hover:shadow-glow transition-smooth group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-smooth">
                    <Shield className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-foreground">500+ Licensed Pharmacies</h3>
                    <p className="text-muted-foreground text-sm">Verified by Ministry of Health Malaysia</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass rounded-2xl p-6 card-elevated hover:shadow-glow-green transition-smooth group ml-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary group-hover:scale-110 transition-smooth">
                    <Truck className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-foreground">{t('delivery.sameDay')}</h3>
                    <p className="text-muted-foreground text-sm">{t('delivery.klangValley')}, {t('delivery.penang')} & {t('delivery.johorBahru')}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass rounded-2xl p-6 card-elevated hover:shadow-glow transition-smooth group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-smooth">
                    <Sparkles className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-foreground">MAL Verified Products</h3>
                    <p className="text-muted-foreground text-sm">Only authentic medicines & supplements</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
