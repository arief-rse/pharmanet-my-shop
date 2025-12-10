import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiltedCard, TiltedCardContent } from '@/components/ui/tilted-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Heart, 
  Clock, 
  Users, 
  Award, 
  Truck, 
  Phone, 
  Mail,
  MapPin,
  Star,
  CheckCircle,
  Target,
  Globe,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '50,000+', color: 'text-blue-600' },
    { icon: Stethoscope, label: 'Licensed Pharmacists', value: '100+', color: 'text-green-600' },
    { icon: Award, label: 'Years of Experience', value: '15+', color: 'text-purple-600' },
    { icon: Globe, label: 'Cities Served', value: '25+', color: 'text-red-600' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'We prioritize patient safety with rigorous quality checks and certified products from licensed manufacturers.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Heart,
      title: 'Patient Care',
      description: 'Our mission is to provide accessible, affordable healthcare solutions to improve lives across communities.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'Every product undergoes strict quality control measures to ensure authenticity and effectiveness.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Clock,
      title: 'Reliable Service',
      description: '24/7 support and fast delivery to ensure you get the medications you need when you need them.',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Pharmacist',
      qualification: 'PharmD, RPh',
      experience: '12 years',
      image: '/placeholder.svg'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Medical Director',
      qualification: 'MD, Internal Medicine',
      experience: '15 years',
      image: '/placeholder.svg'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Quality Assurance Lead',
      qualification: 'PharmD, Quality Control',
      experience: '10 years',
      image: '/placeholder.svg'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Customer Care Director',
      qualification: 'MBA, Healthcare Management',
      experience: '8 years',
      image: '/placeholder.svg'
    }
  ];

  const services = [
    {
      icon: Truck,
      title: 'Free Home Delivery',
      description: 'Fast and secure delivery to your doorstep across all major cities.',
      features: ['Same-day delivery', 'Temperature controlled', 'Secure packaging']
    },
    {
      icon: Phone,
      title: '24/7 Consultation',
      description: 'Round-the-clock pharmacist consultation for medication guidance.',
      features: ['Licensed pharmacists', 'Drug interaction checks', 'Dosage guidance']
    },
    {
      icon: UserCheck,
      title: 'Prescription Management',
      description: 'Digital prescription tracking and automated refill reminders.',
      features: ['Digital records', 'Refill alerts', 'Insurance processing']
    },
    {
      icon: Shield,
      title: 'Verified Products',
      description: 'All medications are sourced from licensed manufacturers and distributors.',
      features: ['FDA approved', 'Batch tracking', 'Expiry monitoring']
    }
  ];

  const milestones = [
    { year: '2009', event: 'PharmaEase founded with a vision to democratize healthcare access' },
    { year: '2012', event: 'Expanded to 5 major cities, serving 10,000+ customers' },
    { year: '2015', event: 'Launched 24/7 pharmacist consultation service' },
    { year: '2018', event: 'Introduced temperature-controlled delivery for sensitive medications' },
    { year: '2020', event: 'Achieved 99.9% customer satisfaction rating during pandemic' },
    { year: '2022', event: 'Partnered with 500+ healthcare providers nationwide' },
    { year: '2024', event: 'Serving 50,000+ customers across 25+ cities' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              Trusted Healthcare Partner Since 2009
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your Health, Our <span className="text-blue-600">Priority</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              At PharmaEase, we're committed to making quality healthcare accessible to everyone. 
              With over 15 years of experience, we've been serving communities with trusted pharmaceutical 
              solutions and expert care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/products')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Products
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe healthcare should be accessible, affordable, and reliable. Our core values guide 
              everything we do, from product sourcing to customer service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <TiltedCard key={index} className="text-center border-gray-200" tiltAmount={10} glowEffect={true}>
                <TiltedCardContent className="p-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${value.color}`}>
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </TiltedCardContent>
              </TiltedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to meet your needs with convenience and care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our team of licensed healthcare professionals is dedicated to providing you with 
              the best pharmaceutical care and guidance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <TiltedCard key={index} className="text-center border-gray-200" tiltAmount={8} glowEffect={true}>
                <TiltedCardContent className="p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-1">{member.qualification}</p>
                  <p className="text-sm text-gray-500">{member.experience} experience</p>
                </TiltedCardContent>
              </TiltedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a small pharmacy to a leading online healthcare platform, 
              here's how we've grown to serve you better.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">{milestone.year}</span>
                  </div>
                  <div className="flex-1 pt-4">
                    <p className="text-gray-700 leading-relaxed">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our services or need assistance? Our team is here to help you 24/7.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+1 (555) 123-PHARMACY</p>
              <p className="text-sm text-gray-500">24/7 Support Available</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">support@pharmaease.com</p>
              <p className="text-sm text-gray-500">Response within 1 hour</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Healthcare Ave</p>
              <p className="text-sm text-gray-500">New York, NY 10001</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Join Our Community
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About; 