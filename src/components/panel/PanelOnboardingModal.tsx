import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Globe,
  MapPin,
  TrendingUp,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { apiPost } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { User } from '@/types';

interface PanelOnboardingModalProps {
  isOpen: boolean;
  user: User | null;
  token: string | null;
  panelType?: string;
  onComplete: (updatedUser: User) => void;
  onClose?: () => void;
}

const employmentOptions = [
  { value: 'Employed', label: 'Employed (Full-time / Part-time)' },
  { value: 'Self-Employed / Freelancer', label: 'Self-Employed / Freelancer / Business Owner' },
  { value: 'Student', label: 'Student / Scholar' },
  { value: 'Unemployed', label: 'Unemployed / Seeking Opportunity' },
  { value: 'Retired', label: 'Retired' },
];

const industriesList = [
  'Technology & Software (IT/SaaS)',
  'Healthcare & Pharmaceuticals',
  'Finance, Banking & Insurance',
  'Retail, FMCG & eCommerce',
  'Education & Academic Research',
  'Manufacturing & Industrial',
  'Automotive & Transportation',
  'Marketing, Advertising & Media',
  'Telecommunications & Network',
  'Construction & Real Estate',
  'Hospitality, Travel & Food Services',
  'Energy, Utilities & Mining',
  'Government & Public Sector',
  'Non-Profit & NGO',
  'Other / Student',
];

const departmentsList = [
  'Information Technology / Engineering',
  'Sales, Business Development & Partnerships',
  'Marketing, Growth & Branding',
  'Finance, Accounting & Procurement',
  'Human Resources & Talent Acquisition',
  'Operations, Logistics & Supply Chain',
  'Clinical, Medical & Patient Care',
  'Legal, Compliance & Risk Management',
  'Executive Leadership / C-Suite / Founder',
  'Student / Academic',
  'Other',
];

const countriesList = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'Japan',
  'South Korea',
  'Brazil',
  'Mexico',
  'South Africa',
  'Netherlands',
  'Switzerland',
  'Italy',
  'Spain',
  'Other',
];

const incomeRevenueBrackets = [
  'Under $25,000 / Under ₹3,00,000',
  '$25,000 - $50,000 / ₹3,00,000 - ₹6,00,000',
  '$50,000 - $100,000 / ₹6,00,000 - ₹15,00,000',
  '$100,000 - $250,000 / ₹15,00,000 - ₹30,00,000',
  '$250,000 - $500,000 / ₹30,00,000 - ₹50,00,000',
  '$500,000+ / ₹50,00,000+',
];

export const PanelOnboardingModal: React.FC<PanelOnboardingModalProps> = ({
  isOpen,
  user,
  token,
  panelType = 'general',
  onComplete,
  onClose,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employmentStatus: user?.employmentStatus || 'Employed',
    industry: user?.industry || 'Technology & Software (IT/SaaS)',
    roleTitle: user?.roleTitle || '',
    department: user?.department || 'Information Technology / Engineering',
    country: user?.country || 'India',
    revenue: user?.revenue || '$25,000 - $50,000 / ₹3,00,000 - ₹6,00,000',
    area: user?.area || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  });

  // Sync state whenever user prop updates
  useEffect(() => {
    if (user) {
      setFormData({
        employmentStatus: user.employmentStatus || 'Employed',
        industry: user.industry || 'Technology & Software (IT/SaaS)',
        roleTitle: user.roleTitle || '',
        department: user.department || 'Information Technology / Engineering',
        country: user.country || 'India',
        revenue: user.revenue || '$25,000 - $50,000 / ₹3,00,000 - ₹6,00,000',
        area: user.area || '',
        city: user.city || '',
        pincode: user.pincode || '',
      });
    }
  }, [user, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city.trim() || !formData.pincode.trim()) {
      addToast('Please provide your city and pin/postal code.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken =
        token ||
        localStorage.getItem('surveypanelgo_token') ||
        localStorage.getItem('token') ||
        '';

      const response = await apiPost<{ success: boolean; user: User; message: string }>(
        '/api/panel-auth/complete-profile',
        formData,
        authToken
      );

      if (response.success && response.user) {
        addToast(
          user?.onboardingCompleted
            ? 'Profile updated successfully!'
            : 'Profile completed successfully! Welcome to your dashboard. 🎉',
          'success'
        );
        onComplete(response.user);
      } else {
        addToast('Failed to save profile. Please try again.', 'error');
      }
    } catch (err: any) {
      console.error('Error completing onboarding profile:', err);
      addToast(err?.message || 'Failed to submit profile details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border-4 border-navy shadow-hard-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-violet p-6 sm:p-8 text-white relative flex-shrink-0 border-b-4 border-navy">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full border-2 border-white/40 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 z-10"
              aria-label="Close"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2 pr-10">
            <Sparkles className="w-5 h-5 text-yellow animate-spin-slow" />
            <PlayfulBadge variant="yellow" size="sm">
              {user?.onboardingCompleted ? 'Panelist Profile' : 'Step 2 of 2: Panelist Profiling'}
            </PlayfulBadge>
          </div>
          <h2 className="font-outfit font-black text-2xl sm:text-3xl tracking-tight">
            {user?.onboardingCompleted ? 'Edit Panelist Profile' : 'Complete Your Panelist Profile'}
          </h2>
          <p className="font-jakarta text-white/90 text-sm sm:text-base mt-1 pr-8">
            Fill in your demographic and professional background to receive surveys matching your exact profile.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Employment Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-jakarta font-bold text-sm text-navy">
              <Briefcase className="w-4 h-4 text-violet" />
              Employment Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {employmentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.employmentStatus === opt.value
                      ? 'border-violet bg-violet/10 shadow-hard-sm font-bold text-navy'
                      : 'border-navy/20 bg-white hover:border-navy/50 text-navy/80 font-medium'
                  }`}
                >
                  <input
                    type="radio"
                    name="employmentStatus"
                    value={opt.value}
                    checked={formData.employmentStatus === opt.value}
                    onChange={handleChange}
                    className="accent-violet w-4 h-4"
                  />
                  <span className="font-jakarta text-xs sm:text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-jakarta font-bold text-sm text-navy">
                <Building2 className="w-4 h-4 text-violet" />
                Industry Vertical <span className="text-red-500">*</span>
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                required
              >
                {industriesList.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-jakarta font-bold text-sm text-navy">
                <Layers className="w-4 h-4 text-violet" />
                Job Title / Primary Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roleTitle"
                value={formData.roleTitle}
                onChange={handleChange}
                placeholder={
                  formData.employmentStatus === 'Student'
                    ? 'e.g. Graduate Student / Major'
                    : 'e.g. Senior Manager / Specialist / Doctor'
                }
                className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                required
              />
            </div>
          </div>

          {/* Department & Income Bracket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-jakarta font-bold text-sm text-navy">
                <Briefcase className="w-4 h-4 text-violet" />
                Department / Function <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                required
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-jakarta font-bold text-sm text-navy">
                <TrendingUp className="w-4 h-4 text-violet" />
                Annual Income / Revenue Bracket <span className="text-red-500">*</span>
              </label>
              <select
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                required
              >
                {incomeRevenueBrackets.map((bracket) => (
                  <option key={bracket} value={bracket}>
                    {bracket}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4 pt-2 border-t-2 border-navy/10">
            <h4 className="font-outfit font-bold text-base text-navy flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet" />
              Geographic Information (Country & City Wise)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-jakarta font-bold text-xs text-navy/80">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  required
                >
                  {countriesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-jakarta font-bold text-xs text-navy/80">
                  State / Province / Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra, California, Ontario"
                  className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-jakarta font-bold text-xs text-navy/80">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, New York, London, Toronto"
                  className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-jakarta font-bold text-xs text-navy/80">
                  Pin Code / Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 400001, 10001, M5V 2T6"
                  className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t-2 border-navy/10 flex flex-col-reverse sm:flex-row items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border-2 border-navy/30 hover:border-navy text-navy font-jakarta font-bold text-sm rounded-xl transition-all hover:bg-navy/5 text-center cursor-pointer"
              >
                Cancel
              </button>
            )}
            <PlayfulButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:flex-1 justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Saving Profile...'
              ) : (
                <>
                  <span>{user?.onboardingCompleted ? 'Save Profile Changes' : 'Save Profile & Enter Dashboard'}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </PlayfulButton>
          </div>
        </form>
      </div>
    </div>
  );
};
