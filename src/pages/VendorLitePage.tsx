import { useState, useEffect } from 'react';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';

interface Vendor {
  id: number;
  name: string;
  complete_url: string;
  terminate_url: string;
  quota_full_url: string;
  VendorSurveys?: VendorSurvey[];
}

interface VendorSurvey {
  id: number;
  title: string;
  token: string;
  vendor_id: number;
}

export default function VendorLitePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");

  const [vendorForm, setVendorForm] = useState({
    name: '',
    complete_url: '',
    terminate_url: '',
    quota_full_url: ''
  });

  const [surveyForm, setSurveyForm] = useState({
    title: '',
    vendor_id: 0
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    console.log("📦 Vendors state updated:", vendors);
  }, [vendors]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:3000/vendor-lite/vendor');
      const data = await response.json();
      console.log("📦 Vendors fetched:", data);
      
      // Handle both array and wrapped response formats
      const vendorsArray = Array.isArray(data) ? data : (data.vendors || []);
      
      // Transform _id to id for frontend compatibility
      const transformedVendors = vendorsArray.map((vendor: any) => ({
        ...vendor,
        id: vendor._id || vendor.id
      }));
      
      console.log("🔄 Transformed vendors:", transformedVendors);
      setVendors(transformedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/vendor-lite/vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorForm),
      });

      const data = await response.json();
      if (data.success) {
        setVendorForm({ name: '', complete_url: '', terminate_url: '', quota_full_url: '' });
        setShowCreateVendor(false);
        fetchVendors();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📊 Survey Form:", surveyForm);
    console.log("🎯 Selected Vendor:", selectedVendor);
    console.log("📦 Available Vendors:", vendors);
    
    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/vendor-lite/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: surveyForm.title,
          vendor_id: selectedVendor
        }),
      });

      const data = await response.json();
      console.log("🚀 Survey Created:", data);
      
      if (data.success) {
        setSurveyForm({ title: '', vendor_id: 0 });
        setSelectedVendor("");
        setShowCreateSurvey(false);
        fetchVendors();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPublicSurveyLink = (token: string) => {
    return `${window.location.origin}/v/${token}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-jakarta font-bold text-navy mb-2">Vendor Survey System</h1>
          <p className="text-gray-600">Create vendor surveys and generate public links</p>
        </div>

        <div className="mb-6">
          <PlayfulButton
            variant="primary"
            onClick={() => setShowCreateVendor(true)}
          >
            Create New Vendor
          </PlayfulButton>
        </div>

        {showCreateVendor && (
          <PlayfulCard className="mb-6">
            <h3 className="text-xl font-jakarta font-semibold text-navy mb-4">Create New Vendor</h3>
            <form onSubmit={createVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complete URL</label>
                <input
                  type="url"
                  required
                  value={vendorForm.complete_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, complete_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terminate URL</label>
                <input
                  type="url"
                  required
                  value={vendorForm.terminate_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, terminate_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quota Full URL</label>
                <input
                  type="url"
                  required
                  value={vendorForm.quota_full_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, quota_full_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div className="flex gap-2">
                <PlayfulButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  isLoading={loading}
                >
                  Create Vendor
                </PlayfulButton>
                <PlayfulButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateVendor(false)}
                >
                  Cancel
                </PlayfulButton>
              </div>
            </form>
          </PlayfulCard>
        )}

        {showCreateSurvey && (
          <PlayfulCard className="mb-6">
            <h3 className="text-xl font-jakarta font-semibold text-navy mb-4">Create New Survey</h3>
            <form onSubmit={createSurvey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
                <input
                  type="text"
                  required
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
                <select
                  required
                  value={selectedVendor}
                  onChange={(e) => {
                    console.log("✅ Selected Vendor:", e.target.value);
                    setSelectedVendor(e.target.value);
                    setSurveyForm({ ...surveyForm, vendor_id: parseInt(e.target.value) });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <PlayfulButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  isLoading={loading}
                >
                  Create Survey
                </PlayfulButton>
                <PlayfulButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateSurvey(false)}
                >
                  Cancel
                </PlayfulButton>
              </div>
            </form>
          </PlayfulCard>
        )}

        <div className="grid gap-6">
          {vendors.map((vendor) => (
            <PlayfulCard key={vendor.id}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-jakarta font-semibold text-navy">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">ID: {vendor.id}</p>
                </div>
                <PlayfulButton
                  variant="secondary"
                  onClick={() => {
                    setSurveyForm({ ...surveyForm, vendor_id: vendor.id });
                    setSelectedVendor(vendor.id.toString());
                    setShowCreateSurvey(true);
                  }}
                >
                  Create Survey
                </PlayfulButton>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Complete:</span> 
                  <a href={vendor.complete_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    {vendor.complete_url}
                  </a>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Terminate:</span> 
                  <a href={vendor.terminate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    {vendor.terminate_url}
                  </a>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Quota Full:</span> 
                  <a href={vendor.quota_full_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    {vendor.quota_full_url}
                  </a>
                </div>
              </div>

              {vendor.VendorSurveys && vendor.VendorSurveys.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-navy mb-2">Surveys</h4>
                  <div className="space-y-2">
                    {vendor.VendorSurveys.map((survey) => (
                      <div key={survey.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{survey.title}</p>
                          <p className="text-sm text-gray-600">Token: {survey.token}</p>
                        </div>
                        <div className="text-right">
                          <a
                            href={getPublicSurveyLink(survey.token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline block"
                          >
                            {getPublicSurveyLink(survey.token)}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PlayfulCard>
          ))}
        </div>
      </div>
    </div>
  );
}
