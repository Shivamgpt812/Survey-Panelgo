import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  PartyPopper,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge, PlayfulProgress } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid } from '@/components/decorations';
import type { Survey, Vendor } from '@/types';
import { validatePreScreener, type PreScreenerAnswer } from '@/lib/preScreenerValidation';
import { apiGet, apiPost } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useToast } from '@/hooks/useToast';
import { getStoredToken, useAuth } from '@/hooks/useAuth';
import { useSurveyTracker } from '@/components/SurveyTracker';
import confetti from 'canvas-confetti';

/**
 * Pre-Screener Page with Vendor Support
 * 
 * Extended functionality:
 * - Checks for vendor session
 * - Tracks responses (complete/terminate/quota)
 * - Redirects to vendor URLs when applicable
 * - Shows completion celebration
 * - Logs activity
 */
const PreScreenerPage: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [survey, setSurvey] = useState<Survey | undefined>(undefined);
  const [loadingSurvey, setLoadingSurvey] = useState(true);

  // Check for vendor session
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendor, setVendor] = useState<Vendor | undefined>(undefined);
  const [isVendorFlow, setIsVendorFlow] = useState(false);

  const [answers, setAnswers] = useState<PreScreenerAnswer[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'pending' | 'passed' | 'failed'>('pending');
  const [failureMessage, setFailureMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Survey tracking integration for non-vendor users
  const { startTracking, completeTracking, trackingData } = useSurveyTracker(surveyId || '');

  useEffect(() => {
    if (!surveyId) {
      setLoadingSurvey(false);
      return;
    }
    void apiGet<{ survey: Survey }>(`/api/surveys/${surveyId}`)
      .then((d) => setSurvey(d.survey))
      .catch(() => setSurvey(undefined))
      .finally(() => setLoadingSurvey(false));
  }, [surveyId]);

  // Load vendor data from URL parameters on mount
  useEffect(() => {
    const urlVendorId = searchParams.get('vendor');
    const isVendorFlow = sessionStorage.getItem('surveypanelgo_vendor_flow') === 'true';
    
    if (urlVendorId) {
      setVendorId(urlVendorId);
      setIsVendorFlow(isVendorFlow);
      void apiGet<{ vendors: Vendor[] }>('/api/vendors').then(({ vendors }) => {
        const vendorData = vendors.find((v) => v.id === urlVendorId);
        setVendor(vendorData);
      });
    }
  }, [searchParams]);

  // Start tracking for non-vendor users when survey loads
  useEffect(() => {
    if (survey && surveyId && !vendor && !trackingData) {
      console.log('Starting tracking for pre-screener survey:', survey.title);
      startTracking().catch(error => {
        console.error('Failed to start tracking:', error);
      });
    }
  }, [survey, surveyId, vendor, trackingData]);

  const preScreenerQuestions = survey?.preScreener || [];
  const currentQuestion = preScreenerQuestions[currentStep] || null;
  const progress = preScreenerQuestions.length > 0 ? ((currentStep + 1) / preScreenerQuestions.length) * 100 : 0;
  const isLastQuestion = preScreenerQuestions.length > 0 ? currentStep === preScreenerQuestions.length - 1 : false;

  useEffect(() => {
    if (!survey || loadingSurvey) return;
    if ((survey.preScreener?.length ?? 0) > 0) return;

    const run = async () => {
      if (vendorId && vendor) {
        try {
          await apiPost(
            '/api/responses',
            {
              surveyId: survey.id,
              vendorId,
              // Use logged-in user ID if available, otherwise use UID from URL
              userId: user?.id || searchParams.get('uid'),
              status: 'complete',
            },
            getStoredToken()
          );
        } catch {
          /* ignore */
        }
        window.location.href = vendor.redirectLinks.complete;
        return;
      }
      if (!survey.isExternal) {
        // Navigate with ALL query parameters preserved
        const takeParams = new URLSearchParams();
        takeParams.set('survey', survey.id);
        const urlUid = searchParams.get('uid');
        const urlPid = searchParams.get('pid') || survey.id;
        const urlVendorId = searchParams.get('vendor');
        
        if (urlUid) takeParams.set('uid', urlUid);
        if (urlPid) takeParams.set('pid', urlPid);
        if (urlVendorId) takeParams.set('vendor', urlVendorId);
        
        navigate(`/survey/${survey.id}/take?${takeParams.toString()}`, { replace: true });
        return;
      }
      if (survey.link) {
        window.open(survey.link, '_blank');
      }
      navigate('/dashboard');
    };
    void run();
  }, [survey, loadingSurvey, vendorId, vendor, navigate, user?.id]);

  // Auto-redirect for failed attempts
  useEffect(() => {
    if (result === 'failed') {
      const timer = setTimeout(() => {
        if (vendor) {
          // Redirect to vendor terminate URL
          window.location.href = vendor.redirectLinks.terminate;
        } else if (trackingData) {
          // For non-vendor users, use tracking to redirect to result page
          completeTracking('terminated').catch(() => {
            navigate('/dashboard');
          });
        }
      }, 3000); // Auto-redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [result, vendor, trackingData, completeTracking, navigate]);

  if (loadingSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <PlayfulCard className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-navy-light mx-auto mb-4" />
          <h2 className="font-outfit font-bold text-2xl text-navy mb-2">Survey Not Found</h2>
          <p className="font-jakarta text-navy-light mb-6">The survey you're looking for doesn't exist.</p>
          <PlayfulButton onClick={() => navigate('/dashboard')}>Back to Dashboard</PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  if (preScreenerQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAnswer = (value: string | number | boolean) => {
    if (!currentQuestion) {
      console.error('Cannot handle answer - currentQuestion is null');
      return;
    }
    
    const newAnswer: PreScreenerAnswer = {
      questionId: currentQuestion.id,
      value,
    };

    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  const getCurrentAnswer = (): string | number | boolean | null => {
    if (!currentQuestion) {
      console.error('Cannot get answer - currentQuestion is null');
      return null;
    }
    
    const answer = answers.find((a) => a.questionId === currentQuestion.id);
    return answer?.value ?? null;
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const validation = validatePreScreener(answers, preScreenerQuestions);

    if (validation.passed) {
      setResult('passed');
      addToast('🎉 You are eligible for this survey!', 'success');
    } else {
      setResult('failed');
      setFailureMessage(validation.message || 'You do not meet the requirements for this survey');
      addToast('❌ Not eligible for this survey', 'error');

      // Always log the failed attempt, both for vendor and non-vendor users
      try {
        await apiPost(
          '/api/responses',
          {
            surveyId: survey.id,
            vendorId: vendorId || undefined,
            // Use logged-in user ID if available, otherwise use UID from URL
            userId: user?.id || searchParams.get('uid'),
            status: 'terminate',
            preScreenerAnswers: answers,
            failureReason: validation.message || 'Did not meet pre-screener requirements',
          },
          getStoredToken()
        );
        
        // For non-vendor users, also complete tracking to show result page
        if (!vendor && trackingData) {
          try {
            await completeTracking('terminated');
          } catch (trackingError) {
            console.error('Tracking failed, but response was logged:', trackingError);
            // Fallback to dashboard if tracking fails
            navigate('/dashboard?status=terminated&survey=' + encodeURIComponent(survey?.title || 'survey'));
          }
        }
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Could not record response', 'error');
      }
    }

    setIsSubmitting(false);
  };

  const handleStartSurvey = async () => {
    console.log('=== PRESCREENER START SURVEY DEBUG ===');
    console.log('Survey title:', survey?.title);
    console.log('Survey isExternal:', survey?.isExternal);
    console.log('Survey has questions:', survey?.questions?.length);
    console.log('Survey link:', survey?.link);
    console.log('Current vendorId:', vendorId);
    console.log('Current vendor:', vendor);
    console.log('=====================================');
    
    const recordStart = async () => {
      try {
        await apiPost(
          '/api/responses',
          {
            surveyId: survey!.id,
            vendorId: vendorId || undefined,
            // Use logged-in user ID if available, otherwise use UID from URL
            userId: user?.id || searchParams.get('uid') || undefined,
            status: 'complete',
            preScreenerAnswers: answers,
          },
          user ? getStoredToken() : undefined // No token for vendor flow without login
        );
        console.log('Response recorded successfully');
      } catch (e) {
        console.error('Failed to record response:', e);
        addToast(e instanceof Error ? e.message : 'Could not record response', 'error');
      }
    };

    if (vendorId) {
      console.log('Vendor flow detected');
      await recordStart();
      setShowCelebration(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7B61FF', '#FFD6E8', '#FFF2B2', '#D6F5E3'],
      });
  };

  const handleVendorTerminateRedirect = () => {
    if (vendor) {
      window.location.href = vendor.redirectLinks.terminate;
    } else {
      navigate('/dashboard');
    }
  };

  // Render celebration screen
  if (showCelebration) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="yellow" size="lg" className="left-[15%] top-[15%] opacity-50 animate-float" />
        <DecorativeBlob variant="pink" size="lg" className="right-[15%] bottom-[15%] opacity-50 animate-float animation-delay-500" />
        <DecorativeBlob variant="green" size="md" className="left-[10%] bottom-[20%] opacity-40 animate-float animation-delay-300" />
        <DecorativeBlob variant="lavender" size="md" className="right-[10%] top-[20%] opacity-40 animate-float animation-delay-700" />

        <PlayfulCard className="relative z-10 w-full max-w-md p-8 text-center animate-bounce-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse-soft">
                <PartyPopper className="w-10 h-10" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-outfit font-bold text-3xl text-navy mb-3">
            🎉 Congratulations!
          </h2>

          <p className="font-jakarta text-navy-light mb-6">
            You're all set to earn{' '}
            <span className="font-outfit font-bold text-violet">{survey.pointsReward} points</span>!
          </p>

          <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
            <Coins className="w-6 h-6 text-violet" />
            <span className="font-outfit font-bold text-2xl text-violet">+{survey.pointsReward}</span>
            <span className="font-jakarta text-navy-light">points</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-violet rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-pink rounded-full animate-bounce animation-delay-100" />
            <div className="w-3 h-3 bg-yellow rounded-full animate-bounce animation-delay-200" />
          </div>

          <p className="font-jakarta text-sm text-navy-light mt-4">
            Redirecting you to the survey...
          </p>
        </PlayfulCard>
      </div>
    );
  }

  // Render result screen - PASSED
  if (result === 'passed') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="green" size="md" className="left-[10%] top-[20%] opacity-40" />
        <DecorativeBlob variant="yellow" size="md" className="right-[10%] bottom-[20%] opacity-40" />

        <PlayfulCard className="relative z-10 w-full max-w-md p-8 text-center animate-bounce-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10" />
            </div>
          </div>

          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-navy mb-3">
            🎉 You're Eligible!
          </h2>

          <p className="font-jakarta text-navy-light mb-6">
            Great news! You meet all the requirements for this survey. Click below to start earning{' '}
            {survey.pointsReward} points!
          </p>

          <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
            <Coins className="w-5 h-5 text-violet" />
            <span className="font-outfit font-bold text-violet">+{survey.pointsReward} points</span>
            <span className="font-jakarta text-sm text-navy-light">• {survey.timeEstimate} min</span>
          </div>

          {vendor && (
            <div className="mb-4 p-3 bg-lavender/50 border-2 border-navy rounded-xl">
              <p className="font-mono text-xs text-navy-light">Powered by</p>
              <p className="font-outfit font-bold text-navy">{vendor.name}</p>
            </div>
          )}

          <div className="space-y-3">
            <PlayfulButton
              variant="primary"
              className="w-full"
              rightIcon={<ExternalLink className="w-5 h-5" />}
              onClick={handleStartSurvey}
            >
              Start Survey Now
            </PlayfulButton>

            <PlayfulButton variant="secondary" className="w-full" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </PlayfulButton>
          </div>
        </PlayfulCard>
      </div>
    );
  }

  // Render result screen - FAILED
  if (result === 'failed') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="pink" size="md" className="left-[10%] top-[20%] opacity-40" />
        <DecorativeBlob variant="lavender" size="md" className="right-[10%] bottom-[20%] opacity-40" />

        <PlayfulCard className="relative z-10 w-full max-w-md p-8 text-center animate-bounce-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              <X className="w-10 h-10" />
            </div>
          </div>

          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-navy mb-3">
            ❌ Not Eligible
          </h2>

          <p className="font-jakarta text-navy-light mb-6">{failureMessage}</p>

          <div className="p-4 bg-pink/30 border-2 border-navy rounded-2xl mb-6">
            <p className="font-jakarta text-sm text-navy">
              Don't worry! Check out other available surveys that might be a better match for you.
            </p>
          </div>

          {vendor && (
            <>
              <p className="font-mono text-xs text-navy-light mb-4">
                You'll be redirected back to {vendor.name} in 3 seconds...
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-violet rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-pink rounded-full animate-bounce animation-delay-100" />
                <div className="w-2 h-2 bg-yellow rounded-full animate-bounce animation-delay-200" />
              </div>
            </>
          )}
          {!vendor && (
            <>
              <p className="font-mono text-xs text-navy-light mb-4">
                Redirecting you to result page in 3 seconds...
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-violet rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-pink rounded-full animate-bounce animation-delay-100" />
                <div className="w-2 h-2 bg-yellow rounded-full animate-bounce animation-delay-200" />
              </div>
            </>
          )}

          <div className="space-y-3">
            {vendor ? (
              <>
                <PlayfulButton variant="primary" className="w-full" onClick={handleVendorTerminateRedirect}>
                  Return to {vendor.name} Now
                </PlayfulButton>
                <p className="font-mono text-xs text-navy-light text-center">
                  Auto-redirecting in 3 seconds...
                </p>
              </>
            ) : (
              <>
                <PlayfulButton variant="primary" className="w-full" onClick={() => {
                  if (trackingData) {
                    completeTracking('terminated').catch(() => {
                      navigate('/dashboard');
                    });
                  } else {
                    navigate('/dashboard');
                  }
                }}>
                  View Result Page Now
                </PlayfulButton>
                <p className="font-mono text-xs text-navy-light text-center">
                  Auto-redirecting to result page in 3 seconds...
                </p>
              </>
            )}
          </div>
        </PlayfulCard>
      </div>
    );
  }

  // Render pre-screener form (existing code - unchanged)
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      {/* Background */}
      <DotGrid className="fixed inset-0" />
      <DecorativeBlob variant="pink" size="sm" className="right-[10%] top-[15%] opacity-40" />
      <DecorativeBlob variant="yellow" size="sm" className="left-[8%] bottom-[15%] opacity-40" />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-navy/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-navy rounded-pill hover:bg-periwinkle transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-navy" />
            <span className="font-jakarta font-medium text-sm text-navy hidden sm:block">Back</span>
          </button>

          <div className="flex items-center justify-center flex-1 min-w-0 px-1">
            <button type="button" onClick={() => navigate('/')} className="min-w-0" aria-label="Survey Panel Go home">
              <BrandLogo size="sm" className="max-h-8 sm:max-h-9 mx-auto" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-yellow border-2 border-navy rounded-pill shrink-0">
            <Coins className="w-4 h-4 text-navy" />
            <span className="font-outfit font-bold text-sm text-navy">+{survey.pointsReward}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <PlayfulBadge variant="violet" size="sm">
                Pre-Screener
              </PlayfulBadge>
              {vendor && (
                <PlayfulBadge variant="lavender" size="sm">
                  via {vendor.name}
                </PlayfulBadge>
              )}
            </div>
            <h1 className="font-outfit font-bold text-2xl md:text-3xl text-navy mb-2">{survey.title}</h1>
            <p className="font-jakarta text-navy-light">
              Please answer a few quick questions to check your eligibility
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-navy-light">
                Question {currentStep + 1} of {preScreenerQuestions.length}
              </span>
              <span className="font-mono text-sm text-navy-light">{Math.round(progress)}%</span>
            </div>
            <PlayfulProgress value={currentStep + 1} max={preScreenerQuestions.length} variant="violet" size="md" />
          </div>

          {/* Question Card */}
          <PlayfulCard className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Question */}
              <div>
                <h2 className="font-outfit font-bold text-xl md:text-2xl text-navy">
                  {currentQuestion?.question || 'Loading question...'}
                </h2>
                {currentQuestion && <span className="inline-block mt-2 font-mono text-xs text-violet">* Required</span>}
              </div>

              {/* Answer Input */}
              
              {currentQuestion && (
                <div className="space-y-3">
                  {currentQuestion.type === 'number' && (
                  <input
                    type="number"
                    value={(getCurrentAnswer() as string) || ''}
                    onChange={(e) => handleAnswer(Number(e.target.value))}
                    placeholder="Enter a number..."
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                  />
                )}

                {currentQuestion.type === 'text' && (
                  <input
                    type="text"
                    value={(getCurrentAnswer() as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                  />
                )}

                {currentQuestion.type === 'boolean' && (
                  <div className="space-y-3">
                    {[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full flex items-center gap-4 p-4 border-2 border-navy rounded-2xl transition-all ${getCurrentAnswer() === option.value
                          ? 'bg-violet text-white shadow-hard'
                          : 'bg-white hover:bg-periwinkle'
                          }`}
                      >
                        <div
                          className={`w-6 h-6 border-2 border-navy rounded-full flex items-center justify-center ${getCurrentAnswer() === option.value ? 'bg-white' : 'bg-white'
                            }`}
                        >
                          {getCurrentAnswer() === option.value && <div className="w-3 h-3 bg-violet rounded-full" />}
                        </div>
                        <span
                          className={`font-jakarta text-left flex-1 ${getCurrentAnswer() === option.value ? 'text-white' : 'text-navy'
                            }`}
                        >
                          {option.label}
                        </span>
                        {getCurrentAnswer() === option.value && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 font-jakarta font-medium text-navy hover:text-violet disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <PlayfulButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={getCurrentAnswer() === null || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isLastQuestion ? 'Check Eligibility' : 'Next Question'}
                </PlayfulButton>
              </div>
            </div>
          </PlayfulCard>

          {/* Info */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-white/50 border-2 border-navy/10 rounded-2xl">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-jakarta text-sm text-navy">
              <span className="font-semibold">Why pre-screening?</span> We want to make sure you're a good fit for
              this survey. This helps us provide better surveys and rewards for everyone!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
}

export default PreScreenerPage;
