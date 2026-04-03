import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, googleLogin } = useAuth();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = isLogin
      ? await login({
          email: formData.email,
          password: formData.password,
        })
      : await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

    if (result.success && result.user) {
      addToast(`Welcome back, ${result.user.name}! 🎉`, 'success');

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
      addToast(result.error || 'Login failed', 'error');
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const initializeGoogleSignIn = async () => {
    console.log('Initializing Google Sign-In...');
    setIsGoogleLoading(true);
    
    try {
      // Load Google GSI script if not already loaded
      if (!window.google) {
        console.log('Loading Google GSI script...');
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          console.log('Google GSI script loaded');
          setupGoogleSignIn();
        };
        script.onerror = () => {
          console.error('Failed to load Google GSI script');
          addToast('Failed to load Google Sign-In', 'error');
          setIsGoogleLoading(false);
        };
      } else {
        console.log('Google GSI script already loaded');
        setupGoogleSignIn();
      }
    } catch (error) {
      console.error('Google login error:', error);
      addToast('Google login failed', 'error');
      setIsGoogleLoading(false);
    }
  };

  const setupGoogleSignIn = () => {
    console.log('Setting up Google Sign-In...');
    if (!window.google) {
      console.error('Google object not available');
      addToast('Google Sign-In not available', 'error');
      setIsGoogleLoading(false);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: '787845696998-3nl0cq616g0n21fm4mdomjdqo04ckvah.apps.googleusercontent.com',
        callback: async (response: any) => {
          console.log('Google callback received:', response);
          // Show loading state when authentication starts
          setIsAuthenticating(true);
          addToast('Signing in with Google...', 'info');
          
          try {
            const result = await googleLogin({ token: response.credential });
            
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
            }
          } catch (error) {
            console.error('Google login callback error:', error);
            addToast('Google login failed. The server might be starting up, please try again.', 'error');
          } finally {
            setIsAuthenticating(false);
          }
        },
      });

      console.log('Google Sign-In initialized, rendering button...');
      // Render the Google Sign-In button directly
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = ''; // Clear previous button
        buttonContainer.classList.remove('hidden'); // Show the container
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        });
        setIsGoogleLoading(false);
      } else {
        console.error('Google button container not found');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Error setting up Google Sign-In:', error);
      addToast('Failed to set up Google Sign-In', 'error');
      setIsGoogleLoading(false);
    }
  };

  // Initialize Google Sign-In on component mount
  React.useEffect(() => {
    initializeGoogleSignIn();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4 pt-24 sm:pt-28">
      {/* Background Pattern */}
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="pink" size="lg" className="left-[5%] top-[10%] opacity-50" />
      <DecorativeBlob variant="yellow" size="md" className="right-[8%] top-[15%] opacity-50" />
      <DecorativeBlob variant="green" size="lg" className="right-[5%] bottom-[10%] opacity-50" />
      <DecorativeBlob variant="lavender" size="md" className="left-[8%] bottom-[15%] opacity-50" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white border-2 border-navy rounded-pill shadow-hard-sm hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="font-jakarta font-medium text-sm text-navy">Back</span>
      </button>

      {/* Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-[min(100%,360px)] px-4 flex justify-center">
        <BrandLogo size="nav" className="mx-auto max-h-14 sm:max-h-16" />
      </div>

      {/* Auth Card */}
      <PlayfulCard className="relative z-10 w-full max-w-md p-6 md:p-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <IconCircle variant={isLogin ? 'violet' : 'pink'} size="xl">
              {isLogin ? <Lock className="w-8 h-8" /> : <User className="w-8 h-8" />}
            </IconCircle>
          </div>
          <h1 className="font-outfit font-bold text-2xl md:text-3xl text-navy mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="font-jakarta text-navy-light">
            {isLogin
              ? 'Sign in to continue earning rewards'
              : 'Join thousands earning rewards daily'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="font-outfit font-semibold text-sm text-navy">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/60">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-outfit font-semibold text-sm text-navy">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/60">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-outfit font-semibold text-sm text-navy">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/60">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/60 hover:text-navy transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-navy rounded accent-violet"
                />
                <span className="font-jakarta text-sm text-navy-light">Remember me</span>
              </label>
              <button type="button" className="font-jakarta text-sm text-violet hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <PlayfulButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </PlayfulButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-navy/20" />
          <span className="font-jakarta text-sm text-navy-light">or continue with</span>
          <div className="flex-1 h-px bg-navy/20" />
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          {/* Google Sign-In Button - Always Visible */}
          <div id="google-signin-button" className="w-full flex justify-center" />
          
          {/* Loading indicator while Google button loads or authenticating */}
          {(isGoogleLoading || isAuthenticating) && (
            <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta font-medium text-sm text-navy">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy"></div>
              {isAuthenticating ? 'Authenticating with Google...' : 'Loading Google Sign-In...'}
            </div>
          )}
        </div>

        {/* Toggle */}
        <div className="text-center mt-6">
          <p className="font-jakarta text-navy-light">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-violet hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow border-2 border-navy rounded-full animate-float" />
        <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-pink border-2 border-navy rounded-full animate-float animation-delay-300" />
      </PlayfulCard>
    </div>
  );
};

export default AuthPage;
