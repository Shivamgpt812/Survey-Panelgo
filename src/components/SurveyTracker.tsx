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

  const BACKEND_URL = "https://survey-panelgo.onrender.com";

  const startTracking = async () => {
    console.log("=== START TRACKING DEBUG ===");
    console.log("surveyId:", surveyId);
    console.log("token:", token);
    
    if (!surveyId) {
      console.log("ERROR: No surveyId provided");
      return null;
    }

    try {
      setLoading(true);
      console.log("Calling startSurveyTracking API...");
      const response = await startSurveyTracking(surveyId, token);
      console.log("startSurveyTracking response:", response);
      setTrackingData(response);
      console.log("Tracking data set successfully");
      return response;
    } catch (error) {
      console.error('Failed to start survey tracking:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeTracking = async (status: 'completed' | 'terminated' | 'quota_full') => {
    console.log("=== COMPLETE TRACKING DEBUG ===");
    console.log("status received:", status);
    console.log("trackingData:", trackingData);
    console.log("surveyId:", surveyId);
    
    if (!trackingData) {
      console.log("ERROR: No tracking data in completeTracking");
      return;
    }

    try {
      setLoading(true);
      const response = await completeSurveyTracking(
        surveyId,
        trackingData.userId,
        trackingData.clickId,
        status,
        token
      );
      
      console.log("completeSurveyTracking API call successful");
      
      // MANDATORY: Always redirect to /api/redirect with proper params
      const auth = JSON.parse(localStorage.getItem("surveypanelgo_auth") || "{}");
      const pid = surveyId;
      const uid = auth?.id || auth?._id;
      
      console.log("Auth data:", { auth, pid, uid });
      
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
      
      console.log("Status mapping:", { status, statusCode, statusMap });
      console.log("Redirecting to API:", { pid, uid, status: statusCode });
      window.location.href = `${BACKEND_URL}/api/redirect?pid=${pid}&uid=${uid}&status=${statusCode}`;
      
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
