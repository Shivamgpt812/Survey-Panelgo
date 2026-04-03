import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        // Check for errors
        if (error) {
          console.error('OAuth error:', error);
          addToast('Google login was cancelled or failed', 'error');
          navigate('/auth');
          return;
        }

        // Verify state to prevent CSRF attacks
        const storedState = sessionStorage.getItem('google_oauth_state');
        if (!state || !storedState || state !== storedState) {
          console.error('Invalid state parameter');
          addToast('Invalid authentication state', 'error');
          navigate('/auth');
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem('google_oauth_state');

        if (!code) {
          console.error('No authorization code received');
          addToast('No authorization code received', 'error');
          navigate('/auth');
          return;
        }

        // Exchange authorization code for tokens and login
        const result = await googleLogin({ token: code });
        
        if (result.success && result.user) {
          addToast(`Welcome, ${result.user.name}! 🎉`, 'success');

          // Check for stored redirect URL (from vendor entry)
          const redirectUrl = sessionStorage.getItem('surveypanelgo_redirect');
          if (redirectUrl) {
            sessionStorage.removeItem('surveypanelgo_redirect');
            navigate(redirectUrl);
            return;
          }

          // Redirect based on role
          if (result.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          addToast(result.error || 'Google login failed', 'error');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback error:', error);
        addToast('Authentication failed', 'error');
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, googleLogin, addToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-periwinkle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="font-jakarta text-navy">Completing Google sign-in...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;
