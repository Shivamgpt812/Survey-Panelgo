import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function VendorSurveyPublicPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get PID and UID from URL parameters
  const pid = searchParams.get('pid') || '';
  const uid = searchParams.get('uid') || '';

  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showPreScreener, setShowPreScreener] = useState(false);
  const [preScreenerAnswers, setPreScreenerAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (token) {
      fetchSurvey();
    }
  }, [token]);

  // Handle external survey redirect
  // If the respondent arrived via /external/router, localStorage will have
  // ext_rid and ext_transactionId which must be forwarded to the external URL.
  useEffect(() => {
    // ONLY auto-redirect for OLD internal surveys that have externalLink set 
    // AND don't have questions. The NEW external flow HAS questions (prescreener).
    if (survey?.externalLink && !survey.questions?.length && !survey.isExternalFlow) {
      console.log("=== EXTERNAL SURVEY REDIRECT DEBUG (OLD FLOW) ===");
      // ... same as before ...
      const rid = localStorage.getItem('ext_rid') || '';
      const transactionId = localStorage.getItem('ext_transactionId') || '';

      const buildExternalUrl = (base: string) => {
        const url = new URL(base);
        if (rid) url.searchParams.set('rid', rid);
        if (transactionId) url.searchParams.set('transactionId', transactionId);
        if (uid) url.searchParams.set('uid', uid);
        return url.toString();
      };

      const finalUrl = buildExternalUrl(survey.externalLink);
      window.location.href = finalUrl;
    }
  }, [survey?.externalLink, survey]);

  useEffect(() => {
    // Auto-start survey flow when survey is loaded and we have URL parameters
    if (survey && pid && uid) {
      console.log("=== URL PARAMETERS DEBUG ===");
      console.log("PID from URL:", pid);
      console.log("UID from URL:", uid);
      console.log("Survey PID from survey:", survey.pid);

      // Show pre-screener if survey has pre-screener questions, otherwise show survey
      if (survey?.preScreenerQuestions?.length > 0) {
        setShowPreScreener(true);
      }
    }
  }, [survey, pid, uid]);

  const fetchSurvey = async () => {
    try {
      // Multiple environment detection strategies for Netlify
      const isProduction = import.meta.env.PROD ||
        window.location.hostname !== 'localhost' ||
        window.location.hostname.includes('netlify.app');

      let apiUrl = isProduction
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      console.log("🔍 Environment Detection:", {
        importMetaEnvProd: import.meta.env.PROD,
        hostname: window.location.hostname,
        isProduction,
        finalApiUrl: apiUrl
      });

      // Try external survey data first if it looks like an external token or if mode=external is in localStorage
      const isExternalToken = token && !/^[0-9a-fA-F]{24}$/.test(token);
      if (isExternalToken || localStorage.getItem('ext_token') === token) {
        try {
          const extRes = await fetch(`${apiUrl}/external/data/${token}`);
          const extData = await extRes.json();
          if (extData.success) {
            // Transform for compatibility with public page expectations
            const enrichedSurvey = {
              ...extData.survey,
              isExternalFlow: true,
              pid: 'EXTERNAL',
              questions: extData.survey.questions.map((q: any) => ({
                ...q,
                type: 'text'
              }))
            };
            setSurvey(enrichedSurvey);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.log("Not an external survey or external endpoint failed, trying internal...");
        }
      }

      // Try production API first, fallback to localhost if it fails
      let response;
      let data;

      try {
        response = await fetch(`${apiUrl}/vendor-lite/survey/${token}`);
        data = await response.json();
        console.log("📊 Primary API Response:", data);
      } catch (primaryError) {
        console.warn("⚠️ Primary API failed, trying fallback:", primaryError);

        // Fallback to localhost for development/testing
        if (isProduction) {
          apiUrl = 'http://localhost:3000';
          response = await fetch(`${apiUrl}/vendor-lite/survey/${token}`);
          data = await response.json();
          console.log("📊 Fallback API Response:", data);
        } else {
          throw primaryError;
        }
      }

      if (data.success) {
        setSurvey(data.survey);
        console.log("✅ Survey loaded successfully:", data.survey);
      } else {
        console.error("❌ Survey not found:", data);
        alert('Survey not found or invalid');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Critical error fetching survey:', error);
      alert('Unable to load survey. The survey may not exist or there might be a network issue. Please try again later.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handlePreScreenerAnswer = (questionType: string, value: any) => {
    setPreScreenerAnswers(prev => ({
      ...prev,
      [questionType]: value
    }));
  };

  const handlePreScreenerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== PRE SCREENER VALIDATION DEBUG ===");
    console.log("userId (from URL):", uid);
    console.log("token:", token);
    console.log("preScreenerAnswers:", preScreenerAnswers);

    // Submit pre-screener answers for validation
    try {
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
      const apiUrl = isProduction
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/vendor-lite/validate-pre-screener?pid=${encodeURIComponent(pid)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          preScreenerAnswers,
          userId: uid
        }),
      });

      console.log("🚀 Pre-screener validation URL:", `${apiUrl}/vendor-lite/validate-pre-screener?pid=${encodeURIComponent(pid)}`);

      const data = await response.json();
      console.log("Pre-screener validation response:", data);
      console.log("Success:", data.success);
      console.log("Terminated:", data.terminated);
      console.log("Redirect URL:", data.redirectUrl);

      if (data.success && !data.terminated) {
        // Passed pre-screener, show survey questions
        console.log("Pre-screener PASSED - showing survey questions");
        setShowPreScreener(false);
      } else if (data.terminated) {
        // Failed pre-screener, redirect to terminate URL
        console.log("Pre-screener FAILED - redirecting to terminate URL");
        alert(`You do not meet the survey criteria: ${data.reason}`);
        window.location.href = data.redirectUrl;
      } else {
        // Any validation error should terminate the user
        console.log("Pre-screener validation ERROR - terminating");
        alert('You do not meet the survey criteria. Thank you for your interest.');
        // Try to get the survey details to redirect to terminate URL
        try {
          const surveyResponse = await fetch(`${apiUrl}/vendor-lite/survey/${token}`);
          const surveyData = await surveyResponse.json();
          if (surveyData.success && surveyData.survey.vendor_id) {
            window.location.href = `${surveyData.survey.vendor_id.terminate_url}?pid=${surveyData.survey.pid}&uid=${uid}&status=2&reason=validation-error`;
          } else {
            // Fallback to a generic terminated page
            window.location.href = '/survey-result/terminated';
          }
        } catch (fallbackError) {
          console.error('Fallback redirect error:', fallbackError);
          window.location.href = '/survey-result/terminated';
        }
      }
    } catch (error) {
      console.error('Error validating pre-screener:', error);
      // Any error should terminate the user
      alert('There was an issue validating your responses. Thank you for your interest.');
      try {
        const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
        const apiUrl = isProduction
          ? 'https://survey-panelgo.onrender.com'
          : 'http://localhost:3000';

        const surveyResponse = await fetch(`${apiUrl}/vendor-lite/survey/${token}`);
        const surveyData = await surveyResponse.json();
        if (surveyData.success && surveyData.survey.vendor_id) {
          window.location.href = `${surveyData.survey.vendor_id.terminate_url}?pid=${surveyData.survey.pid}&uid=${uid}&status=2&reason=validation-error`;
        } else {
          window.location.href = '/survey-result/terminated';
        }
      } catch (fallbackError) {
        console.error('Fallback redirect error:', fallbackError);
        window.location.href = '/survey-result/terminated';
      }
    }
  };

  const getCurrentAnswer = () => {
    if (!survey?.questions || survey.questions.length === 0) return null;
    const answer = answers[`q_${currentStep}`];
    const currentQuestion = survey.questions[currentStep];

    // For text questions, check if answer is not empty
    if (currentQuestion?.type === 'text') {
      return answer && answer.trim() ? answer : null;
    }

    // For rating and multiple-choice questions, check if answer exists
    return answer !== undefined && answer !== null && answer !== '' ? answer : null;
  };

  const handleNext = () => {
    if (!survey?.questions) return;
    if (currentStep < survey.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    console.log("=== VENDOR SURVEY SUBMISSION DEBUG ===");
    console.log("userId (from URL):", uid);
    console.log("token:", token);
    console.log("answers:", answers);

    setSubmitting(true);

    // If it's the new external flow, use the requested redirect logic
    if (survey?.isExternalFlow) {
      const rid = localStorage.getItem("ext_rid") || "";
      const transactionId = localStorage.getItem("ext_transactionId") || "";

      if (!survey.externalUrl) {
        alert("External URL not found");
        setSubmitting(false);
        return;
      }

      // PART 5: PRESCREENER VALIDATION
      let passed = true;
      if (survey.questions && survey.questions.length > 0) {
        survey.questions.forEach((q: any, i: number) => {
          const userAnswer = answers[`q_${i}`];
          if (userAnswer !== q.correctAnswer) {
            passed = false;
          }
        });
      }

      // FAIL → vendor terminate
      if (!passed) {
        console.log("❌ Prescreener failed. Terminating...");
        const terminateBase = survey.vendor?.terminate_url || "/survey-result/terminated";
        const sep = terminateBase.includes("?") ? "&" : "?";
        const failUrl = `${terminateBase}${sep}rid=${rid}&transactionId=${transactionId}&status=2`;

        // Clean up
        localStorage.removeItem('ext_rid');
        localStorage.removeItem('ext_transactionId');
        localStorage.removeItem('ext_token');

        window.location.href = failUrl;
        return;
      }

      // PASS → external survey (TEST MODE ONLY - SurveysGenie)
      let finalUrl = "https://surveys.surveysgenie.com/survey?s=MTAwMDEyMjU2&r=39498030&source=17&PID=" + rid;
      const base = "https://survey-panelgo.onrender.com/external/redirect";

      finalUrl +=
        `&return_url=${encodeURIComponent(`${base}/complete?rid=${rid}&transactionId=${transactionId}`)}` +
        `&fail_url=${encodeURIComponent(`${base}/terminate?rid=${rid}&transactionId=${transactionId}`)}` +
        `&overquota_url=${encodeURIComponent(`${base}/quota?rid=${rid}&transactionId=${transactionId}`)}`;

      console.log("🚀 TEST URL (SurveysGenie):", finalUrl);

      // Clean up local storage before redirecting
      localStorage.removeItem('ext_rid');
      localStorage.removeItem('ext_transactionId');
      localStorage.removeItem('ext_token');

      window.location.href = finalUrl;
      return;
    }

    try {
      // ... existing internal submission logic ...
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
      const apiUrl = isProduction
        ? 'https://survey-panelgo.onrender.com'
        : 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/vendor-lite/submit?pid=${encodeURIComponent(pid)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          answers,
          userId: uid.trim(),
          preScreenerAnswers
        }),
      });

      const data = await response.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Error submitting survey');
      }
    } catch (error) {
      console.error('❌ Error submitting survey:', error);
      alert('Error submitting survey. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
        </div>
      </div>
    );
  }

  // Handle legacy external surveys - redirect to external link
  if (survey.externalLink && !survey.questions?.length && !survey.isExternalFlow) {
    const rid = localStorage.getItem('ext_rid') || '';
    const transactionId = localStorage.getItem('ext_transactionId') || '';
    const buildExternalUrl = (base: string) => {
      try {
        const url = new URL(base);
        if (rid) url.searchParams.set('rid', rid);
        if (transactionId) url.searchParams.set('transactionId', transactionId);
        if (uid) url.searchParams.set('uid', uid);
        return url.toString();
      } catch {
        return base;
      }
    };
    const enrichedExternalUrl = buildExternalUrl(survey.externalLink);

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet to-pink rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-spin">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-jakarta font-bold text-navy mb-3">Redirecting to Survey</h2>
          <p className="text-lg text-gray-600 mb-4">Please wait while we redirect you to the external survey...</p>
          <div className="bg-white/80 backdrop-blur border border-violet/20 rounded-2xl p-6 max-w-md">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Survey:</span> {survey.title}
            </p>
            <div className="mt-4">
              <a
                href={enrichedExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet hover:text-violet/80 underline font-medium"
              >
                Click here if you are not redirected automatically
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">This survey has no questions</p>
        </div>
      </div>
    );
  }

  const currentQuestion = survey?.questions?.[currentStep];
  const isLastQuestion = survey?.questions ? currentStep === survey.questions.length - 1 : false;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden bg-white p-4 border border-gray-100">
                <img
                  src="/logo.png"
                  alt="Survey Panelgo Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="bg-gradient-to-r from-violet/10 to-pink/10 rounded-3xl p-8 mb-6 border border-violet/20">
              <h1 className="text-4xl font-jakarta font-bold text-navy mb-3">{survey.title}</h1>
            </div>
          </div>

          {/* Pre-Screener Questions */}
          {showPreScreener && survey?.preScreenerQuestions?.length > 0 && (
            <PlayfulCard className="mb-12 p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl font-jakarta font-semibold text-navy mb-8">Pre-Screener Questions</h2>
              <form onSubmit={handlePreScreenerSubmit} className="space-y-8">
                {survey.preScreenerQuestions.map((preScreen: any, index: number) => (
                  <div key={index} className="p-8 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <div className="mb-6">
                      <label className="block text-base font-semibold text-gray-700 mb-4">
                        {preScreen.question} <span className="text-red-500">*</span>
                      </label>

                      {preScreen.type === 'age' ? (
                        <input
                          type="number"
                          required
                          value={preScreenerAnswers[preScreen.type] || ''}
                          onChange={(e) => handlePreScreenerAnswer(preScreen.type, e.target.value)}
                          placeholder="Enter your age"
                          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                        />
                      ) : preScreen.type === 'gender' ? (
                        <select
                          required
                          value={preScreenerAnswers[preScreen.type] || ''}
                          onChange={(e) => handlePreScreenerAnswer(preScreen.type, e.target.value)}
                          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                        >
                          <option value="">Select your gender</option>
                          {preScreen.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  </div>
                ))}

                <PlayfulButton
                  type="submit"
                  variant="primary"
                  disabled={!Object.keys(preScreenerAnswers).length || Object.keys(preScreenerAnswers).length < survey.preScreenerQuestions.filter((q: { enabled: boolean }) => q.enabled).length}
                  isLoading={submitting}
                  className="w-full py-4 text-lg"
                >
                  Submit Pre-Screener
                </PlayfulButton>
              </form>
            </PlayfulCard>
          )}

          {/* Survey Questions */}
          {!showPreScreener && (
            <div className="bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-lg p-8">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet/10 rounded-full flex items-center justify-center">
                      <span className="text-violet font-semibold">{currentStep + 1}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-700">
                      Question {currentStep + 1} of {survey?.questions?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {survey?.questions ? Math.round(((currentStep + 1) / survey.questions.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet via-purple to-pink h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${survey?.questions ? ((currentStep + 1) / survey.questions.length) * 100 : 0}%` }}
                  >
                    <div className="h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div className="bg-gradient-to-r from-violet/5 to-pink/5 rounded-2xl p-6 mb-8">
                  <h2 className="text-2xl font-jakarta font-bold text-navy leading-relaxed">
                    {currentQuestion?.text}
                  </h2>
                </div>

                <div className="space-y-4">
                  {currentQuestion?.type === 'text' ? (
                    <div className="relative">
                      <textarea
                        name={`q_${currentStep}`}
                        value={answers[`q_${currentStep}`] || ''}
                        onChange={(e) => handleAnswerChange(`q_${currentStep}`, e.target.value)}
                        placeholder="Share your thoughts here..."
                        className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet/20 focus:border-violet transition-all resize-none bg-white shadow-sm"
                        rows={5}
                      />
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-violet rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ) : currentQuestion?.type === 'rating' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center space-x-4">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleAnswerChange(`q_${currentStep}`, rating)}
                            className={`group relative w-20 h-20 rounded-2xl text-2xl font-bold border-2 transition-all duration-300 transform hover:scale-110 ${answers[`q_${currentStep}`] === rating
                              ? 'bg-gradient-to-r from-violet to-pink text-white border-violet shadow-lg scale-105'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-violet hover:bg-violet/10 hover:shadow-md'
                              }`}
                          >
                            {rating}
                            {answers[`q_${currentStep}`] === rating && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 px-8">
                        <span className="flex items-center"><span className="mr-2">😞</span> Poor</span>
                        <span className="flex items-center"><span className="mr-2">😐</span> Average</span>
                        <span className="flex items-center"><span className="mr-2">😊</span> Excellent</span>
                      </div>
                    </div>
                  ) : (
                    // Multiple choice
                    <div className="space-y-3">
                      {currentQuestion?.options?.map((option: string, optionIndex: number) => (
                        <label key={optionIndex} className="group relative flex items-center p-6 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-violet hover:bg-gradient-to-r hover:from-violet/5 hover:to-pink/5 transition-all duration-300 bg-white shadow-sm hover:shadow-lg">
                          <div className="flex items-center flex-1">
                            <div className="relative">
                              <input
                                type="radio"
                                name={`q_${currentStep}`}
                                value={option}
                                checked={answers[`q_${currentStep}`] === option}
                                onChange={(e) => handleAnswerChange(`q_${currentStep}`, e.target.value)}
                                className="w-6 h-6 text-violet focus:ring-violet focus:ring-4 focus:ring-violet/20"
                              />
                              {answers[`q_${currentStep}`] === option && (
                                <div className="absolute inset-0 w-6 h-6 bg-violet rounded-full flex items-center justify-center pointer-events-none">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <span className="text-lg text-gray-700 group-hover:text-violet transition-colors ml-5 font-medium">{option}</span>
                          </div>
                          {answers[`q_${currentStep}`] === option && (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm font-bold">✓</span>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="group px-8 py-4 font-jakarta font-semibold text-gray-600 hover:text-violet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50 rounded-2xl disabled:hover:bg-transparent flex items-center space-x-2"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                <PlayfulButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={getCurrentAnswer() === null || submitting}
                  isLoading={submitting}
                  className="px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {isLastQuestion ? (
                    <span className="flex items-center space-x-2">
                      <span>Submit Survey</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Next</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </PlayfulButton>
              </div>
            </div>
          )}

          <div className="mt-16 flex items-start gap-6 p-8 bg-white/80 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-violet to-pink rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-jakarta text-xl font-bold text-navy mb-3">Your Feedback Matters!</h3>
              <p className="font-jakarta text-base text-gray-600 leading-relaxed">
                This survey helps us improve our products and services for you. Your responses are valuable and appreciated. Thank you for taking the time to share your thoughts with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
