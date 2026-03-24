import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Coins, Check, AlertCircle } from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge, PlayfulProgress } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid } from '@/components/decorations';
import type { Survey } from '@/types';
import { apiGet, apiPost } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useToast } from '@/hooks/useToast';
import { useSurveyTracker } from '@/components/SurveyTracker';
import confetti from 'canvas-confetti';

const InternalSurveyPageWithTracking: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const BACKEND_URL = "https://survey-panelgo.onrender.com";

  const [survey, setSurvey] = useState<Survey | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Survey tracking integration
  const { startTracking, completeTracking, trackingData, loading: trackingLoading } = useSurveyTracker(surveyId || '');

  useEffect(() => {
    if (!surveyId) {
      setLoading(false);
      return;
    }
    void apiGet<{ survey: Survey }>(`/api/surveys/${surveyId}`)
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

    if (isSubmitting) {
      console.log("Submit already in progress, blocking duplicate call");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Read all required data from URL parameters
      const uid = searchParams.get('uid');
      const vendorId = searchParams.get('vendor');
      const pid = searchParams.get('pid') || surveyId;
      
      // Ensure UID exists (should be in URL from VendorEntryPage)
      if (!uid) {
        console.error("UID is missing from URL!");
        addToast('Missing unique identifier. Please use the survey link provided.', 'error');
        return;
      }
      
      // STEP 2: FORCE SUBMIT LOGGING
      console.log("=== SURVEY SUBMISSION DEBUG ===");
      console.log("Before API call - Payload:", { 
        surveyId, 
        uid, 
        vendorId, 
        pid, 
        status: "1" 
      });
      
      // Submit internal survey completion with data from URL (no auth token required)
      const response = await apiPost('/api/internal-complete', { 
        surveyId, 
        uid,        // from URL
        vendorId,   // from URL
        pid,        // from URL
        status: "1",  // status: "1" as required
      });
      
      console.log("After API call - Response:", response);
      
      // Complete tracking with 'completed' status
      await completeTracking('completed');
      
      // Show celebration
      setShowCelebration(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      addToast('🎉 Survey completed successfully!', 'success');
      
      // STEP 5: FORCE SUCCESS REDIRECT
      // MANDATORY: Add final redirect to /api/redirect with proper params
      // Use pid from URL (already defined above)
      
      if (pid && uid) {
        console.log("STEP 5: Force redirect with:", { pid, uid, status: 1 });
        window.location.href = `${BACKEND_URL}/api/redirect?pid=${encodeURIComponent(pid)}&uid=${encodeURIComponent(uid)}&status=1`;
      } else {
        console.error("Missing pid or uid for redirect");
      }
      
    } catch (error) {
      // STEP 4: VERIFY API RESPONSE - Handle errors properly
      console.log("STEP 4: API Error detected");
      console.error('Failed to complete survey - Full error:', error);
      
      // Show error message - DO NOT redirect to login
      addToast('Failed to submit survey. Please try again.', 'error');
      
      // STEP 8: ADD FAILSAFE - DO NOT navigate anywhere
      console.log("STEP 8: Failsafe activated - No navigation, just error toast");
      
    } finally {
      // STEP 3: BLOCK SECOND CLICK BEHAVIOR
      setIsSubmitting(false);
      console.log("Submit button re-enabled after operation completion");
    }
  };

  const handleTerminate = async () => {
    if (!trackingData) return;

    try {
      await completeTracking('terminated');
      addToast('Survey terminated', 'info');
    } catch (error) {
      console.error('Failed to terminate tracking:', error);
      // Show error message - DO NOT redirect to login
      addToast('Failed to terminate survey. Please try again.', 'error');
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
          <PlayfulButton onClick={() => navigate('/')}>Back to Home</PlayfulButton>
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
