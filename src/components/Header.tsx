import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageToggle, useLanguage } from '@/components/ui/language-toggle';
import { useAuth } from '@/hooks/useAuth';
import CartIcon from './CartIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, userProfile, signOut, hasRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pharma-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P+</span>
            </div>
            <span className="text-xl font-bold text-pharma-blue">PharmaEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pharma-blue transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-pharma-blue transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-pharma-blue transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-pharma-blue transition-colors">
              {t('nav.about')}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <LanguageToggle className="hidden sm:flex" />
            <CartIcon />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  {userProfile?.role === 'consumer' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/consumer-dashboard')}>
                        My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        Orders
                      </DropdownMenuItem>
                    </>
                  )}
                  {userProfile?.role === 'vendor' && (
                    <DropdownMenuItem onClick={() => navigate('/vendor-dashboard')}>
                      Vendor Dashboard
                    </DropdownMenuItem>
                  )}
                  {userProfile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="bg-pharma-blue hover:bg-blue-700"
              >
                {t('nav.login')}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-pharma-blue transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-pharma-blue transition-colors">
                {t('nav.products')}
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-pharma-blue transition-colors">
                Categories
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-pharma-blue transition-colors">
                {t('nav.about')}
              </Link>
              
              {/* Mobile Search */}
              <div className="pt-4">
                <form onSubmit={handleMobileSearch} className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </form>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
