import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';

interface Vendor {
  id: number;
  name: string;
  complete_url: string;
  terminate_url: string;
  quota_full_url: string;
}

interface VendorSurvey {
  id: number;
  title: string;
  token: string;
  vendor_id: number;
  Vendor: Vendor;
}

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'text';
  options?: string[];
}

export default function VendorSurveyPublicPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<VendorSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const sampleQuestions: SurveyQuestion[] = [
    {
      id: 'q1',
      question: 'What is your age group?',
      type: 'radio',
      options: ['18-24', '25-34', '35-44', '45-54', '55+']
    },
    {
      id: 'q2',
      question: 'What is your gender?',
      type: 'radio',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
    },
    {
      id: 'q3',
      question: 'Which devices do you use regularly? (Select all that apply)',
      type: 'checkbox',
      options: ['Smartphone', 'Tablet', 'Laptop', 'Desktop', 'Smart TV']
    },
    {
      id: 'q4',
      question: 'How satisfied are you with our service?',
      type: 'radio',
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
    },
    {
      id: 'q5',
      question: 'Any additional comments?',
      type: 'text'
    }
  ];

  useEffect(() => {
    if (token) {
      fetchSurvey();
    }
  }, [token]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/vendor-lite/survey/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setSurvey(data.survey);
      } else {
        alert('Survey not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      alert('Error loading survey');
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
    const question = sampleQuestions[currentStep];
    return answers[question.id];
  };

  const handleNext = () => {
    if (currentStep < sampleQuestions.length - 1) {
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
      const response = await fetch('/vendor-lite/submit', {
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
      
      if (data.success) {
        console.log('🚀 Redirecting:', data.redirectUrl);
        window.location.href = data.redirectUrl;
      } else {
        alert('Error submitting survey: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Error submitting survey');
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

  const currentQuestion = sampleQuestions[currentStep];
  const isLastQuestion = currentStep === sampleQuestions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-jakarta font-bold text-navy mb-2">{survey.title}</h1>
          <p className="text-gray-600">Powered by {survey.Vendor.name}</p>
        </div>

        <PlayfulCard>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentStep + 1} of {sampleQuestions.length}
              </span>
              <span className="text-sm font-medium text-violet">
                {Math.round(((currentStep + 1) / sampleQuestions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-violet to-pink h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / sampleQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-jakarta font-semibold text-navy mb-6">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === 'radio' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <label key={option} className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-violet transition-colors">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3 text-violet focus:ring-violet"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <label key={option} className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-violet transition-colors">
                    <input
                      type="checkbox"
                      value={option}
                      checked={answers[currentQuestion.id]?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = answers[currentQuestion.id] || [];
                        if (e.target.checked) {
                          handleAnswerChange(currentQuestion.id, [...currentValues, option]);
                        } else {
                          handleAnswerChange(currentQuestion.id, currentValues.filter((v: string) => v !== option));
                        }
                      }}
                      className="mr-3 text-violet focus:ring-violet"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet resize-none"
                rows={4}
                placeholder="Enter your response here..."
              />
            )}
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
              disabled={getCurrentAnswer() === undefined || getCurrentAnswer() === '' || (Array.isArray(getCurrentAnswer()) && getCurrentAnswer().length === 0)}
              isLoading={submitting}
            >
              {isLastQuestion ? 'Submit Survey' : 'Next Question'}
            </PlayfulButton>
          </div>
        </PlayfulCard>

        <div className="mt-6 flex items-start gap-3 p-4 bg-white/50 border-2 border-navy/10 rounded-2xl">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-jakarta text-sm text-navy">
              <span className="font-semibold">Your feedback matters!</span> This survey helps us improve our products and services for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
