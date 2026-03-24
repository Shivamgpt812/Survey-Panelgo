import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function QuotaFullPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quota Full
        </h1>
        
        <p className="text-gray-600 mb-6">
          This survey has reached its maximum number of respondents and is now closed.
        </p>
        
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Status:</strong> Quota Full
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            The required number of participants has been reached for this survey.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Find More Surveys
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Back to Home
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Redirecting to homepage in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}
