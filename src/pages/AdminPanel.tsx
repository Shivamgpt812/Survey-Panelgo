import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const BASE_URL = "https://survey-panelgo.onrender.com";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();
  
  const userData = JSON.parse(localStorage.getItem("surveypanelgo_auth") || "{}");
  const uid = userData?.id || userData?._id;
  const [pid, setPid] = useState("");

  const links = [
    {
      label: "Completed",
      url: `${BASE_URL}/api/redirect?pid=${pid}&uid=${uid}&status=1` 
    },
    {
      label: "Terminated",
      url: `${BASE_URL}/api/redirect?pid=${pid}&uid=${uid}&status=2` 
    },
    {
      label: "Quota Full",
      url: `${BASE_URL}/api/redirect?pid=${pid}&uid=${uid}&status=3` 
    },
    {
      label: "Security Terminated",
      url: `${BASE_URL}/api/redirect?pid=${pid}&uid=${uid}&status=4` 
    }
  ];

  const statusLinks = [
    {
      label: "Completed",
      url: `${BASE_URL}/api/redirect?status=1&uid=${uid}` 
    },
    {
      label: "Terminated",
      url: `${BASE_URL}/api/redirect?status=2&uid=${uid}` 
    },
    {
      label: "Quota Full",
      url: `${BASE_URL}/api/redirect?status=3&uid=${uid}` 
    },
    {
      label: "Security",
      url: `${BASE_URL}/api/redirect?status=4&uid=${uid}` 
    }
  ];

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully!', 'info');
    navigate('/auth');
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('Link copied to clipboard!', 'success');
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-violet-600" />
              </button>
              <BrandLogo size="sm" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <PlayfulButton
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </PlayfulButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PID Input Section */}
        <PlayfulCard className="mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey PID</h2>
            <input
              placeholder="Enter PID"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              className="w-full md:w-[300px] border px-3 py-2 rounded-lg mb-4"
            />
          </div>
        </PlayfulCard>

        {/* Redirect Links Section */}
        <PlayfulCard className="mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Redirect Links</h2>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
                  <span className="font-medium w-full md:w-[150px]">
                    {link.label}
                  </span>
                  <input
                    value={link.url}
                    readOnly
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                  />
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      className="w-full md:w-auto px-3 py-2 bg-blue-500 text-white rounded-lg"
                      onClick={() => handleCopy(link.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="w-full md:w-auto px-3 py-2 bg-green-500 text-white rounded-lg"
                      onClick={() => handleOpen(link.url)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PlayfulCard>

        {/* Status Links Section */}
        <PlayfulCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Links</h2>
            <div className="space-y-3">
              {statusLinks.map((link, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl shadow-sm">
                  <span className="font-medium w-full md:w-[150px]">
                    {link.label}
                  </span>
                  <input
                    value={link.url}
                    readOnly
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                  />
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      className="w-full md:w-auto px-3 py-2 bg-blue-500 text-white rounded-lg"
                      onClick={() => handleCopy(link.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="w-full md:w-auto px-3 py-2 bg-green-500 text-white rounded-lg"
                      onClick={() => handleOpen(link.url)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PlayfulCard>
      </main>
    </div>
  );
};

export default AdminPanel;
