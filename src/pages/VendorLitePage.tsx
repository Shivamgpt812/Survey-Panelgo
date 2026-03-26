import React, { useState, useEffect } from 'react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { useSearchParams } from 'react-router-dom';

interface Vendor {
  id: string;
  name: string;
  complete_url: string;
  terminate_url: string;
  quota_full_url: string;
}

interface Question {
  text: string;
  options: string[];
  type: 'multiple-choice' | 'rating' | 'text';
}

export default function VendorLitePage() {
  const [searchParams] = useSearchParams();

  const [isExternalMode, setIsExternalMode] = useState(false);
  const [extSurvey, setExtSurvey] = useState<any>(null);
  const [extAnswers, setExtAnswers] = useState<Record<string, string>>({});
  const [extCurrentStep, setExtCurrentStep] = useState(0);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'external') {
      const rid = searchParams.get('rid') || '';
      const transactionId = searchParams.get('transactionId') || '';
      const token = searchParams.get('token') || '';

      console.log('🚀 External Entry detected (staying on same page):', { rid, transactionId, token });

      // Persist values
      localStorage.setItem('ext_rid', rid);
      localStorage.setItem('ext_transactionId', transactionId);
      localStorage.setItem('ext_token', token);

      setIsExternalMode(true);

      // Load survey data directly into this component
      const apiUrl = import.meta.env.PROD
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      fetch(`${apiUrl}/external/data/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setExtSurvey(data.survey);
          } else {
            alert("Survey not found");
          }
        })
        .catch(err => console.error("Error fetching external survey:", err));
    }
  }, [searchParams]);

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

  const [surveyForm, setSurveyForm] = useState<{
    title: string;
    vendor_id: number;
    pid: string;
    type: 'internal' | 'external';
    externalLink: string;
  }>({
    title: '',
    vendor_id: 0,
    pid: '',
    type: 'internal',
    externalLink: ''
  });

  const [extQuestions, setExtQuestions] = useState([{ text: "", correctAnswer: "" }]);

  const [preScreenerQuestions, setPreScreenerQuestions] = useState([
    {
      type: 'age',
      question: 'What is your age?',
      operator: '>=',
      value: 18,
      enabled: false
    },
    {
      type: 'gender',
      question: 'What is your gender?',
      operator: '=',
      value: '',
      options: ['Male', 'Female', 'Other'],
      enabled: false
    }
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    { text: '', options: [''], type: 'multiple-choice' }
  ]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [vendorSurveyLinks, setVendorSurveyLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    console.log("📦 Vendors state updated:", vendors);
  }, [vendors]);

  useEffect(() => {
    // Save survey links to localStorage whenever they change
    localStorage.setItem('vendorSurveyLinks', JSON.stringify(vendorSurveyLinks));
  }, [vendorSurveyLinks]);

  // Load saved links after vendors are fetched
  useEffect(() => {
    if (vendors.length > 0) {
      const savedLinks = localStorage.getItem('vendorSurveyLinks');
      if (savedLinks) {
        try {
          setVendorSurveyLinks(JSON.parse(savedLinks));
        } catch (error) {
          console.error('Error loading saved links:', error);
        }
      }
    }
  }, [vendors.length]);

  const fetchVendors = async () => {
    try {
      const apiUrl = import.meta.env.PROD
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/vendor-lite/vendor`);
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
      const apiUrl = import.meta.env.PROD
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/vendor-lite/vendor`, {
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
    console.log("❓ Questions:", questions);

    if (surveyForm.type === 'internal' && !selectedVendor) {
      alert("Please select a vendor");
      return;
    }

    // Validate questions - only for internal surveys
    if (surveyForm.type === 'internal') {
      const validQuestions = questions.filter(q => q.text.trim() && ((q.type === 'multiple-choice' && q.options.some(o => o.trim())) || (q.type !== 'multiple-choice')));
      if (validQuestions.length === 0) {
        alert("Please add at least one question");
        return;
      }
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.PROD
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      if (surveyForm.type === 'internal') {
        const response = await fetch(`${apiUrl}/vendor-lite/survey`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: surveyForm.title,
            vendor_id: selectedVendor,
            pid: surveyForm.pid,
            preScreenerQuestions: preScreenerQuestions.filter(q => q.enabled),
            questions: questions.filter(q => q.text.trim() && ((q.type === 'multiple-choice' && q.options.some(o => o.trim())) || (q.type !== 'multiple-choice'))),
            type: surveyForm.type,
            externalLink: undefined
          }),
        });

        const data = await response.json();
        console.log("🚀 Survey Created:", data);

        if (data.success) {
          const link = getPublicSurveyLink(data.token, surveyForm.pid);
          setGeneratedLink(link);

          // Save link to vendor's survey links
          setVendorSurveyLinks(prev => ({
            ...prev,
            [selectedVendor]: link
          }));

          // Reset form
          setSurveyForm({
            title: '',
            vendor_id: 0,
            pid: '',
            type: 'internal' as 'internal' | 'external',
            externalLink: ''
          });
          setSelectedVendor("");
          setQuestions([{ text: '', options: [''], type: 'multiple-choice' }]);
          setShowCreateSurvey(false);
          fetchVendors();
        } else {
          alert('Error: ' + data.message);
        }
      } else {
        // External survey flow
        const vendorObj = vendors.find(v => v.id === selectedVendor);
        if (!vendorObj) {
          alert('Please select a vendor for external routing');
          return;
        }

        const response = await fetch(`${apiUrl}/external/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: surveyForm.title,
            externalUrl: surveyForm.externalLink,
            questions: extQuestions,
            vendor: vendorObj
          })
        });

        const data = await response.json();
        if (data.success) {
          const link = data.link; // Generated by backend
          setGeneratedLink(link); // Display to user

          // Reset
          setSurveyForm({
            title: '',
            vendor_id: 0,
            pid: '',
            type: 'internal',
            externalLink: ''
          });
          setExtQuestions([{ text: "", correctAnswer: "" }]);
          setShowCreateSurvey(false);
        } else {
          alert('Error: ' + (data.message || 'Server error'));
        }
      }
    } catch (error) {
      console.error('Error creating survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPublicSurveyLink = (token: string, pid: string) => {
    // Generate a random UID for the survey
    const uid = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${window.location.origin}/v/${token}?pid=${pid}&uid=${uid}`;
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: [''], type: 'multiple-choice' }]);
  };

  const updateQuestion = (index: number, field: 'text' | 'options' | 'type', value: string | string[] | 'multiple-choice' | 'rating' | 'text') => {
    const updated = [...questions];
    if (field === 'text') {
      updated[index].text = value as string;
    } else if (field === 'type') {
      updated[index].type = value as 'multiple-choice' | 'rating' | 'text';
      // Reset options when changing type
      if (value === 'multiple-choice') {
        updated[index].options = [''];
      } else {
        updated[index].options = [];
      }
    } else {
      updated[index].options = value as string[];
    }
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  /**
   * Respondent Handle Submit (External Flow)
   */
  const handleExtSubmit = () => {
    if (!extSurvey) return;

    const rid = localStorage.getItem("ext_rid") || "";
    const transactionId = localStorage.getItem("ext_transactionId") || "";

    // PART 5: PRESCREENER VALIDATION
    let passed = true;
    (extSurvey.questions || []).forEach((q: any, i: number) => {
      if ((extAnswers[`q_${i}`] || '').trim() !== (q.correctAnswer || '').trim()) {
        passed = false;
      }
    });

    // FAIL → vendor terminate URL
    if (!passed) {
      console.log("❌ External Prescreener Failed");
      const terminateBase = extSurvey.vendor?.terminate_url || "/survey-result/terminated";
      const sep = terminateBase.includes("?") ? "&" : "?";
      window.location.href = `${terminateBase}${sep}rid=${rid}&transactionId=${transactionId}&status=2`;
      return;
    }

    // PASS → External Survey (redirect directly to configured external URL)
    let finalUrl = extSurvey.externalUrl;

    // Replace placeholders
    finalUrl = finalUrl.replace('[#userid#]', rid);
    finalUrl = finalUrl.replace('[#transaction_id#]', transactionId);

    console.log("🚀 Redirecting to External Survey:", finalUrl);
    window.location.href = finalUrl;
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const updatePreScreenerQuestion = (index: number, field: string, value: any) => {
    const updated = [...preScreenerQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setPreScreenerQuestions(updated);
  };

  const togglePreScreenerEnabled = (index: number) => {
    const updated = [...preScreenerQuestions];
    updated[index].enabled = !updated[index].enabled;
    setPreScreenerQuestions(updated);
  };

  // ---------------------------------------------------------------------------
  // RESPONDENT UI (EXTERNAL FLOW ONLY)
  // ---------------------------------------------------------------------------
  if (isExternalMode) {
    if (!extSurvey) return <div className="min-h-screen bg-violet-50 flex items-center justify-center font-jakarta font-bold text-violet">Loading Prescreener...</div>;

    const currentQuestion = extSurvey.questions[extCurrentStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center p-4">
        <PlayfulCard className="max-w-2xl w-full p-8 md:p-12 shadow-2xl">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-jakarta font-bold text-navy mb-2">{extSurvey.title}</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-violet to-pink rounded-full mb-6 mx-auto md:mx-0"></div>
            <p className="text-gray-500 font-medium">Question {extCurrentStep + 1} of {extSurvey.questions.length}</p>
          </div>

          <div className="mb-10">
            <div className="bg-violet/5 p-6 rounded-2xl mb-6">
              <h3 className="text-xl font-bold text-gray-800">{currentQuestion.text}</h3>
            </div>
            <input
              type="text"
              placeholder="Your answer..."
              value={extAnswers[`q_${extCurrentStep}`] || ''}
              onChange={(e) => setExtAnswers({ ...extAnswers, [`q_${extCurrentStep}`]: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (extAnswers[`q_${extCurrentStep}`] || '').trim() && (extCurrentStep < extSurvey.questions.length - 1 ? setExtCurrentStep(extCurrentStep + 1) : handleExtSubmit())}
              className="w-full px-6 py-4 text-lg border-2 border-violet/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all bg-white shadow-sm"
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center">
            {extCurrentStep > 0 && (
              <button
                onClick={() => setExtCurrentStep(extCurrentStep - 1)}
                className="text-gray-500 font-semibold hover:text-violet transition-colors flex items-center"
              >
                <span className="mr-2">←</span> Previous
              </button>
            )}
            <div className="ml-auto">
              {extCurrentStep < extSurvey.questions.length - 1 ? (
                <PlayfulButton
                  variant="primary"
                  onClick={() => setExtCurrentStep(extCurrentStep + 1)}
                  disabled={!(extAnswers[`q_${extCurrentStep}`] || '').trim()}
                >
                  Next Question →
                </PlayfulButton>
              ) : (
                <PlayfulButton
                  variant="primary"
                  onClick={handleExtSubmit}
                  disabled={!(extAnswers[`q_${extCurrentStep}`] || '').trim()}
                >
                  Finish & Start Survey
                </PlayfulButton>
              )}
            </div>
          </div>
        </PlayfulCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-jakarta font-bold text-navy mb-2">Vendor Survey System</h1>
          <p className="text-gray-600">Create vendor surveys and generate public links</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <PlayfulButton
            variant="primary"
            onClick={() => setShowCreateVendor(true)}
            className="min-w-[180px]"
          >
            Create New Vendor
          </PlayfulButton>
          <PlayfulButton
            variant="secondary"
            onClick={() => setShowCreateSurvey(true)}
            className="min-w-[180px]"
          >
            Create New Survey
          </PlayfulButton>
        </div>

        {showCreateVendor && (
          <PlayfulCard className="mb-6 p-8">
            <h3 className="text-2xl font-jakarta font-semibold text-navy mb-8">Create New Vendor</h3>
            <form onSubmit={createVendor} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Complete URL</label>
                <input
                  type="url"
                  required
                  value={vendorForm.complete_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, complete_url: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Terminate URL</label>
                <input
                  type="url"
                  required
                  value={vendorForm.terminate_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, terminate_url: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quota Full URL</label>
                <input
                  type="url"
                  required
                  value={vendorForm.quota_full_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, quota_full_url: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <PlayfulButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  isLoading={loading}
                  className="px-8 py-3 text-lg"
                >
                  Create Vendor
                </PlayfulButton>
                <PlayfulButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateVendor(false)}
                  className="px-8 py-3 text-lg"
                >
                  Cancel
                </PlayfulButton>
              </div>
            </form>
          </PlayfulCard>
        )}

        {showCreateSurvey && (
          <PlayfulCard className="mb-6 p-8">
            <h3 className="text-2xl font-jakarta font-semibold text-navy mb-8">Create New Survey</h3>
            <form onSubmit={createSurvey} className="space-y-6">
              {/* Survey Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Survey Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-violet hover:bg-violet/5 transition-all">
                    <input
                      type="radio"
                      name="surveyType"
                      value="internal"
                      checked={surveyForm.type === 'internal'}
                      onChange={(e) => setSurveyForm({ ...surveyForm, type: e.target.value as 'internal' | 'external' })}
                      className="mr-3 text-violet focus:ring-violet"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">Internal Survey</div>
                      <div className="text-sm text-gray-500">Create questions manually</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-violet hover:bg-violet/5 transition-all">
                    <input
                      type="radio"
                      name="surveyType"
                      value="external"
                      checked={surveyForm.type === 'external'}
                      onChange={(e) => setSurveyForm({ ...surveyForm, type: e.target.value as 'internal' | 'external' })}
                      className="mr-3 text-violet focus:ring-violet"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">External Survey</div>
                      <div className="text-sm text-gray-500">Redirect to external link</div>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Survey Title</label>
                <input
                  type="text"
                  required
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Vendor</label>
                <select
                  required
                  value={selectedVendor}
                  onChange={(e) => {
                    console.log("✅ Selected Vendor:", e.target.value);
                    setSelectedVendor(e.target.value);
                    setSurveyForm({ ...surveyForm, vendor_id: parseInt(e.target.value) });
                  }}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">PID (Project ID)</label>
                <input
                  type="text"
                  required
                  value={surveyForm.pid}
                  onChange={(e) => setSurveyForm({ ...surveyForm, pid: e.target.value })}
                  placeholder="Enter project ID (e.g., PROJ123)"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                />
              </div>

              {/* External Link Input - Only show for external surveys */}
              {surveyForm.type === 'external' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">External Survey Link</label>
                    <input
                      type="url"
                      required
                      value={surveyForm.externalLink}
                      onChange={(e) => setSurveyForm({ ...surveyForm, externalLink: e.target.value })}
                      placeholder="https://external-survey.com/survey-link"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Users will be redirected to this external survey link
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Prescreener Questions (External)</label>
                    <div className="space-y-6">
                      {extQuestions.map((q, i) => (
                        <div key={i} className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl space-y-3">
                          <div className="flex gap-2">
                            <input
                              placeholder="Enter prescreener question"
                              value={q.text}
                              onChange={(e) => {
                                const updated = [...extQuestions];
                                updated[i].text = e.target.value;
                                setExtQuestions(updated);
                              }}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet"
                            />
                            {extQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setExtQuestions(extQuestions.filter((_, idx) => idx !== i))}
                                className="px-3 text-red-500 hover:bg-red-50 rounded-xl"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Correct Answer (Case Sensitive)</label>
                            <input
                              placeholder="Respondent must type this exactly"
                              value={q.correctAnswer}
                              onChange={(e) => {
                                const updated = [...extQuestions];
                                updated[i].correctAnswer = e.target.value;
                                setExtQuestions(updated);
                              }}
                              className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setExtQuestions([...extQuestions, { text: "", correctAnswer: "" }])}
                        className="text-violet font-semibold hover:underline"
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pre-Screener Questions Section - Only show for internal surveys */}
              {surveyForm.type === 'internal' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <label className="block text-base font-semibold text-gray-700">Pre-Screener Questions</label>
                    <span className="text-sm text-gray-500">Set criteria to qualify users</span>
                  </div>

                  {preScreenerQuestions.map((preScreen, index) => (
                    <div key={index} className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preScreen.enabled}
                            onChange={() => togglePreScreenerEnabled(index)}
                            className="mr-3 w-5 h-5 text-violet focus:ring-violet focus:ring-2"
                          />
                          <label className="text-base font-semibold text-gray-700">
                            {preScreen.type === 'age' ? 'Age Requirement' : 'Gender Requirement'}
                          </label>
                        </div>
                      </div>

                      {preScreen.enabled && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                            <input
                              type="text"
                              value={preScreen.question}
                              onChange={(e) => updatePreScreenerQuestion(index, 'question', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet"
                            />
                          </div>

                          {preScreen.type === 'age' ? (
                            <div className="flex items-center space-x-2">
                              <label className="text-xs font-medium text-gray-600">Must be</label>
                              <select
                                value={preScreen.operator}
                                onChange={(e) => updatePreScreenerQuestion(index, 'operator', e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet"
                              >
                                <option value=">=">&gt;= (At least)</option>
                                <option value=">">&gt; (Greater than)</option>
                                <option value="<=">&lt;= (At most)</option>
                                <option value="<">&lt; (Less than)</option>
                              </select>
                              <input
                                type="number"
                                value={preScreen.value}
                                onChange={(e) => updatePreScreenerQuestion(index, 'value', parseInt(e.target.value))}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet"
                              />
                              <label className="text-xs font-medium text-gray-600">years old</label>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <label className="text-xs font-medium text-gray-600">Must be</label>
                              <select
                                value={preScreen.value}
                                onChange={(e) => updatePreScreenerQuestion(index, 'value', e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet"
                              >
                                <option value="">Select gender</option>
                                {preScreen.options?.map((option: string) => (
                                  <option key={option} value={option}>{option}</option>
                                )) || []}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Questions Section - Only show for internal surveys */}
              {surveyForm.type === 'internal' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Questions</label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-3 py-1 text-sm bg-violet text-white rounded-lg hover:bg-violet/80 transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>

                  {questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Enter question text"
                          value={question.text}
                          onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="rating">Rating (1-5 Stars)</option>
                          <option value="text">Text Box</option>
                        </select>
                      </div>

                      {/* Show options only for multiple-choice questions */}
                      {question.type === 'multiple-choice' && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-gray-700">Options</label>
                            <button
                              type="button"
                              onClick={() => addOption(questionIndex)}
                              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              + Add Option
                            </button>
                          </div>

                          {question.options.map((option, optionIndex) => (
                            <input
                              key={optionIndex}
                              type="text"
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                            />
                          ))}
                        </div>
                      )}

                      {/* Show rating scale for rating questions */}
                      {question.type === 'rating' && (
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Rating Scale: 1-5 Stars</p>
                          <p className="text-sm text-gray-600">Users will be able to rate from 1 to 5 stars</p>
                        </div>
                      )}

                      {/* Show info for text questions */}
                      {question.type === 'text' && (
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Open Text Answer</p>
                          <p className="text-sm text-gray-600">Users will be able to type a text response</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

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

        {/* Generated Link Section */}
        {generatedLink && (
          <PlayfulCard className="mb-6">
            <h3 className="text-xl font-jakarta font-semibold text-navy mb-4">🎉 Survey Created Successfully!</h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Public Survey Link:</p>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {generatedLink}
              </a>
              <div className="mt-3">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => setGeneratedLink('')}
                  className="ml-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </PlayfulCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <PlayfulCard key={vendor.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-jakarta font-semibold text-navy mb-2">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">ID: {vendor.id}</p>
                </div>
                <PlayfulButton
                  variant="secondary"
                  onClick={() => {
                    setSurveyForm({ ...surveyForm, vendor_id: parseInt(vendor.id) });
                    setSelectedVendor(vendor.id);
                    setShowCreateSurvey(true);
                  }}
                  className="shrink-0"
                >
                  Create Survey
                </PlayfulButton>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Complete:</div>
                  <a href={vendor.complete_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                    {vendor.complete_url}
                  </a>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Terminate:</div>
                  <a href={vendor.terminate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                    {vendor.terminate_url}
                  </a>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Quota Full:</div>
                  <a href={vendor.quota_full_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                    {vendor.quota_full_url}
                  </a>
                </div>
              </div>

              {/* Display saved survey link if exists */}
              {vendorSurveyLinks[vendor.id] && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">📋 Survey Link:</p>
                  <a
                    href={vendorSurveyLinks[vendor.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                  >
                    {vendorSurveyLinks[vendor.id]}
                  </a>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(vendorSurveyLinks[vendor.id])}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => {
                        setVendorSurveyLinks(prev => {
                          const newLinks = { ...prev };
                          delete newLinks[vendor.id];
                          return newLinks;
                        });
                      }}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      🗑️ Remove
                    </button>
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
