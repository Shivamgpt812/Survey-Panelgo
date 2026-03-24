import React, { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { PlayfulCard } from '@/components/ui/playful';
import { useToast } from '@/hooks/useToast';
import AdminLayout from '@/components/layout/AdminLayout';

const BASE_URL = "https://survey-panelgo.onrender.com";

const AdminPanel: React.FC = () => {
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

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('Link copied to clipboard!', 'success');
  };

  const handleOpen = (url: string) => {
    console.log("Opening redirect:", url);
    window.open(url, '_blank');
  };

  const handleOpenWithValidation = (url: string) => {
    if (!pid) {
      alert("Enter PID first");
      return;
    }
    console.log("Opening redirect:", url);
    window.open(url, '_blank');
  };

  return (
    <AdminLayout 
      title="Admin Panel" 
      subtitle="Generate redirect links for surveys"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PID Input Section */}
        <PlayfulCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey PID</h2>
            <input
              placeholder="Enter PID"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              className="w-full max-w-md border px-3 py-2 rounded-lg"
            />
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
      </div>

      {/* Redirect Links Section - Full Width */}
      <PlayfulCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Redirect Links</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    className="w-full md:w-auto px-3 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handleOpenWithValidation(link.url)}
                    disabled={!pid}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PlayfulCard>
    </AdminLayout>
  );
};

export default AdminPanel;
