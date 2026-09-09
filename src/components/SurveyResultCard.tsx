import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayfulButton } from '@/components/ui/playful';
import { Navbar } from '@/components/layout/Navbar';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/api';

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

  const initialPid =
    params.get("pid") ||
    params.get("projectid") ||
    params.get("projectId") ||
    params.get("project_id") ||
    params.get("survey_id") ||
    params.get("surveyId") ||
    params.get("sid") ||
    params.get("project") ||
    "";

  const [pid, setPid] = useState(initialPid);
  const uid = params.get("uid");
  const rawStatus = params.get("status");
  const ip = params.get("ip");
  const time = params.get("time");
  const redirectUrl = params.get("redirect");

  // Infer status code from pathname if not in query
  const inferStatus = (): string => {
    if (rawStatus) return rawStatus;
    const path = location.pathname.toLowerCase();
    if (path.includes('terminated')) return '2';
    if (path.includes('quota')) return '3';
    if (path.includes('security')) return '4';
    if (path.includes('success')) return '1';
    return '1';
  };

  const status = inferStatus();
  const config = statusConfig[status] || { label: "Result", color: "#7C83FD" };

  // State to avoid flashing our card when vendor redirect exists
  const [isCheckingVendor, setIsCheckingVendor] = useState(Boolean(uid || redirectUrl));
  const [isVendorRedirecting, setIsVendorRedirecting] = useState(false);

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

  // Instant vendor redirect logic
  useEffect(() => {
    let active = true;

    const checkVendorRedirect = async () => {
      // 1. If an explicit redirect URL parameter was provided
      if (redirectUrl) {
        setIsVendorRedirecting(true);
        window.location.replace(redirectUrl);
        return;
      }

      // 2. If UID is present, query backend to see if this UID belongs to a vendor session
      if (uid) {
        try {
          const queryParams = new URLSearchParams({
            uid: uid.trim(),
            status,
          });
          if (pid) queryParams.set('pid', pid.trim());

          const response = await fetch(`${API_BASE_URL}/api/redirect?${queryParams.toString()}`, {
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            if (active) setIsCheckingVendor(false);
            return;
          }

          const data = await response.json();

          if (data.pid && (!pid || pid.startsWith('AUTO_'))) {
            setPid(data.pid);
          }

          if (active && data.success && data.hasVendorRedirect && data.redirectUrl) {
            setIsVendorRedirecting(true);
            window.location.replace(data.redirectUrl);
            return;
          }
        } catch (error) {
          console.warn("Vendor redirect lookup error:", error);
        }
      }

      if (active) {
        setIsCheckingVendor(false);
      }
    };

    checkVendorRedirect();

    return () => {
      active = false;
    };
  }, [redirectUrl, uid, status, pid]);

  // When checking for or performing a vendor redirect, do NOT display our card
  if (isCheckingVendor || isVendorRedirecting) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-jakarta text-navy font-medium text-sm">
          {isVendorRedirecting ? 'Redirecting to vendor...' : 'Processing results...'}
        </p>
      </div>
    );
  }

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
              <span className="font-semibold">Time:</span>{' '}
              {(() => {
                if (!time) return "N/A";
                const d = new Date(time);
                return isNaN(d.getTime()) ? time : d.toLocaleString();
              })()}
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
