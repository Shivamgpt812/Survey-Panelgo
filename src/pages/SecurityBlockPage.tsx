import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function SecurityBlockPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-gray-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Security Block
        </h1>
        
        <p className="text-gray-600 mb-6">
          Access to this survey has been blocked due to security concerns or suspicious activity.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-800">
            <strong>Status:</strong> Security Terminated
          </p>
          <p className="text-sm text-gray-700 mt-1">
            This may be due to multiple attempts, bot detection, or other security measures.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Contact Support
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
