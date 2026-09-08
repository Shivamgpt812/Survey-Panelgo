import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Navbar } from '@/components/layout/Navbar';
import { PanelOnboardingModal } from '@/components/panel/PanelOnboardingModal';
import { apiPost } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

const panelConfig: Record<
  string,
  {
    title: string;
    badge: string;
    desc: string;
    color: 'violet' | 'pink' | 'yellow' | 'green' | 'lavender';
    backUrl: string;
  }
> = {
  b2b: {
    title: 'B2B Leaders & Decision Makers Panel',
    badge: 'B2B Panelist Portal',
    desc: 'Access exclusive enterprise research, technology surveys, and executive advisory studies.',
    color: 'violet',
    backUrl: '/panels/b2b',
  },
  b2c: {
    title: 'B2C Consumer & Lifestyle Panel',
    badge: 'B2C Panelist Portal',
    desc: 'Share your everyday brand, retail, digital, and family preferences for high-value rewards.',
    color: 'pink',
    backUrl: '/panels/b2c',
  },
  'patients-carers': {
    title: 'Patients & Caregivers Research Panel',
    badge: 'Patient & Carer Portal',
    desc: 'Contribute real-world healthcare experiences with strict privacy and confidential data safeguards.',
    color: 'yellow',
    backUrl: '/panels/patients-carers',
  },
  'healthcare-professionals': {
    title: 'Healthcare Professionals (HCP) Panel',
    badge: 'HCP Professional Portal',
    desc: 'Participate in medical council verified clinical surveys, IDIs, and advisory consultations.',
    color: 'green',
    backUrl: '/panels/healthcare-professionals',
  },
};

export const PanelAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { panelType: paramPanelType } = useParams<{ panelType?: string }>();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { setAuthUser } = useAuth() as any;

  const panelType =
    paramPanelType || searchParams.get('panel') || 'b2b';
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<'email' | 'otp-password'>('email');
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Modal State
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const config = panelConfig[panelType] || panelConfig.b2b;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [panelType, mode]);

  // Resend Timer Countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Forgot Resend Timer Countdown
  useEffect(() => {
    if (forgotResendCooldown > 0) {
      const timer = setTimeout(() => setForgotResendCooldown(forgotResendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotResendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiPost<{
        token: string;
        user: User;
        needsOnboarding: boolean;
      }>('/api/panel-auth/login', {
        email: formData.email,
        password: formData.password,
        panelType,
      });

      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setAuthToken(res.token);
        setRegisteredUser(res.user);
        if (setAuthUser) setAuthUser(res.user, res.token);

        if (res.user.role === 'admin') {
          addToast(`Welcome back, Administrator ${res.user.name}! 🎉`, 'success');
          navigate('/admin');
          return;
        }

        if (res.needsOnboarding) {
          addToast('Welcome! Please complete your panelist profile.', 'info');
          setShowOnboardingModal(true);
        } else {
          addToast(`Welcome back, ${res.user.name}! 🎉`, 'success');
          navigate('/panels/dashboard');
        }
      }
    } catch (err: any) {
      addToast(err?.message || 'Invalid email or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Signup Step 1: Send OTP via Gmail SMTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      addToast('Please fill all fields', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsSendingOtp(true);

    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        '/api/panel-auth/send-otp',
        {
          email: formData.email,
          panelType,
        }
      );

      if (res.success) {
        addToast(`Verification code sent to ${formData.email}! Check your inbox.`, 'success');
        setStep('otp');
        setResendCooldown(60);
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 3. Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSendingOtp(true);

    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        '/api/panel-auth/send-otp',
        {
          email: formData.email,
          panelType,
        }
      );

      if (res.success) {
        addToast('New verification code sent to your email!', 'success');
        setResendCooldown(60);
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 4. Handle Signup Step 2: Verify OTP & Register
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp.trim()) {
      addToast('Please enter the 6-digit verification code', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiPost<{
        token: string;
        user: User;
        needsOnboarding: boolean;
        message: string;
      }>('/api/panel-auth/verify-and-register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        panelType,
        otp: formData.otp,
      });

      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setAuthToken(res.token);
        setRegisteredUser(res.user);
        if (setAuthUser) setAuthUser(res.user, res.token);

        addToast('Email verified successfully! Complete your profile to start.', 'success');
        setShowOnboardingModal(true);
      }
    } catch (err: any) {
      addToast(err?.message || 'Verification failed. Please check the code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Forgot Password - Send OTP via SMTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotData.email.trim()) {
      addToast('Please enter your registered email address', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        '/api/panel-auth/forgot-password/send-otp',
        {
          email: forgotData.email,
          panelType,
        }
      );

      if (res.success) {
        addToast(`Password reset verification code sent to ${forgotData.email}! Check your inbox.`, 'success');
        setForgotStep('otp-password');
        setForgotResendCooldown(60);
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to send reset code. Please check your email and try again.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 6. Handle Forgot Password - Resend OTP
  const handleResendForgotOtp = async () => {
    if (forgotResendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        '/api/panel-auth/forgot-password/send-otp',
        {
          email: forgotData.email,
          panelType,
        }
      );

      if (res.success) {
        addToast('New password reset code sent to your email!', 'success');
        setForgotResendCooldown(60);
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to resend reset code', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 7. Handle Forgot Password - Verify OTP & Update Password in Database
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotData.otp.trim()) {
      addToast('Please enter the 6-digit verification code', 'error');
      return;
    }

    if (!forgotData.newPassword) {
      addToast('Please enter your new password', 'error');
      return;
    }

    if (forgotData.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      addToast('New passwords do not match. Please verify and re-enter.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        '/api/panel-auth/forgot-password/verify-and-reset',
        {
          email: forgotData.email,
          otp: forgotData.otp,
          newPassword: forgotData.newPassword,
        }
      );

      if (res.success) {
        addToast('Password updated successfully! You can now sign in with your new password.', 'success');
        setFormData((prev) => ({
          ...prev,
          email: forgotData.email,
          password: '',
        }));
        setMode('login');
        setForgotStep('email');
        setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to reset password. Please check the code and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (setAuthUser) setAuthUser(updatedUser, authToken);
    setShowOnboardingModal(false);
    navigate('/panels/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex flex-col justify-between">
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant={config.color} size="lg" className="left-[8%] top-[12%] opacity-60" />
      <DecorativeBlob variant="pink" size="md" className="right-[10%] top-[18%] opacity-60" />
      <DecorativeBlob variant="green" size="lg" className="right-[12%] bottom-[20%] opacity-60" />

      {/* Website Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          {/* Header Card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <PlayfulBadge variant={config.color} size="md">
                {config.badge}
              </PlayfulBadge>
            </div>
            <h1 className="font-outfit font-black text-2xl sm:text-3xl text-navy tracking-tight">
              {mode === 'login'
                ? 'Sign In to Your Panel'
                : mode === 'signup'
                ? 'Join the Research Panel'
                : 'Reset Your Password'}
            </h1>
            <p className="font-jakarta text-xs sm:text-sm text-navy/70 mt-1.5 max-w-sm mx-auto">
              {mode === 'forgot-password'
                ? 'Verify your email address to securely reset your account password.'
                : config.desc}
            </p>
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => navigate(config.backUrl)}
                className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold text-navy/70 hover:text-violet transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to {config.badge} Overview</span>
              </button>
            </div>
          </div>

          <PlayfulCard variant="static" className="p-6 sm:p-8 bg-white/95 backdrop-blur-md">
            {/* Mode Switcher Tabs (Sign In / Create Account) */}
            {mode !== 'forgot-password' && (
              <div className="flex bg-navy/5 p-1 rounded-2xl border-2 border-navy/10 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStep('form');
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-jakarta font-bold text-sm transition-all ${
                    mode === 'login'
                      ? 'bg-white text-navy shadow-hard-sm border-2 border-navy'
                      : 'text-navy/60 hover:text-navy'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setStep('form');
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-jakarta font-bold text-sm transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-navy shadow-hard-sm border-2 border-navy'
                      : 'text-navy/60 hover:text-navy'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-violet" />
                    Panel Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-violet" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotData({
                          email: formData.email,
                          otp: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setMode('forgot-password');
                        setForgotStep('email');
                      }}
                      className="font-jakarta text-xs font-semibold text-violet hover:text-navy transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <PlayfulButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In to Panel'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PlayfulButton>
              </form>
            )}

            {/* FORGOT PASSWORD - STEP 1: ENTER EMAIL */}
            {mode === 'forgot-password' && forgotStep === 'email' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-violet/10 rounded-2xl border-2 border-navy flex items-center justify-center mx-auto mb-3 shadow-hard-sm">
                    <KeyRound className="w-6 h-6 text-violet" />
                  </div>
                  <h3 className="font-outfit font-black text-xl text-navy">
                    Forgot Password?
                  </h3>
                  <p className="font-jakarta text-xs text-navy/70 mt-1 max-w-xs mx-auto">
                    Enter your registered email address and we will send a 6-digit verification code to reset your password.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-violet" />
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotData.email}
                    onChange={(e) => setForgotData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="name@company.com"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  />
                </div>

                <PlayfulButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-2"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'Sending Code...' : 'Send Verification Code'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PlayfulButton>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotStep('email');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-jakarta font-bold text-navy/70 hover:text-violet transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD - STEP 2: ENTER OTP & NEW PASSWORD */}
            {mode === 'forgot-password' && forgotStep === 'otp-password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green/20 rounded-2xl border-2 border-navy flex items-center justify-center mx-auto mb-3 shadow-hard-sm">
                    <ShieldCheck className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="font-outfit font-black text-xl text-navy">
                    Set New Password
                  </h3>
                  <p className="font-jakarta text-xs text-navy/70 mt-1 max-w-xs mx-auto">
                    We sent a 6-digit code to <span className="font-bold text-navy">{forgotData.email}</span>. Enter the code and your new password below.
                  </p>
                </div>

                {/* 6-Digit OTP code input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-violet" />
                      Verification Code
                    </label>
                    <button
                      type="button"
                      disabled={forgotResendCooldown > 0 || isSendingOtp}
                      onClick={handleResendForgotOtp}
                      className="text-xs font-jakarta font-semibold text-violet hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {forgotResendCooldown > 0 ? `Resend code in ${forgotResendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotData.otp}
                    onChange={(e) => setForgotData((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-mono font-bold text-center text-lg tracking-widest text-navy placeholder:text-navy/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={forgotData.confirmPassword}
                      onChange={(e) => setForgotData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <PlayfulButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PlayfulButton>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotStep('email');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-jakarta font-bold text-navy/70 hover:text-violet transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP STEP 1: Enter details & trigger OTP */}
            {mode === 'signup' && step === 'form' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-violet" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-violet" />
                    Email Address (OTP will be sent here)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet" />
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <PlayfulButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-2"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'Sending Verification Code...' : 'Continue to Verification'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PlayfulButton>
              </form>
            )}

            {/* SIGNUP STEP 2: Verify OTP code */}
            {mode === 'signup' && step === 'otp' && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-yellow/20 rounded-2xl border-2 border-navy flex items-center justify-center mx-auto mb-3 shadow-hard-sm">
                    <Sparkles className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="font-outfit font-black text-xl text-navy">
                    Enter Verification Code
                  </h3>
                  <p className="font-jakarta text-xs text-navy/70 mt-1 max-w-xs mx-auto">
                    We sent a 6-digit code to <span className="font-bold text-navy">{formData.email}</span>. Enter it below to complete registration.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    name="otp"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        otp: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    placeholder="••••••"
                    required
                    autoFocus
                    className="w-full py-3.5 bg-white border-3 border-navy rounded-2xl font-mono font-extrabold text-2xl text-center tracking-[8px] text-violet focus:outline-none focus:border-violet shadow-hard-sm"
                  />
                </div>
                
                <PlayfulButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying Code...' : 'Verify & Fill Profile'}
                  <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </PlayfulButton>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-xs font-jakarta font-semibold text-navy/60 hover:text-navy transition-colors"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSendingOtp}
                    className={`inline-flex items-center gap-1 text-xs font-jakarta font-bold ${
                      resendCooldown > 0
                        ? 'text-navy/40 cursor-not-allowed'
                        : 'text-violet hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </PlayfulCard>
        </div>
      </main>

      {/* Onboarding Profile Modal */}
      <PanelOnboardingModal
        isOpen={showOnboardingModal}
        user={registeredUser}
        token={authToken}
        panelType={panelType}
        onClose={() => {
          setShowOnboardingModal(false);
          navigate('/panels/dashboard');
        }}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};
