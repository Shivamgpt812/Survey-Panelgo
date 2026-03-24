import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function TerminatedPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Survey Terminated
        </h1>
        
        <p className="text-gray-600 mb-6">
          Unfortunately, you did not meet the qualification criteria for this survey.
        </p>
        
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>Status:</strong> Terminated
          </p>
          <p className="text-sm text-red-700 mt-1">
            This could be due to screening questions or quota requirements.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Try Another Survey
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
