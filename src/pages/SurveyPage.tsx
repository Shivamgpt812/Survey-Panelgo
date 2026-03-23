import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Survey } from '@/types';
import { apiGet } from '@/lib/api';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';
import { AlertCircle } from 'lucide-react';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (survey && surveyId) {
      navigate(`/survey/${surveyId}/precheck`, { replace: true });
    }
  }, [survey, surveyId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet border-t-transparent rounded-full animate-spin" />
          <span className="font-jakarta text-navy">Loading...</span>
        </div>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-periwinkle">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-violet border-t-transparent rounded-full animate-spin" />
        <span className="font-jakarta text-navy">Loading...</span>
      </div>
    </div>
  );
};

export default SurveyPage;
