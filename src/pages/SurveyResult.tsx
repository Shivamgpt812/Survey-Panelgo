import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Globe, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getSurveyTracking } from '@/lib/api';

interface TrackingData {
  id: string;
  surveyId: string;
  userId: string;
  clickId: string;
  ipAddress: string;
  status: string;
  timestamp: string;
}

export default function SurveyResult() {
  const { clickId } = useParams<{ clickId: string }>();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!clickId) {
        setError('No Click ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await getSurveyTracking(clickId);
        setTracking(response.tracking);
      } catch (err) {
        setError('Failed to load tracking data');
        console.error('Error fetching tracking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [clickId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'terminated':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'quota_full':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      case 'quota_full':
        return <Badge className="bg-yellow-100 text-yellow-800">Quota Full</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Survey completed successfully! Thank you for your participation.';
      case 'terminated':
        return 'Survey was terminated. You did not meet the qualifying criteria.';
      case 'quota_full':
        return 'Survey quota is full. No more responses are being accepted.';
      default:
        return 'Survey status unknown.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey results...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Tracking data not found'}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(tracking.status)}
            </div>
            <CardTitle className="text-2xl">Survey Result</CardTitle>
            <p className="text-gray-600 mt-2">
              {getStatusMessage(tracking.status)}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tracking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-gray-900">{tracking.userId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="font-medium text-gray-900">{tracking.ipAddress}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Click ID (PID)</p>
                  <p className="font-medium text-gray-900">{tracking.clickId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(tracking.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Survey ID</p>
                  <p className="font-medium text-gray-900">{tracking.surveyId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  {getStatusBadge(tracking.status)}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This information has been securely logged in our system. 
                The data displayed above matches exactly what is stored in our database.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
