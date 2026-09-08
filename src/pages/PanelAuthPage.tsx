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

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
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

      {/* Top Bar */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/70 backdrop-blur-md border-b-2 border-navy/10">
        <div className="w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(config.backUrl)}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
          </button>
          <button
            onClick={() => navigate(config.backUrl)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-jakarta font-bold text-navy hover:text-violet transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {config.badge}</span>
          </button>
        </div>
      </header>

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
              {mode === 'login' ? 'Sign In to Your Panel' : 'Join the Research Panel'}
            </h1>
            <p className="font-jakarta text-xs sm:text-sm text-navy/70 mt-1.5 max-w-sm mx-auto">
              {config.desc}
            </p>
          </div>

          <PlayfulCard variant="static" className="p-6 sm:p-8 bg-white/95 backdrop-blur-md">
            {/* Mode Switcher Tabs */}
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
                  <label className="font-jakarta font-bold text-xs text-navy flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet" />
                    Password
                  </label>
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
                  {isSendingOtp ? 'Sending Verification Code...' : 'Continue & Get OTP'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </PlayfulButton>
              </form>
            )}

            {/* SIGNUP STEP 2: Enter 6-digit OTP */}
            {mode === 'signup' && step === 'otp' && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div className="bg-violet/10 border-2 border-violet/30 rounded-2xl p-4 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-violet text-white flex items-center justify-center mb-2 shadow-hard-sm">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="font-outfit font-bold text-base text-navy">
                    Enter 6-Digit OTP
                  </h3>
                  <p className="font-jakarta text-xs text-navy/70 mt-1">
                    We sent a one-time verification code to{' '}
                    <strong className="text-navy">{formData.email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="123456"
                    maxLength={6}
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
