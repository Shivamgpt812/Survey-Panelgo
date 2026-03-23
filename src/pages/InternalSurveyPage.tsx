import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Coins, Check, AlertCircle, Shield, PartyPopper } from 'lucide-react';
import { PlayfulCard, PlayfulButton, PlayfulBadge, PlayfulProgress } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import type { Survey, User } from '@/types';
import { apiGet, apiPost } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useToast } from '@/hooks/useToast';
import { getStoredToken, useAuth } from '@/hooks/useAuth';
import { useSurveyTracker } from '@/components/SurveyTracker';
import confetti from 'canvas-confetti';

const InternalSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId');
  const { addToast } = useToast();
  const { refreshUser } = useAuth();

  console.log('=== INTERNAL SURVEY PAGE DEBUG ===');
  console.log('Survey ID from URL:', surveyId);
  console.log('Vendor ID from URL:', vendorId);
  console.log('=================================');

  const [survey, setSurvey] = useState<Survey | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Survey tracking integration
  const { startTracking, completeTracking, trackingData } = useSurveyTracker(surveyId || '');

  useEffect(() => {
    if (!surveyId) {
      console.log('No surveyId provided');
      setLoading(false);
      return;
    }
    console.log('Loading survey with ID:', surveyId);
    void apiGet<{ survey: Survey }>(`/api/surveys/${surveyId}`, getStoredToken())
      .then((d) => {
        console.log('Survey loaded successfully:', d.survey);
        console.log('Survey questions count:', d.survey.questions?.length || 0);
        console.log('Survey isExternal:', d.survey.isExternal);
        setSurvey(d.survey);
      })
      .catch((error) => {
        console.error('Failed to load survey:', error);
        setSurvey(undefined);
      })
      .finally(() => setLoading(false));
  }, [surveyId]);

  // Start tracking when survey loads
  useEffect(() => {
    if (survey && surveyId && !trackingData) {
      console.log('Starting tracking for survey:', survey.title);
      startTracking().catch(error => {
        console.error('Failed to start tracking:', error);
      });
    }
  }, [survey, surveyId, trackingData]); // Removed startTracking from dependencies

  // Prevent multiple tracking starts
  const [trackingStarted, setTrackingStarted] = useState(false);
  useEffect(() => {
    if (trackingData && !trackingStarted) {
      setTrackingStarted(true);
    }
  }, [trackingData, trackingStarted]);

  if (loading) {
    console.log('Still loading survey...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!survey) {
    console.log('Survey not found');
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

  const questions = survey?.questions || [];
  console.log('Survey questions:', questions);
  console.log('Survey type:', survey.isExternal ? 'external' : 'internal');
  console.log('Survey data:', survey);

  if (questions.length === 0) {
    console.log('No questions found in survey - this might be the issue');
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <PlayfulCard className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-navy-light mx-auto mb-4" />
          <h2 className="font-outfit font-bold text-2xl text-navy mb-2">No Questions Found</h2>
          <p className="font-jakarta text-navy-light mb-6">This internal survey doesn't have any questions yet.</p>
          <p className="font-mono text-xs text-navy-light mt-4">Survey ID: {survey.id}</p>
          <p className="font-mono text-xs text-navy-light">Survey Title: {survey.title}</p>
          <PlayfulButton onClick={() => navigate('/dashboard')}>Back to Dashboard</PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  console.log('Rendering survey with', questions.length, 'questions');
  console.log('Current question index:', currentStep);
  console.log('Current question:', questions[currentStep]);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastQuestion = currentStep === questions.length - 1;

  if (showCelebration) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="yellow" size="lg" className="left-[15%] top-[15%] opacity-50 animate-float" />
        <DecorativeBlob variant="pink" size="lg" className="right-[15%] bottom-[15%] opacity-50 animate-float" />

        <PlayfulCard className="relative z-10 w-full max-w-md p-8 text-center animate-bounce-in">
          <div className="flex justify-center mb-4">
            <BrandLogo size="sm" className="mx-auto max-h-9 opacity-90" />
          </div>
          <div className="flex justify-center mb-6">
            <IconCircle variant="yellow" size="xl" className="animate-pulse-soft">
              <PartyPopper className="w-10 h-10" />
            </IconCircle>
          </div>

          <h2 className="font-outfit font-bold text-3xl text-navy mb-3">Excellent Work!</h2>
          <p className="font-jakarta text-navy-light mb-6">
            You've successfully completed the <span className="font-bold text-navy">{survey.title}</span>.
          </p>

          <div className="flex items-center justify-center gap-2 mb-8 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
            <Coins className="w-8 h-8 text-violet" />
            <span className="font-outfit font-bold text-3xl text-violet">+{survey.pointsReward}</span>
            <span className="font-jakarta text-navy-light">points earned</span>
          </div>

          <PlayfulButton variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  const handleAnswer = (value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const getCurrentAnswer = (): string | number | undefined => {
    return answers[currentQuestion.id];
  };

  const handleNext = () => {
    if (isLastQuestion) {
      void handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleExit = async () => {
    if (trackingData) {
      try {
        await completeTracking('terminated');
      } catch (error) {
        console.error('Failed to complete tracking on exit:', error);
      }
    }
    navigate('/dashboard');
  };

  const handleSubmit = async () => {
    if (!trackingData) {
      addToast('Tracking not initialized. Please try again.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit internal survey completion
      await apiPost<{ user: User }>('/api/internal-complete', { 
        surveyId: survey!.id,
        vendorId: vendorId || undefined
      }, getStoredToken());
      await refreshUser();
      
      // Complete tracking with 'completed' status - this will redirect automatically
      await completeTracking('completed');
      
      // Show celebration (this won't be shown due to redirect)
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7B61FF', '#FFD6E8', '#FFF2B2', '#D6F5E3'],
      });
      
      addToast('🎉 Survey completed successfully!', 'success');
    } catch (e) {
      console.error('Survey completion error:', e);
      
      // Check if it's "already completed" error - if so, still mark tracking as completed
      const errorMessage = e instanceof Error ? e.message : 'Could not complete survey';
      if (errorMessage.includes('already completed')) {
        // Survey was already completed in the system, but we still want to track this attempt
        await completeTracking('completed');
        addToast('Survey was already completed, but tracking recorded.', 'info');
      } else {
        // For other errors, mark as terminated
        try {
          await completeTracking('terminated');
        } catch (trackingError) {
          console.error('Tracking also failed:', trackingError);
          addToast('Survey completion failed', 'error');
          // Fallback to dashboard
          navigate('/dashboard');
        }
      }
    }
    setIsSubmitting(false);
  };

  if (showCelebration) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4">
        <DotGrid className="fixed inset-0" />
        <DecorativeBlob variant="yellow" size="lg" className="left-[15%] top-[15%] opacity-50 animate-float" />
        <DecorativeBlob variant="pink" size="lg" className="right-[15%] bottom-[15%] opacity-50 animate-float" />

        <PlayfulCard className="relative z-10 w-full max-w-md p-8 text-center animate-bounce-in">
          <div className="flex justify-center mb-4">
            <BrandLogo size="sm" className="mx-auto max-h-9 opacity-90" />
          </div>
          <div className="flex justify-center mb-6">
            <IconCircle variant="yellow" size="xl" className="animate-pulse-soft">
              <PartyPopper className="w-10 h-10" />
            </IconCircle>
          </div>

          <h2 className="font-outfit font-bold text-3xl text-navy mb-3">Excellent Work!</h2>
          <p className="font-jakarta text-navy-light mb-6">
            You've successfully completed the <span className="font-bold text-navy">{survey.title}</span>.
          </p>

          <div className="flex items-center justify-center gap-2 mb-8 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
            <Coins className="w-8 h-8 text-violet" />
            <span className="font-outfit font-bold text-3xl text-violet">+{survey.pointsReward}</span>
            <span className="font-jakarta text-navy-light">points earned</span>
          </div>

          <PlayfulButton variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />

      <nav className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-navy/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                handleExit();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-navy rounded-pill hover:bg-periwinkle transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-navy" />
            <span className="font-jakarta font-medium text-sm text-navy hidden sm:block">Exit Survey</span>
          </button>

          <div className="flex flex-col items-center gap-1 min-w-0 flex-1 px-2">
            <button type="button" onClick={() => navigate('/')} className="min-w-0" aria-label="Survey Panel Go home">
              <BrandLogo size="sm" className="max-h-7 mx-auto" />
            </button>
            <span className="font-outfit font-bold text-sm sm:text-lg text-navy text-center truncate w-full max-w-[min(100%,280px)] sm:max-w-md">
              {survey.title}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-yellow border-2 border-navy rounded-pill shrink-0">
            <Coins className="w-4 h-4 text-navy" />
            <span className="font-outfit font-bold text-sm text-navy">{survey.pointsReward} pts</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-navy-light">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="font-mono text-sm text-navy-light">{Math.round(progress)}%</span>
            </div>
            <PlayfulProgress value={currentStep + 1} max={questions.length} variant="violet" size="md" />
          </div>

          <PlayfulCard className="p-6 md:p-10">
            <div className="space-y-8">
              <div>
                <PlayfulBadge variant="lavender" size="sm" className="mb-4">
                  PART {currentStep + 1}
                </PlayfulBadge>
                <h2 className="font-outfit font-bold text-2xl md:text-3xl text-navy">{currentQuestion.question}</h2>
              </div>

              <div className="space-y-4">
                {currentQuestion.type === 'mcq' && (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className={`w-full flex items-center gap-4 p-5 border-2 border-navy rounded-2xl transition-all text-left ${getCurrentAnswer() === option
                            ? 'bg-violet text-white shadow-hard translate-x-1'
                            : 'bg-white hover:bg-periwinkle/50'
                          }`}
                      >
                        <div
                          className={`w-6 h-6 border-2 border-navy rounded-full flex items-center justify-center ${getCurrentAnswer() === option ? 'bg-white' : 'bg-white'
                            }`}
                        >
                          {getCurrentAnswer() === option && <div className="w-3 h-3 bg-violet rounded-full" />}
                        </div>
                        <span className="font-jakarta font-medium flex-1">{option}</span>
                        {getCurrentAnswer() === option && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <textarea
                    value={(getCurrentAnswer() as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full px-5 py-4 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all resize-none"
                  />
                )}

                {currentQuestion.type === 'rating' && (
                  <div className="flex flex-col items-center gap-6 py-6">
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleAnswer(num)}
                          className={`w-14 h-14 border-2 border-navy rounded-2xl flex items-center justify-center font-outfit font-bold text-xl transition-all ${getCurrentAnswer() === num
                              ? 'bg-yellow text-navy shadow-hard -translate-y-2'
                              : 'bg-white text-navy hover:bg-yellow/30'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between w-full max-w-[300px] px-2">
                      <span className="font-jakarta text-xs text-navy-light uppercase font-bold tracking-widest">
                        Poor
                      </span>
                      <span className="font-jakarta text-xs text-navy-light uppercase font-bold tracking-widest">
                        Excellent
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-navy/5">
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-6 py-2 font-jakarta font-bold text-navy hover:text-violet disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <PlayfulButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={(currentQuestion.required && !getCurrentAnswer()) || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isLastQuestion ? 'Submit Survey' : 'Next Question'}
                </PlayfulButton>
              </div>
            </div>
          </PlayfulCard>

          <footer className="mt-8 flex items-center justify-center gap-4 py-4 px-6 bg-lavender/30 border-2 border-navy/10 rounded-2xl">
            <Shield className="w-5 h-5 text-violet" />
            <p className="font-jakarta text-xs text-navy-light">
              Your responses are anonymous and protected by our privacy policy.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default InternalSurveyPage;
