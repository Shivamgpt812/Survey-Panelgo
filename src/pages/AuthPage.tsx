import React, { useState, useEffect } from 'react';
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Load Google GSI script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          initializeGoogleSignIn();
        };
      } else {
        initializeGoogleSignIn();
      }
    } catch (error) {
      console.error('Google login error:', error);
      addToast('Google login failed', 'error');
      setIsGoogleLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: '787845696998-3nl0cq616g0n21fm4mdomjdqo04ckvah.apps.googleusercontent.com',
      callback: async (response: any) => {
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
          addToast('Google login failed', 'error');
        } finally {
          setIsGoogleLoading(false);
        }
      },
    });

    // Show the One Tap popup
    window.google.accounts.id.prompt();
  };

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
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta font-medium text-sm text-navy hover:bg-periwinkle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? 'Signing in...' : 'Google'}
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta font-medium text-sm text-navy hover:bg-periwinkle transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Facebook
          </button>
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
