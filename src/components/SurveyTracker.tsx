import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { startSurveyTracking, completeSurveyTracking } from '@/lib/api';

interface SurveyTrackerProps {
  surveyId: string;
  vendorId?: string;
  onTrackingStart?: (clickId: string, userId: string) => void;
  onTrackingComplete?: (clickId: string) => void;
  children?: (props: {
    startTracking: () => Promise<any>;
    completeTracking: (status: 'completed' | 'terminated' | 'quota_full') => Promise<any>;
    trackingData: { clickId: string; userId: string; ipAddress: string } | null;
    loading: boolean;
  }) => React.ReactNode;
}

export function useSurveyTracker(surveyId: string, vendorId?: string) {
  const { token } = useAuth();
  const [trackingData, setTrackingData] = useState<{
    clickId: string;
    userId: string;
    ipAddress: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://survey-panelgo.onrender.com";

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
      
      // MANDATORY: Always redirect to /api/redirect with proper params
      const auth = JSON.parse(localStorage.getItem("surveypanelgo_auth") || "{}");
      const pid = surveyId;
      const uid = auth?.id || auth?._id;
      
      if (!pid || !uid) {
        console.error("Missing pid or uid", { pid, uid });
        return;
      }
      
      const statusMap = {
        'completed': 1,
        'terminated': 2,
        'quota_full': 3
      };
      
      const statusCode = statusMap[status] || 2;
      
      console.log("Redirecting to API:", { pid, uid, status: statusCode, vendorId });
      window.location.href = `${BACKEND_URL}/api/redirect?pid=${pid}&uid=${uid}&status=${statusCode}&vendorId=${vendorId || ""}`;
      
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
export function SurveyTracker({ surveyId, vendorId, onTrackingStart, onTrackingComplete, children }: SurveyTrackerProps) {
  const { startTracking, completeTracking, trackingData, loading } = useSurveyTracker(surveyId, vendorId);

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
