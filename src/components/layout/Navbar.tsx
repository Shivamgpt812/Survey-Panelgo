import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (hash: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${hash}`);
    }
  };

  const panelItems = [
    { label: 'B2B', path: '/panels/b2b' },
    { label: 'B2C', path: '/panels/b2c' },
    { label: 'Patients and Carers', path: '/panels/patients-carers' },
    { label: 'Healthcare professionals', path: '/panels/healthcare-professionals' },
  ];

  return (
    <nav className={`relative z-50 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/70 backdrop-blur-md border-b-2 border-navy/10 ${className}`}>
      <div className="w-full mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-3 min-w-0 text-left -ml-1 sm:-ml-0 cursor-pointer"
          aria-label="Survey Panel Go home"
        >
          <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-8">
          <a
            href="/#features"
            onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            How it works
          </a>
          <a
            href="/#services"
            onClick={(e) => { e.preventDefault(); handleNavClick('#services'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            Services
          </a>
          <a
            href="/#industries"
            onClick={(e) => { e.preventDefault(); handleNavClick('#industries'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            Industries
          </a>

          {/* Panel Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors flex items-center gap-1.5 py-2 cursor-pointer focus:outline-none"
            >
              <span>Panel</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 text-navy/70 group-hover:text-violet" />
            </button>
            <div className="absolute top-full left-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto z-50">
              <div className="bg-white rounded-2xl p-2 shadow-2xl border-2 border-navy/10 backdrop-blur-md">
                {panelItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                      }}
                      className={`block px-4 py-2.5 rounded-xl font-jakarta text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-violet bg-violet/10 font-bold'
                          : 'text-navy hover:text-violet hover:bg-periwinkle/50'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <a
            href="/#topics"
            onClick={(e) => { e.preventDefault(); handleNavClick('#topics'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            Topics
          </a>
          <a
            href="/#partners"
            onClick={(e) => { e.preventDefault(); handleNavClick('#partners'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            Associations
          </a>
          <a
            href="/#global"
            onClick={(e) => { e.preventDefault(); handleNavClick('#global'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            Throughout Global
          </a>
          <a
            href="/#contact"
            onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
            className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b-2 border-navy/10 shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            <a
              href="/#features"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }}
            >
              How it works
            </a>
            <a
              href="/#services"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#services'); }}
            >
              Services
            </a>
            <a
              href="/#industries"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#industries'); }}
            >
              Industries
            </a>

            {/* Mobile Panel Submenu */}
            <div>
              <button
                type="button"
                onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
                className="w-full flex items-center justify-between font-jakarta font-medium text-navy hover:text-violet transition-colors"
              >
                <span>Panel</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMobilePanelOpen ? 'rotate-180 text-violet' : 'text-navy/70'
                  }`}
                />
              </button>
              {isMobilePanelOpen && (
                <div className="mt-2 ml-3 pl-3 border-l-2 border-navy/10 flex flex-col space-y-2 pt-1 pb-1">
                  {panelItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        className={`font-jakarta text-sm font-medium transition-colors py-1 ${
                          isActive ? 'text-violet font-bold' : 'text-navy/80 hover:text-violet'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          navigate(item.path);
                        }}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href="/#topics"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#topics'); }}
            >
              Topics
            </a>
            <a
              href="/#partners"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#partners'); }}
            >
              Associations
            </a>
            <a
              href="/#global"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#global'); }}
            >
              Throughout Global
            </a>
            <a
              href="/#contact"
              className="font-jakarta font-medium text-navy hover:text-violet transition-colors"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
