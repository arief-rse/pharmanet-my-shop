
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-pharma-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h3 className="text-xl font-bold">PharmaEase</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Malaysia's trusted digital health platform connecting you with licensed local pharmacies 
              for safe, convenient, and secure health product shopping.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-pharma-blue cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-pharma-blue cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-pharma-blue cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Partner with Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">OTC Medicines</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Vitamins & Supplements</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Personal Care</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Baby & Mother Care</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">First Aid</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pharma-blue transition-colors">Health Devices</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Connected</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-pharma-blue" />
                <span className="text-gray-300 text-sm">+60 3-1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-pharma-blue" />
                <span className="text-gray-300 text-sm">support@pharmaease.my</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-pharma-blue mt-1" />
                <span className="text-gray-300 text-sm">
                  Level 15, Menara TM<br />
                  Jalan Pantai Baharu<br />
                  50672 Kuala Lumpur
                </span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-4">
              <p className="text-sm text-gray-300 mb-3">Get health tips & exclusive offers</p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button size="sm" className="bg-pharma-blue hover:bg-blue-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2026 PharmaEase. All rights reserved. | Licensed by Ministry of Health Malaysia
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>🇲🇾 Malaysia</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
