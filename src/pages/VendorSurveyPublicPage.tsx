import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function VendorSurveyPublicPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (token) {
      fetchSurvey();
    }
  }, [token]);

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

  const getCurrentAnswer = () => {
    if (!survey?.questions || survey.questions.length === 0) return null;
    return answers[`q_${currentStep}`];
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
    setSubmitting(true);

    try {
      // Better environment detection for Netlify
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
      const apiUrl = isProduction 
        ? 'https://survey-panelgo.onrender.com' 
        : 'http://localhost:3000';

      console.log("🚀 Submitting survey to:", apiUrl);

      const response = await fetch(`${apiUrl}/vendor-lite/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          answers
        }),
      });

      const data = await response.json();
      console.log("🚀 Survey submitted:", data);

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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-jakarta font-bold text-navy mb-2">{survey.title}</h1>
            <p className="text-gray-600">Powered by {survey.vendor_id?.name || 'Unknown Vendor'}</p>
          </div>

          <PlayfulCard>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentStep + 1} of {survey?.questions?.length || 0}
                </span>
                <span className="text-sm font-medium text-violet">
                  {survey?.questions ? Math.round(((currentStep + 1) / survey.questions.length) * 100) : 0}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet to-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${survey?.questions ? ((currentStep + 1) / survey.questions.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-jakarta font-semibold text-navy mb-6">
                {currentQuestion?.text}
              </h2>

              {currentQuestion?.options?.map((option: string, optionIndex: number) => (
                <label key={optionIndex} className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-violet transition-colors mb-3">
                  <input
                    type="radio"
                    name={`q_${currentStep}`}
                    value={option}
                    checked={answers[`q_${currentStep}`] === option}
                    onChange={(e) => handleAnswerChange(`q_${currentStep}`, e.target.value)}
                    className="mr-3 text-violet focus:ring-violet"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 font-jakarta font-medium text-navy hover:text-violet disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <PlayfulButton
                variant="primary"
                onClick={handleNext}
                disabled={getCurrentAnswer() === null || submitting}
                isLoading={submitting}
              >
                {isLastQuestion ? 'Submit Survey' : 'Next Question'}
              </PlayfulButton>
            </div>
          </PlayfulCard>

          <div className="mt-6 flex items-start gap-3 p-4 bg-white/50 border-2 border-navy/10 rounded-2xl">
            <div className="w-6 h-6 bg-violet/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-violet text-sm">ℹ️</span>
            </div>
            <div>
              <p className="font-jakarta text-sm text-navy">
                <span className="font-semibold">Your feedback matters!</span> This survey helps us improve our products and services for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
