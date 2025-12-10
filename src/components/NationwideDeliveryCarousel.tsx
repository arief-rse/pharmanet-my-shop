import React, { useState, useEffect, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TiltedCard, TiltedCardContent } from '@/components/ui/tilted-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  Timer,
  Navigation,
  Play,
  Pause
} from 'lucide-react';
import { DELIVERY_ZONES, MALAYSIAN_STATES } from '@/lib/malaysia-data';
import { MalaysianCurrency } from '@/components/ui/malaysian-currency';
import { cn } from '@/lib/utils';

const deliveryFeatures = [
  {
    icon: Truck,
    title: "Nationwide Coverage",
    description: "We deliver to all 13 states in Malaysia",
    highlight: "100% Coverage",
    color: "from-blue-500 to-blue-600",
    stats: "13 States"
  },
  {
    icon: Clock,
    title: "Same Day Delivery",
    description: "Available in major cities including KL, Selangor & Penang",
    highlight: "Same Day",
    color: "from-green-500 to-green-600",
    stats: "Orders by 2PM"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Temperature-controlled delivery for medicines",
    highlight: "Secure",
    color: "from-purple-500 to-purple-600",
    stats: "100% Safe"
  },
  {
    icon: Package,
    title: "Free Delivery",
    description: "Free shipping on orders above minimum amount",
    highlight: "Free Shipping",
    color: "from-orange-500 to-orange-600",
    stats: "From RM150"
  },
  {
    icon: Zap,
    title: "Express Service",
    description: "Next-day delivery for urgent medications",
    highlight: "Express",
    color: "from-red-500 to-red-600",
    stats: "Next Day"
  }
];

const deliveryStats = [
  { label: "Cities Covered", value: "200+", icon: MapPin },
  { label: "Daily Deliveries", value: "5,000+", icon: Package },
  { label: "Customer Rating", value: "4.9/5", icon: Star },
  { label: "On-Time Rate", value: "99.5%", icon: Timer }
];

interface NationwideDeliveryCarouselProps {
  className?: string;
  autoPlay?: boolean;
  showStats?: boolean;
}

export const NationwideDeliveryCarousel: React.FC<NationwideDeliveryCarouselProps> = ({
  className = "",
  autoPlay = true,
  showStats = true
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuresIndex, setFeaturesIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [featuresApi, setFeaturesApi] = useState<CarouselApi>();
  const [zonesApi, setZonesApi] = useState<CarouselApi>();

  // Track current slide index
  useEffect(() => {
    if (!featuresApi) return;

    const onSelect = () => {
      setFeaturesIndex(featuresApi.selectedScrollSnap());
    };

    featuresApi.on("select", onSelect);
    onSelect();

    return () => {
      featuresApi.off("select", onSelect);
    };
  }, [featuresApi]);

  // Auto-play functionality for features carousel
  useEffect(() => {
    if (!featuresApi || !isPlaying) return;
    
    const interval = setInterval(() => {
      if (featuresApi.canScrollNext()) {
        featuresApi.scrollNext();
      } else {
        featuresApi.scrollTo(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [featuresApi, isPlaying]);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const scrollToFeature = useCallback((index: number) => {
    if (featuresApi) {
      featuresApi.scrollTo(index);
    }
  }, [featuresApi]);

  return (
    <section className={cn("py-16 bg-gradient-to-br from-blue-50 via-white to-green-50", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Navigation className="w-4 h-4" />
            <span>Nationwide Delivery Network</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🇲🇾 Delivering Healthcare 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              {" "}Nationwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From Perlis to Johor, we ensure your medications reach you safely and on time
          </p>
        </div>

        {/* Stats Section */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {deliveryStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Features Carousel */}
        <div className="max-w-6xl mx-auto mb-12 relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            setApi={setFeaturesApi}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {deliveryFeatures.map((feature, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <TiltedCard 
                    className="h-full" 
                    tiltAmount={8} 
                    glowEffect={true}
                  >
                    <TiltedCardContent className="p-6 h-full">
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0`}>
                            {feature.highlight}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {feature.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">Available</span>
                          <span className={`text-lg font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                            {feature.stats}
                          </span>
                        </div>
                      </div>
                    </TiltedCardContent>
                  </TiltedCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-12 w-10 h-10 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50" />
            <CarouselNext className="-right-12 w-10 h-10 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50" />
          </Carousel>
          
          {/* Autoplay Control */}
          {autoPlay && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 z-10"
              onClick={toggleAutoplay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
                     )}
          
          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {deliveryFeatures.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === featuresIndex 
                    ? "bg-blue-600 w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                onClick={() => scrollToFeature(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Delivery Zones Carousel */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Delivery Zones & Pricing
          </h3>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            setApi={setZonesApi}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {Object.entries(DELIVERY_ZONES).map(([zoneName, zoneInfo], index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <TiltedCard 
                    className="h-full border-2 hover:border-blue-500 transition-colors" 
                    tiltAmount={6}
                  >
                    <TiltedCardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{zoneName}</h4>
                        {zoneInfo.sameDayAvailable && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Same Day
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Free delivery above</span>
                          <MalaysianCurrency 
                            amount={zoneInfo.freeDeliveryThreshold} 
                            size="sm" 
                            className="font-semibold text-green-600" 
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Standard delivery</span>
                          <MalaysianCurrency 
                            amount={zoneInfo.standardCharge} 
                            size="sm" 
                            className="font-semibold" 
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Express delivery</span>
                          <MalaysianCurrency 
                            amount={zoneInfo.expressCharge} 
                            size="sm" 
                            className="font-semibold text-blue-600" 
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-2">States covered:</div>
                        <div className="flex flex-wrap gap-1">
                          {zoneInfo.states.slice(0, 3).map((stateCode) => {
                            const state = MALAYSIAN_STATES.find(s => s.code === stateCode);
                            return (
                              <Badge key={stateCode} variant="secondary" className="text-xs">
                                {state?.name}
                              </Badge>
                            );
                          })}
                          {zoneInfo.states.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{zoneInfo.states.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TiltedCardContent>
                  </TiltedCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-12 w-10 h-10" />
            <CarouselNext className="-right-12 w-10 h-10" />
          </Carousel>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Ready to Get Your Medications Delivered?</h3>
          <p className="text-blue-100 mb-6">Join thousands of satisfied customers across Malaysia</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Package className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <MapPin className="w-5 h-5 mr-2" />
              Check Coverage
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NationwideDeliveryCarousel; 