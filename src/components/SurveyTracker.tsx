import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { startSurveyTracking, completeSurveyTracking } from '@/lib/api';

interface SurveyTrackerProps {
  surveyId: string;
  onTrackingStart?: (clickId: string, userId: string) => void;
  onTrackingComplete?: (clickId: string) => void;
  children?: (props: {
    startTracking: () => Promise<any>;
    completeTracking: (status: 'completed' | 'terminated' | 'quota_full') => Promise<any>;
    trackingData: { clickId: string; userId: string; ipAddress: string } | null;
    loading: boolean;
  }) => React.ReactNode;
}

export function useSurveyTracker(surveyId: string) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState<{
    clickId: string;
    userId: string;
    ipAddress: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const startTracking = async () => {
    if (!surveyId) return null;

    try {
      setLoading(true);
      const response = await startSurveyTracking(surveyId, token);
      setTrackingData(response);
      return response;
    } catch (error) {
      console.error('Failed to start survey tracking:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeTracking = async (status: 'completed' | 'terminated' | 'quota_full') => {
    if (!trackingData) return;

    try {
      setLoading(true);
      const response = await completeSurveyTracking(
        surveyId,
        trackingData.userId,
        trackingData.clickId,
        status,
        token
      );
      
      // Redirect to result page
      navigate(response.redirectUrl);
      return response;
    } catch (error) {
      console.error('Failed to complete survey tracking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    startTracking,
    completeTracking,
    trackingData,
    loading,
  };
}

// Example wrapper component for easy integration
export function SurveyTracker({ surveyId, onTrackingStart, onTrackingComplete, children }: SurveyTrackerProps) {
  const { startTracking, completeTracking, trackingData, loading } = useSurveyTracker(surveyId);

  useEffect(() => {
    if (trackingData && onTrackingStart) {
      onTrackingStart(trackingData.clickId, trackingData.userId);
    }
  }, [trackingData, onTrackingStart]);

  const handleComplete = async (status: 'completed' | 'terminated' | 'quota_full') => {
    try {
      const response = await completeTracking(status);
      if (onTrackingComplete) {
        onTrackingComplete(trackingData?.clickId || '');
      }
      return response;
    } catch (error) {
      // Handle error as needed
      throw error;
    }
  };

  if (children) {
    return children({
      startTracking,
      completeTracking: handleComplete,
      trackingData,
      loading,
    });
  }

  return null;
}
