import { useEffect, useState } from 'react';
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
      
      // For non-vendor users, redirect to result page (not /api/redirect)
      // This is used to show survey result pages to regular users
      const pid = trackingData.clickId; // Use the clickId from tracking data
      
      if (!pid) {
        console.error("Missing clickId for result page redirect");
        return;
      }
      
      console.log("🔗 Redirecting to survey result page:", { pid, status });
      window.location.href = `/survey-result/${pid}?status=${status}`;
      
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
