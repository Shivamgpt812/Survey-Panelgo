import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from 'lucide-react';
import { PlayfulButton } from '@/components/ui/playful';
import { BrandLogo } from '@/components/brand/BrandLogo';

const statusConfig: Record<string, { label: string; color: string }> = {
  "1": { label: "Completed", color: "#22c55e" },
  "2": { label: "Terminated", color: "#ef4444" },
  "3": { label: "Quota Full", color: "#f59e0b" },
  "4": { label: "Security Terminated", color: "#6b7280" }
};

export default function SurveyResultCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const params = new URLSearchParams(location.search);

  const pid = params.get("pid");
  const uid = params.get("uid");
  const status = params.get("status");
  const ip = params.get("ip");
  const time = params.get("time");
  const vendorRedirect = params.get("vendor_redirect");

  useEffect(() => {
    if (vendorRedirect) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = vendorRedirect;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [vendorRedirect]);

  const config = status ? statusConfig[status] : { label: "Result", color: "#7C83FD" };

  return (
    <>
      {/* Navigation */}
      <nav className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/70 backdrop-blur-md border-b-2 border-navy/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 min-w-0 text-left -ml-1 sm:-ml-0"
            aria-label="Survey Panel Go home"
          >
            <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/about" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              About
            </Link>
            <Link to="/services" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Services
            </Link>
            <Link to="/blog" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Blog
            </Link>
            <a href="/#contact" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <PlayfulButton variant="secondary" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </PlayfulButton>
            <PlayfulButton variant="primary" size="sm" onClick={() => navigate('/auth?mode=signup')}>
              Join Our Panel
            </PlayfulButton>
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
              <Link to="/about" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/services" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Services
              </Link>
              <Link to="/blog" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Blog
              </Link>
              <a href="/#contact" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-navy/10">
                <PlayfulButton variant="secondary" size="sm" onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}>
                  Sign In
                </PlayfulButton>
                <PlayfulButton variant="primary" size="sm" onClick={() => { navigate('/auth?mode=signup'); setIsMobileMenuOpen(false); }}>
                  Join Our Panel
                </PlayfulButton>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-[#EEF2FF] flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Playful Background Elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>

        {/* Premium Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 transition-all duration-500 hover:scale-[1.02] relative z-10"
        >
          {/* Status Header */}
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: config.color }}
            >
              ✓
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: config.color }}
            >
              {config.label}
            </h1>
          </div>

          {/* Redirect Hint */}
          {vendorRedirect && (
            <div className="bg-violet/10 border border-violet/20 p-4 rounded-xl mb-6 flex items-center justify-between">
              <span className="text-navy font-medium">Redirecting you to provider in {countdown}...</span>
              <button
                onClick={() => window.location.href = vendorRedirect}
                className="text-violet font-bold hover:underline"
              >
                Go Now →
              </button>
            </div>
          )}

          {/* Data Grid */}
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4 text-sm md:text-base">
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">PID:</span> {pid || "N/A"}
            </div>
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">UID:</span> {uid || "N/A"}
            </div>
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">Status:</span> {config.label}
            </div>
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">IP:</span> {ip || "N/A"}
            </div>
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">Time:</span>
              {time ? new Date(time).toLocaleString() : "N/A"}
            </div>
          </div>

          {/* Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7C83FD, #A5B4FC)"
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 pt-12 pb-10 border-t-2 border-navy/10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start justify-between">
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" className="max-h-9 max-w-[150px]" />
              </div>
              <p className="font-jakarta text-navy-light leading-relaxed">
                At Survey PanelGo, we bring a rigorous approach to quantitative methodologies designed to decode complex markets and empower organizations worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
              <div className="space-y-3">
                <h3 className="font-outfit font-bold text-navy">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#about" className="font-jakarta text-navy-light hover:text-violet transition-colors">About Us</a></li>
                  <li><a href="#careers" className="font-jakarta text-navy-light hover:text-violet transition-colors">Careers</a></li>
                  <li><a href="#press" className="font-jakarta text-navy-light hover:text-violet transition-colors">Press Kit</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-outfit font-bold text-navy">Services</h3>
                <ul className="space-y-2">
                  <li><a href="#surveys" className="font-jakarta text-navy-light hover:text-violet transition-colors">Survey Solutions</a></li>
                  <li><a href="#analytics" className="font-jakarta text-navy-light hover:text-violet transition-colors">Analytics</a></li>
                  <li><a href="#consulting" className="font-jakarta text-navy-light hover:text-violet transition-colors">Consulting</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-outfit font-bold text-navy">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#blog" className="font-jakarta text-navy-light hover:text-violet transition-colors">Blog</a></li>
                  <li><a href="#case-studies" className="font-jakarta text-navy-light hover:text-violet transition-colors">Case Studies</a></li>
                  <li><a href="#whitepapers" className="font-jakarta text-navy-light hover:text-violet transition-colors">Whitepapers</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-outfit font-bold text-navy">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#privacy" className="font-jakarta text-navy-light hover:text-violet transition-colors">Privacy Policy</a></li>
                  <li><a href="#terms" className="font-jakarta text-navy-light hover:text-violet transition-colors">Terms of Service</a></li>
                  <li><a href="#cookies" className="font-jakarta text-navy-light hover:text-violet transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-navy/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-jakarta text-navy-light text-sm">
              © 2024 Survey PanelGo. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#linkedin" className="text-navy-light hover:text-violet transition-colors">
                LinkedIn
              </a>
              <a href="#twitter" className="text-navy-light hover:text-violet transition-colors">
                Twitter
              </a>
              <a href="#facebook" className="text-navy-light hover:text-violet transition-colors">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
