import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';
import { AlertCircle, ExternalLink, Shield, PartyPopper } from 'lucide-react';
import { DotGrid, DecorativeBlob, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useToast } from '@/hooks/useToast';
import { apiGet, apiPost } from '@/lib/api';
import type { Survey } from '@/types';
import confetti from 'canvas-confetti';

/**
 * Vendor Survey Page - Works without login
 * 
 * This page handles vendor survey access via /s/:token
 * - No login required
 * - Uses vendor UID from cookies
 * - Handles pre-screener and survey flow
 * - Proper error handling and debugging
 */
const VendorSurveyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [survey, setSurvey] = useState<Survey | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | undefined>(undefined);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStep, setCurrentStep] = useState<'loading' | 'prescreener' | 'survey' | 'complete'>('loading');
  const [prescreenerAnswers, setPrescreenerAnswers] = useState<Array<{ questionId: string; value: any }>>([]);

  // Global error handlers for debugging
  useEffect(() => {
    window.onerror = function(message, source, lineno, colno, error) {
      console.error("GLOBAL ERROR:", { message, source, lineno, colno, error });
    };

    window.onunhandledrejection = function(event) {
      console.error("PROMISE ERROR:", event.reason);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      console.error('❌ No token provided in URL');
      addToast('Invalid survey link', 'error');
      navigate('/');
      return;
    }

    console.log('=== VENDOR SURVEY PAGE DEBUG ===');
    console.log('Token from URL:', token);
    console.log('Loading vendor survey...');
    console.log('================================');

    loadVendorSurvey();
  }, [token, navigate, addToast]);

  const loadVendorSurvey = async () => {
    try {
      console.log('🔄 Fetching vendor survey from server...');
      
      // Call the vendor survey endpoint
      const response = await fetch(`/s/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vendor-flow': 'true'
        },
        credentials: 'include'
      });

      console.log('📡 Server response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.error || 'Failed to load vendor survey');
      }

      const data = await response.json();
      console.log('✅ Vendor survey loaded successfully:', {
        surveyId: data.survey._id,
        surveyTitle: data.survey.title,
        uid: data.uid,
        isVendorFlow: data.isVendorFlow
      });

      setSurvey(data.survey);
      setUid(data.uid);
      
      // Check if survey has pre-screener questions
      if (data.survey.preScreener && data.survey.preScreener.length > 0) {
        setCurrentStep('prescreener');
        console.log('📋 Pre-screener questions found, step set to prescreener');
      } else {
        // No pre-screener, go directly to survey
        setCurrentStep('survey');
        console.log('🚀 No pre-screener, step set to survey');
      }

    } catch (error) {
      console.error('❌ VENDOR SURVEY LOAD ERROR:', error);
      addToast(error instanceof Error ? error.message : 'Failed to load survey', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescreenerSubmit = async (answers: Array<{ questionId: string; value: any }>) => {
    console.log('=== PRESCREENER SUBMISSION DEBUG ===');
    console.log('Submitting answers:', answers);
    console.log('Survey ID:', survey?.id);
    console.log('UID:', uid);
    console.log('=====================================');

    setPrescreenerAnswers(answers);

    try {
      // Validate pre-screener (simple validation - in real app this would be more complex)
      const passed = answers.length > 0; // Simple pass condition for demo
      
      if (passed) {
        console.log('✅ Pre-screener passed');
        
        // Record the response
        await apiPost('/api/responses', {
          surveyId: survey!.id,
          status: 'complete',
          preScreenerAnswers: answers
        });

        setShowCelebration(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7B61FF', '#FFD6E8', '#FFF2B2', '#D6F5E3'],
        });

        setTimeout(() => {
          setShowCelebration(false);
          if (survey!.isExternal && survey!.link) {
            console.log('🔗 Opening external survey:', survey!.link);
            window.open(survey!.link, '_blank');
            navigate('/');
          } else {
            console.log('📝 Starting internal survey...');
            setCurrentStep('survey');
          }
        }, 3000);
      } else {
        console.log('❌ Pre-screener failed');
        
        // Record failure
        await apiPost('/api/responses', {
          surveyId: survey!.id,
          status: 'terminate',
          preScreenerAnswers: answers,
          failureReason: 'Did not meet pre-screener requirements'
        });

        addToast('Not eligible for this survey', 'error');
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (error) {
      console.error('❌ PRESCREENER SUBMISSION ERROR:', error);
      addToast('Failed to submit pre-screener', 'error');
    }
  };

  const handleSurveyComplete = async (surveyData: any) => {
    console.log('=== SURVEY COMPLETION DEBUG ===');
    console.log('Survey data:', surveyData);
    console.log('Survey ID:', survey?.id);
    console.log('UID:', uid);
    console.log('=================================');

    try {
      await apiPost('/api/responses', {
        surveyId: survey!.id,
        status: 'complete'
      });

      setShowCelebration(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7B61FF', '#FFD6E8', '#FFF2B2', '#D6F5E3'],
      });

      setTimeout(() => {
        setShowCelebration(false);
        setCurrentStep('complete');
      }, 3000);
    } catch (error) {
      console.error('❌ SURVEY COMPLETION ERROR:', error);
      addToast('Failed to complete survey', 'error');
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="violet" size="lg" className="left-[15%] top-[15%] opacity-50 animate-float" />
        <DecorativeBlob variant="pink" size="lg" className="right-[15%] bottom-[15%] opacity-50 animate-float animation-delay-500" />

        <PlayfulCard className="relative z-10 p-8 text-center max-w-md">
          <div className="flex justify-center mb-6">
            <BrandLogo size="sm" className="mx-auto max-h-10" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 border-4 border-violet border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="font-outfit font-bold text-xl text-navy mb-2">Loading Survey...</h2>
          <p className="font-jakarta text-navy-light">Please wait while we prepare your survey</p>
        </PlayfulCard>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center">
        <DotGrid className="fixed inset-0" />
        <PlayfulCard className="relative z-10 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-navy-light mx-auto mb-4" />
          <h2 className="font-outfit font-bold text-2xl text-navy mb-2">Survey Not Found</h2>
          <p className="font-jakarta text-navy-light mb-6">The survey you're looking for doesn't exist.</p>
          <PlayfulButton onClick={() => navigate('/')}>Back to Home</PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  // Celebration screen
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
              <IconCircle variant="yellow" size="xl" className="animate-pulse-soft">
                <PartyPopper className="w-10 h-10" />
              </IconCircle>
              <div className="absolute -top-2 -right-2">
                <IconCircle variant="violet" size="sm">
                  <span className="text-xs font-bold">✓</span>
                </IconCircle>
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
            <span className="font-outfit font-bold text-2xl text-violet">+{survey.pointsReward}</span>
            <span className="font-jakarta text-navy-light">points</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-violet rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-pink rounded-full animate-bounce animation-delay-100" />
            <div className="w-3 h-3 bg-yellow rounded-full animate-bounce animation-delay-200" />
          </div>

          <p className="font-jakarta text-sm text-navy-light mt-4">
            {currentStep === 'prescreener' ? 'Preparing your survey...' : 'Processing your response...'}
          </p>
        </PlayfulCard>
      </div>
    );
  }

  // Pre-screener step
  if (currentStep === 'prescreener') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="pink" size="sm" className="right-[10%] top-[15%] opacity-40" />
        <DecorativeBlob variant="yellow" size="sm" className="left-[8%] bottom-[15%] opacity-40" />

        <nav className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-navy/10">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-navy rounded-pill hover:bg-periwinkle transition-colors shrink-0"
            >
              <span className="font-jakarta font-medium text-sm text-navy">Exit</span>
            </button>

            <div className="flex items-center justify-center flex-1 min-w-0 px-1">
              <BrandLogo size="sm" className="max-h-8 sm:max-h-9 mx-auto" />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-yellow border-2 border-navy rounded-pill shrink-0">
              <span className="font-outfit font-bold text-sm text-navy">+{survey.pointsReward}</span>
            </div>
          </div>
        </nav>

        <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <IconCircle variant="violet" size="sm">
                  <Shield className="w-4 h-4" />
                </IconCircle>
                <span className="px-3 py-1 bg-violet text-white text-xs font-outfit font-bold rounded-full">
                  Pre-Screener
                </span>
                <span className="px-3 py-1 bg-lavender text-navy text-xs font-outfit font-bold rounded-full">
                  Vendor Survey
                </span>
              </div>
              <h1 className="font-outfit font-bold text-2xl md:text-3xl text-navy mb-2">{survey.title}</h1>
              <p className="font-jakarta text-navy-light">
                Please answer a few quick questions to check your eligibility
              </p>
            </div>

            <PlayfulCard className="p-6 md:p-8">
              <div className="space-y-6">
                <h2 className="font-outfit font-bold text-xl text-navy">
                  Are you 18 years or older?
                </h2>
                <p className="font-jakarta text-navy-light text-sm">* Required</p>

                <div className="space-y-3">
                  {[
                    { label: 'Yes, I am 18 or older', value: true },
                    { label: 'No, I am under 18', value: false },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => handlePrescreenerSubmit([{ questionId: 'age', value: option.value }])}
                      className="w-full flex items-center gap-4 p-4 border-2 border-navy rounded-2xl transition-all hover:bg-periwinkle bg-white"
                    >
                      <div className="w-6 h-6 border-2 border-navy rounded-full flex items-center justify-center bg-white">
                        <div className="w-3 h-3 bg-violet rounded-full opacity-0" />
                      </div>
                      <span className="font-jakarta text-left flex-1 text-navy">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <p className="font-jakarta text-xs text-navy-light text-center">
                    This survey takes approximately {survey.timeEstimate} minutes
                  </p>
                </div>
              </div>
            </PlayfulCard>
          </div>
        </main>
      </div>
    );
  }

  // Survey step
  if (currentStep === 'survey') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center">
        <DotGrid className="fixed inset-0" />
        <PlayfulCard className="relative z-10 p-8 text-center max-w-md">
          <h2 className="font-outfit font-bold text-2xl text-navy mb-4">
            📋 Survey Ready
          </h2>
          <p className="font-jakarta text-navy-light mb-6">
            Great! You're eligible for this survey. Click below to begin.
          </p>
          <PlayfulButton
            variant="primary"
            className="w-full"
            rightIcon={<ExternalLink className="w-5 h-5" />}
            onClick={() => handleSurveyComplete({})}
          >
            Start Survey Now
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  // Complete step
  if (currentStep === 'complete') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center">
        <DotGrid className="fixed inset-0" />
        <PlayfulCard className="relative z-10 p-8 text-center max-w-md">
          <div className="flex justify-center mb-6">
            <IconCircle variant="green" size="xl">
              <span className="text-3xl">✓</span>
            </IconCircle>
          </div>
          <h2 className="font-outfit font-bold text-2xl text-navy mb-4">
            🎉 Survey Complete!
          </h2>
          <p className="font-jakarta text-navy-light mb-6">
            Thank you for completing this survey. Your response has been recorded.
          </p>
          <div className="p-4 bg-green/30 border-2 border-navy rounded-2xl mb-6">
            <p className="font-outfit font-bold text-violet text-lg">
              +{survey.pointsReward} points earned
            </p>
          </div>
          <PlayfulButton onClick={() => navigate('/')} className="w-full">
            Back to Home
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  return null;
};

export default VendorSurveyPage;
