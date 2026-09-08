import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayfulButton } from '@/components/ui/playful';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';

const statusConfig: Record<string, { label: string; color: string }> = {
  "1": { label: "Completed", color: "#22c55e" },
  "2": { label: "Terminated", color: "#ef4444" },
  "3": { label: "Quota Full", color: "#f59e0b" },
  "4": { label: "Security Terminated", color: "#6b7280" }
};

export default function SurveyResultCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const params = new URLSearchParams(location.search);

  // Helper function to navigate to dashboard or login
  const navigateToDashboard = () => {
    if (user) {
      if (user.panelType && user.panelType !== 'general') {
        navigate('/panels/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const pid = params.get("pid");
  const uid = params.get("uid");
  const status = params.get("status");
  const ip = params.get("ip");
  const time = params.get("time");
  const redirectUrl = params.get("redirect"); // New parameter for vendor redirect

  const config = status ? statusConfig[status] : { label: "Result", color: "#7C83FD" };

  // Function to parse comma-separated IPs
  const parseIPs = (ipString: string | null) => {
    if (!ipString) return { startIp: "N/A", endIp: "N/A" };
    
    const ips = ipString.split(',').map(ip => ip.trim());
    return {
      startIp: ips[0] || "N/A",
      endIp: ips[1] || ips[0] || "N/A"
    };
  };

  const { startIp, endIp } = parseIPs(ip);

  // Auto-redirect logic
  React.useEffect(() => {
    const checkVendorRedirect = async () => {
      // If redirect URL is already provided, use it
      if (redirectUrl) {
        setCountdown(2);
        const timer = setInterval(() => {
          setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
        }, 1000);

        const redirectTimer = setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);

        return () => {
          clearInterval(timer);
          clearTimeout(redirectTimer);
        };
      }

      // If no redirect URL but we have uid and status, check for vendor redirect
      if (uid && status && !redirectUrl) {
        try {
          const response = await fetch(`/api/redirect?uid=${uid}&status=${status}${pid ? `&pid=${pid}` : ''}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          const data = await response.json();
          
          if (data.success && data.redirectUrl) {
            setCountdown(2);
            const timer = setInterval(() => {
              setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
            }, 1000);

            const redirectTimer = setTimeout(() => {
              window.location.href = data.redirectUrl;
            }, 2000);

            return () => {
              clearInterval(timer);
              clearTimeout(redirectTimer);
            };
          }
        } catch (error) {
          console.warn("Failed to check vendor redirect:", error);
        }
      }
    };

    checkVendorRedirect();
  }, [redirectUrl, uid, status, pid]);

  return (
    <>
      <Navbar />

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

          {/* Redirect Countdown Alert */}
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-violet/5 border-2 border-violet/20 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-violet text-white rounded-full flex items-center justify-center font-bold text-xl animate-pulse">
                {countdown}
              </div>
              <div>
                <p className="font-bold text-navy">Redirecting to partner vendor...</p>
                <p className="text-sm text-navy-light italic">Your results are recorded. Please wait a moment.</p>
              </div>
            </motion.div>
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
              <span className="font-semibold">Start IP:</span> {startIp}
            </div>
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">End IP:</span> {endIp}
            </div>
            <div className="bg-[#F8FAFF] px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold">Time:</span>
              {time ? new Date(time).toLocaleString() : "N/A"}
            </div>
          </div>

          {/* Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={navigateToDashboard}
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
