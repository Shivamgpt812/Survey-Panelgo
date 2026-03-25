import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Coins, Check, AlertCircle } from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge, PlayfulProgress } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid } from '@/components/decorations';
import type { Survey } from '@/types';
import { apiGet, apiPost } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useToast } from '@/hooks/useToast';
import { getStoredToken, useAuth } from '@/hooks/useAuth';
import { useSurveyTracker } from '@/components/SurveyTracker';
import confetti from 'canvas-confetti';

const InternalSurveyPageWithTracking: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const { addToast } = useToast();
  const { refreshUser } = useAuth();

  const [survey, setSurvey] = useState<Survey | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Survey tracking integration
  const { startTracking, completeTracking, trackingData, loading: trackingLoading } = useSurveyTracker(surveyId || '');

  useEffect(() => {
    if (!surveyId) {
      setLoading(false);
      return;
    }
    void apiGet<{ survey: Survey }>(`/api/surveys/${surveyId}`, getStoredToken())
      .then((d) => setSurvey(d.survey))
      .catch(() => setSurvey(undefined))
      .finally(() => setLoading(false));
  }, [surveyId]);

  // Start tracking when survey loads
  useEffect(() => {
    if (survey && surveyId && !trackingData) {
      startTracking();
    }
  }, [survey, surveyId, trackingData, startTracking]);

  const questions = survey?.questions || [];

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = async () => {
    if (!survey || !trackingData) return;

    try {
      setIsSubmitting(true);
      
      // Submit the internal survey completion
      await apiPost('/api/internal-complete', { surveyId }, getStoredToken());
      
      // Complete tracking with 'completed' status
      await completeTracking('completed');
      
      // Show celebration and refresh user data
      setShowCelebration(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      await refreshUser();
      addToast('🎉 Survey completed successfully!', 'success');
      
      // NOTE: completeTracking will handle redirect to result page
      // No need for manual /api/redirect call
      
    } catch (error) {
      console.error('Failed to complete survey:', error);
      
      // FAIL CASE: If tracking fails, still try to complete with terminated status
      try {
        await completeTracking('terminated');
        // NOTE: completeTracking will handle redirect to result page
      } catch (trackingError) {
        console.error('Tracking also failed:', trackingError);
        addToast('Survey completed but tracking failed', 'warning');
        // Fallback to dashboard if everything fails
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerminate = async () => {
    if (!trackingData) return;

    try {
      await completeTracking('terminated');
      addToast('Survey terminated', 'info');
    } catch (error) {
      console.error('Failed to terminate tracking:', error);
      // Fallback navigation
      navigate('/dashboard');
    }
  };

  if (loading || trackingLoading) {
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

  if (showCelebration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <PlayfulCard className="p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-outfit font-bold text-2xl text-navy mb-2">Survey Completed!</h2>
          <p className="font-jakarta text-navy-light mb-4">
            You earned {survey.pointsReward} points for completing this survey.
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-outfit font-bold text-xl text-navy">+{survey.pointsReward}</span>
          </div>
          <PlayfulButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  // Rest of the existing survey component logic...
  // (Include all the existing question handling, step navigation, etc.)

  return (
    <div className="min-h-screen bg-periwinkle relative overflow-hidden">
      <DecorativeBlob className="top-10 right-10 w-64 h-64 bg-violet/20" />
      <DotGrid className="top-20 left-10" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <PlayfulButton 
            variant="outline" 
            size="sm" 
            onClick={() => handleTerminate()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Exit Survey
          </PlayfulButton>
        </div>

        <div className="max-w-2xl mx-auto">
          <PlayfulCard className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <BrandLogo className="w-16 h-16 mx-auto mb-4" />
              <h1 className="font-outfit font-bold text-3xl text-navy mb-2">{survey.title}</h1>
              <p className="font-jakarta text-navy-light mb-4">{survey.description}</p>
              <div className="flex items-center justify-center gap-4">
                <PlayfulBadge variant="violet">{survey.category}</PlayfulBadge>
                <PlayfulBadge variant="green">{survey.difficulty}</PlayfulBadge>
                {survey.isNew && <PlayfulBadge variant="yellow">NEW</PlayfulBadge>}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-jakarta text-sm text-navy-light">Progress</span>
                <span className="font-jakarta text-sm text-navy-light">
                  {currentStep + 1} of {questions.length}
                </span>
              </div>
              <PlayfulProgress 
                value={((currentStep + 1) / questions.length) * 100} 
                className="h-2"
              />
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="font-outfit font-semibold text-xl text-navy mb-4">
                {questions[currentStep]?.question}
              </h2>
              
              {/* Add your question rendering logic here */}
              {/* This would depend on your specific question types */}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Tracking Info:</strong> PID: {trackingData?.clickId || 'Loading...'}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <PlayfulButton
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </PlayfulButton>

              {currentStep === questions.length - 1 ? (
                <PlayfulButton
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Complete Survey
                </PlayfulButton>
              ) : (
                <PlayfulButton
                  onClick={() => setCurrentStep(Math.min(questions.length - 1, currentStep + 1))}
                >
                  Next
                </PlayfulButton>
              )}
            </div>
          </PlayfulCard>
        </div>
      </div>
    </div>
  );
};

export default InternalSurveyPageWithTracking;
