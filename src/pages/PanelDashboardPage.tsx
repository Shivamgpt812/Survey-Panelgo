import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  ClipboardList,
  Gift,
  Clock,
  TrendingUp,
  LogOut,
  User as UserIcon,
  ChevronRight,
  Flame,
  Sparkles,
  CheckCircle2,
  Building2,
  Briefcase,
  Globe,
  MapPin,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge, PlayfulProgress } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth, getStoredToken } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiGet } from '@/lib/api';
import type { Survey, User, SurveyResponseRecord } from '@/types';
import { PanelOnboardingModal } from '@/components/panel/PanelOnboardingModal';

const panelLabels: Record<string, { label: string; badgeVariant: 'violet' | 'pink' | 'yellow' | 'green' }> = {
  b2b: { label: 'B2B Decision Makers Panel', badgeVariant: 'violet' },
  b2c: { label: 'B2C Consumer & Lifestyle Panel', badgeVariant: 'pink' },
  'patients-carers': { label: 'Patients & Caregivers Panel', badgeVariant: 'yellow' },
  'healthcare-professionals': { label: 'Healthcare Professionals (HCP) Panel', badgeVariant: 'green' },
  general: { label: 'General Research Panel', badgeVariant: 'violet' },
};

const countryMap: Record<string, string[]> = {
  uk: ['uk', 'united kingdom', 'great britain', 'britain', 'england', 'scotland', 'wales'],
  us: ['us', 'usa', 'united states', 'america', 'american'],
  in: ['india', 'indian'],
  se: ['sweden', 'swedish'],
  de: ['germany', 'german', 'deutschland', 'de loi', 'de-loi', 'de '],
  ca: ['canada', 'canadian'],
  au: ['australia', 'australian', 'aussie'],
  fr: ['france', 'french'],
  nl: ['netherlands', 'dutch', 'holland'],
  sg: ['singapore', 'singaporean'],
  ae: ['uae', 'united arab emirates', 'dubai', 'abu dhabi'],
};

function checkCountryMismatch(fullText: string, userCountryStr?: string): boolean {
  if (!userCountryStr) return false;
  const uCountry = userCountryStr.toLowerCase().trim();

  let userCode: string | null = null;
  for (const [code, aliases] of Object.entries(countryMap)) {
    if (aliases.some((a) => uCountry.includes(a) || a.includes(uCountry))) {
      userCode = code;
      break;
    }
  }

  for (const [code, aliases] of Object.entries(countryMap)) {
    if (userCode && code === userCode) continue;

    for (const alias of aliases) {
      if (alias.length <= 2) {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        if (regex.test(fullText) && (fullText.includes('resident') || fullText.includes('market') || fullText.includes('aged') || fullText.includes('loi'))) {
          return true;
        }
      } else {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        if (regex.test(fullText)) {
          return true;
        }
      }
    }
  }

  return false;
}

export const PanelDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, setAuthUser } = useAuth() as any;
  const { addToast } = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponseRecord[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchSurveys = () => {
    setSurveysLoading(true);
    const token = getStoredToken();

    Promise.all([
      apiGet<{ surveys: Survey[] }>('/api/surveys'),
      token
        ? apiGet<{ responses: SurveyResponseRecord[] }>('/api/my-responses', token).catch(() => ({ responses: [] }))
        : Promise.resolve({ responses: [] }),
    ])
      .then(([surveyData, responseData]) => {
        setSurveys(surveyData.surveys || []);
        setResponses(responseData.responses || []);
      })
      .catch((err) => {
        console.error('Error fetching live surveys:', err);
        setSurveys([]);
        setResponses([]);
      })
      .finally(() => setSurveysLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSurveys();
  }, []);

  const [activeFilterTab, setActiveFilterTab] = useState<'matched' | 'all' | 'completed'>('matched');

  const completedSurveyIds = React.useMemo(() => {
    return new Set(responses.filter((r) => r && r.status === 'complete').map((r) => r.surveyId));
  }, [responses]);

  // Role & Panel-based Intelligent Matching Engine
  const evaluatedSurveys = React.useMemo(() => {
    if (!surveys.length) return [];

    const userPanel = (user?.panelType || 'general').toLowerCase();
    const userRole = (user?.roleTitle || '').toLowerCase().trim();
    const userIndustry = (user?.industry || '').toLowerCase().trim();

    return surveys.map((survey) => {
      let score = 50;
      const matchReasons: string[] = [];
      let isStrictExclusion = false;

      const surveyTargetPanel = (survey.targetPanel || 'all').toLowerCase().trim();
      const surveyTargetRole = (survey.targetRole || '').toLowerCase().trim();
      const surveyTargetIndustry = (survey.targetIndustry || '').toLowerCase().trim();
      const surveyCategory = (survey.category || '').toLowerCase();
      const surveyTitle = (survey.title || '').toLowerCase();
      const surveyDesc = (survey.description || '').toLowerCase();

      const fullText = `${surveyTitle} ${surveyCategory} ${surveyDesc} ${surveyTargetRole} ${surveyTargetIndustry} ${surveyTargetPanel}`.toLowerCase();

      // 1. Explicit Target Panel Filter
      if (surveyTargetPanel !== 'all' && surveyTargetPanel !== userPanel) {
        isStrictExclusion = true;
      }

      // 2. Strict Country Mismatch Filter (e.g. UK residents vs India panelist)
      if (user?.country && checkCountryMismatch(fullText, user.country)) {
        isStrictExclusion = true;
      }

      // 3. Panel-Specific Exclusions (Never show B2C/HCP on B2B, or B2B on B2C)
      if (userPanel === 'b2b') {
        const strictB2CExclusions = [
          /\bb2c\b/i,
          /\bconsumer/i,
          /\boptometrist/i,
          /\bphysician/i,
          /\bhcp\b/i,
          /\bdoctor/i,
          /\bpatient/i,
          /\bcaregiver/i,
          /\bteen/i,
          /\biphone/i,
          /\b18-24\b/i,
          /\b18-34\b/i,
          /\bshoppers/i,
          /\bcosmetics/i,
          /\bhealth\s*&\s*fitness\b/i,
          /\bmedical/i,
          /\bclinic/i,
          /\bprescription/i,
          /\bdentist/i,
          /\bsweden/i,
          /\buk residents/i,
          /\bde loi/i,
        ];

        if (strictB2CExclusions.some((regex) => regex.test(fullText)) && surveyTargetPanel !== 'b2b') {
          isStrictExclusion = true;
        }
      } else if (userPanel === 'b2c') {
        const strictB2BExclusions = [
          /\bb2b\b/i,
          /\benterprise\b/i,
          /\bc-suite\b/i,
          /\boptometrist/i,
          /\bphysician/i,
          /\bhcp\b/i,
          /\bdoctor/i,
        ];
        if (strictB2BExclusions.some((regex) => regex.test(fullText)) && surveyTargetPanel !== 'b2c') {
          isStrictExclusion = true;
        }
      } else if (userPanel === 'patients-carers') {
        const strictExclusions = [
          /\bb2b\b/i,
          /\benterprise\b/i,
          /\bphysician/i,
          /\boptometrist/i,
          /\bhcp\b/i,
        ];
        if (strictExclusions.some((regex) => regex.test(fullText)) && surveyTargetPanel !== 'patients-carers') {
          isStrictExclusion = true;
        }
      } else if (userPanel === 'healthcare-professionals') {
        const strictExclusions = [
          /\bb2c\b/i,
          /\bteen/i,
          /\bshoppers/i,
          /\biphone/i,
        ];
        if (strictExclusions.some((regex) => regex.test(fullText)) && surveyTargetPanel !== 'healthcare-professionals') {
          isStrictExclusion = true;
        }
      }

      if (surveyTargetPanel === userPanel) {
        score += 40;
        matchReasons.push('Panel Targeted');
      }

      // 4. Explicit Role Target Match
      if (surveyTargetRole && userRole) {
        const roles = surveyTargetRole.split(',').map((r) => r.trim());
        if (roles.some((r) => r && (userRole.includes(r) || r.includes(userRole)))) {
          score += 50;
          matchReasons.push(`Role Match: ${user?.roleTitle}`);
        }
      }

      // 5. Explicit Industry Target Match
      if (surveyTargetIndustry && userIndustry) {
        if (userIndustry.includes(surveyTargetIndustry) || surveyTargetIndustry.includes(userIndustry)) {
          score += 35;
          matchReasons.push(`Industry: ${user?.industry}`);
        }
      }

      // 6. Panel & Keyword Heuristics
      if (userPanel === 'b2b') {
        const b2bKeywords = [
          'b2b', 'enterprise', 'technology', 'cloud', 'saas', 'business', 'finance', 'executive',
          'management', 'leader', 'strategy', 'decision', 'corporate', 'software', 'it', 'cybersecurity'
        ];

        const hasB2BKeyword = b2bKeywords.some(
          (kw) => surveyTitle.includes(kw) || surveyCategory.includes(kw) || surveyDesc.includes(kw)
        );

        const isExecutive = ['ceo', 'founder', 'director', 'c-suite', 'executive', 'president', 'manager', 'lead', 'partner', 'owner']
          .some((r) => userRole.includes(r));

        if (hasB2BKeyword) {
          score += 30;
          if (isExecutive && user?.roleTitle) {
            matchReasons.push(`🎯 Matched for ${user.roleTitle}`);
          } else {
            matchReasons.push('💼 B2B Enterprise Study');
          }
        }

        if (surveyCategory === 'technology' || surveyCategory === 'finance') {
          score += 20;
          if (userIndustry.includes('tech') || userIndustry.includes('software')) {
            matchReasons.push('🏢 Tech & SaaS Focus');
          }
        }
      } else if (userPanel === 'b2c') {
        const b2cKeywords = ['consumer', 'shopping', 'lifestyle', 'retail', 'entertainment', 'food', 'travel', 'daily', 'app', 'brand'];
        if (b2cKeywords.some((kw) => surveyTitle.includes(kw) || surveyCategory.includes(kw) || surveyDesc.includes(kw))) {
          score += 30;
          matchReasons.push('🛍️ Consumer & Lifestyle Match');
        }
      } else if (userPanel === 'patients-carers') {
        const patientKeywords = ['health', 'patient', 'treatment', 'medical', 'therapy', 'caregiver', 'wellness', 'disease', 'pharma', 'clinic'];
        if (patientKeywords.some((kw) => surveyTitle.includes(kw) || surveyCategory.includes(kw) || surveyDesc.includes(kw))) {
          score += 35;
          matchReasons.push('🩺 Healthcare Experience Study');
        }
      } else if (userPanel === 'healthcare-professionals') {
        const hcpKeywords = ['doctor', 'physician', 'hcp', 'clinical', 'hospital', 'medical', 'pharma', 'specialist', 'prescriber'];
        if (hcpKeywords.some((kw) => surveyTitle.includes(kw) || surveyCategory.includes(kw) || surveyDesc.includes(kw))) {
          score += 35;
          matchReasons.push(`⚕️ HCP Study for ${user?.roleTitle || 'Clinician'}`);
        }
      }

      if (matchReasons.length === 0) {
        matchReasons.push('General Research Study');
      }

      return {
        survey,
        score,
        isStrictExclusion,
        matchReasons,
        isRoleMatch: score >= 60 || surveyTargetPanel === userPanel,
      };
    });
  }, [surveys, user]);

  // Filtered surveys list based on active tab
  const displayedSurveys = React.useMemo(() => {
    return evaluatedSurveys.filter((item) => {
      if (item.isStrictExclusion) return false;
      const isCompleted = completedSurveyIds.has(item.survey.id);

      if (activeFilterTab === 'completed') {
        return isCompleted;
      }
      if (activeFilterTab === 'matched') {
        return item.isRoleMatch;
      }
      return true; // 'all'
    });
  }, [evaluatedSurveys, activeFilterTab, completedSurveyIds]);

  const matchedCount = evaluatedSurveys.filter((s) => !s.isStrictExclusion && s.isRoleMatch).length;
  const totalEligibleCount = evaluatedSurveys.filter((s) => !s.isStrictExclusion).length;
  const completedCount = completedSurveyIds.size;

  const panelInfo = panelLabels[user?.panelType || 'general'] || panelLabels.general;

  const handleLogout = () => {
    const targetPanel =
      user?.panelType && user.panelType !== 'general'
        ? user.panelType
        : localStorage.getItem('surveypanelgo_last_panel') || 'b2b';
    localStorage.setItem('surveypanelgo_last_panel', targetPanel);
    logout();
    addToast('Logged out successfully', 'info');
    navigate(`/panels/${targetPanel}/login`, { replace: true });
  };

  const handleTakeSurvey = (survey: Survey) => {
    if (survey.isExternal && survey.link) {
      window.open(survey.link, '_blank');
    } else {
      navigate(`/survey/${survey.id}`);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex flex-col justify-between">
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="lavender" size="lg" className="left-[8%] top-[12%] opacity-60" />
      <DecorativeBlob variant="pink" size="md" className="right-[10%] top-[18%] opacity-60" />
      <DecorativeBlob variant="green" size="lg" className="right-[12%] bottom-[20%] opacity-60" />

      {/* Header */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b-2 border-navy/10">
        <div className="w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
            </button>
            <span className="hidden sm:inline-block text-navy/30">•</span>
            <div className="hidden sm:flex items-center gap-2">
              <PlayfulBadge variant={panelInfo.badgeVariant} size="sm">
                {panelInfo.label}
              </PlayfulBadge>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rewards Shortcut Button */}
            <button
              onClick={() => navigate('/rewards')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow border-2 border-navy rounded-full shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all cursor-pointer"
              title="View & Redeem Rewards"
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy" />
              <span className="font-outfit font-bold text-xs sm:text-sm text-navy">
                {(user?.points || 0).toLocaleString()} pts
              </span>
            </button>

            {/* User Profile Summary */}
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-navy rounded-full shadow-hard-sm hover:bg-periwinkle transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-violet text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-jakarta font-bold text-xs text-navy hidden md:inline">
                {user?.name || 'Panelist'}
              </span>
            </button>

            <PlayfulButton
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5"
            >
              <LogOut className="w-4 h-4 text-navy" />
              <span className="hidden sm:inline">Logout</span>
            </PlayfulButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white/90 border-3 border-navy rounded-3xl p-6 sm:p-8 shadow-hard relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <PlayfulBadge variant={panelInfo.badgeVariant} size="sm">
                  {panelInfo.label}
                </PlayfulBadge>
                {user?.onboardingCompleted && (
                  <PlayfulBadge variant="green" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Profile Verified
                  </PlayfulBadge>
                )}
              </div>
              <h1 className="font-outfit font-black text-3xl sm:text-4xl text-navy tracking-tight">
                Welcome, {user?.name || 'Panelist'}! 👋
              </h1>
              <p className="font-jakarta text-sm sm:text-base text-navy/70 max-w-2xl">
                Here are the active research surveys matched to your background and demographics. All surveys and rewards are tracked directly via MongoDB.
              </p>
            </div>

            {/* Points & Stats Widget with Redeem Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div
                onClick={() => navigate('/rewards')}
                className="flex items-center gap-3.5 bg-periwinkle/50 hover:bg-periwinkle/80 p-3.5 sm:p-4 rounded-2xl border-2 border-navy transition-all cursor-pointer group hover:shadow-hard-sm"
                title="Click to redeem rewards"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-yellow text-navy border-2 border-navy flex items-center justify-center shadow-hard-sm shrink-0">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                </div>
                <div className="min-w-0">
                  <div className="font-jakarta text-xs font-bold text-navy/70">Your Reward Balance</div>
                  <div className="font-outfit font-black text-xl sm:text-2xl text-violet group-hover:text-navy transition-colors">
                    {(user?.points || 0).toLocaleString()} Points
                  </div>
                </div>
              </div>

              <PlayfulButton
                variant="primary"
                size="md"
                onClick={() => navigate('/rewards')}
                leftIcon={<Gift className="w-4 h-4" />}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="shadow-hard hover:shadow-hard-lg"
              >
                Redeem Rewards
              </PlayfulButton>
            </div>
          </div>

          {/* Profile Overview Pills */}
          {user?.onboardingCompleted && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t-2 border-navy/10 text-xs font-jakarta">
              <div className="bg-navy/5 p-3 rounded-xl border border-navy/10">
                <span className="font-semibold text-navy/60 block">Employment Status</span>
                <span className="font-bold text-navy">{user.employmentStatus || 'N/A'}</span>
              </div>
              <div className="bg-navy/5 p-3 rounded-xl border border-navy/10">
                <span className="font-semibold text-navy/60 block">Industry & Role</span>
                <span className="font-bold text-navy truncate block" title={`${user.industry} - ${user.roleTitle}`}>
                  {user.roleTitle || user.industry || 'N/A'}
                </span>
              </div>
              <div className="bg-navy/5 p-3 rounded-xl border border-navy/10">
                <span className="font-semibold text-navy/60 block">Location</span>
                <span className="font-bold text-navy">{user.city ? `${user.city}, ${user.country}` : user.country || 'N/A'}</span>
              </div>
              <div
                onClick={() => navigate('/rewards')}
                className="bg-navy/5 hover:bg-violet/10 p-3 rounded-xl border border-navy/10 hover:border-violet transition-all cursor-pointer group"
                title="View redemption threshold and reward options"
              >
                <span className="font-semibold text-navy/60 block flex items-center justify-between">
                  Rewards Status
                  <ChevronRight className="w-3 h-3 text-violet group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="font-bold text-violet block mt-0.5">
                  {(user?.points || 0) >= 5000 ? '🎉 Ready to Redeem' : `${(5000 - (user?.points || 0)).toLocaleString()} pts to unlock`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Surveys Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-violet" />
              <div>
                <h2 className="font-outfit font-black text-2xl text-navy">
                  Available Research Surveys
                </h2>
                <p className="font-jakarta text-xs text-navy/60">
                  {user?.roleTitle
                    ? `Showing research studies curated for ${user.roleTitle} in ${user.industry || 'your industry'}`
                    : 'Real-time surveys directly fetched from MongoDB'}
                </p>
              </div>
            </div>

            <button
              onClick={fetchSurveys}
              className="inline-flex items-center gap-1.5 text-xs font-jakarta font-bold text-navy/70 hover:text-violet transition-colors p-2 rounded-xl bg-white border border-navy/20 hover:border-navy shadow-sm self-start sm:self-auto cursor-pointer"
              title="Refresh surveys"
            >
              <RefreshCw className={`w-4 h-4 ${surveysLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Surveys</span>
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border-2 border-navy rounded-2xl shadow-hard-sm">
            <button
              type="button"
              onClick={() => setActiveFilterTab('matched')}
              className={`px-4 py-2 rounded-xl font-jakarta font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeFilterTab === 'matched'
                  ? 'bg-violet text-white shadow-sm'
                  : 'text-navy/70 hover:bg-navy/5'
              }`}
            >
              <span>🎯 Matched for Your Role</span>
              {user?.roleTitle && (
                <span className="hidden md:inline px-1.5 py-0.5 bg-white/20 text-white rounded text-[10px]">
                  {user.roleTitle}
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilterTab === 'matched' ? 'bg-yellow text-navy font-extrabold' : 'bg-navy/10 text-navy'
              }`}>
                {matchedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className={`px-4 py-2 rounded-xl font-jakarta font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeFilterTab === 'all'
                  ? 'bg-violet text-white shadow-sm'
                  : 'text-navy/70 hover:bg-navy/5'
              }`}
            >
              <span>📋 All {panelInfo.label.split(' ')[0]} Surveys</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilterTab === 'all' ? 'bg-yellow text-navy font-extrabold' : 'bg-navy/10 text-navy'
              }`}>
                {totalEligibleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('completed')}
              className={`px-4 py-2 rounded-xl font-jakarta font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeFilterTab === 'completed'
                  ? 'bg-violet text-white shadow-sm'
                  : 'text-navy/70 hover:bg-navy/5'
              }`}
            >
              <span>✅ Completed</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilterTab === 'completed' ? 'bg-yellow text-navy font-extrabold' : 'bg-navy/10 text-navy'
              }`}>
                {completedCount}
              </span>
            </button>
          </div>

          {/* Loading State */}
          {surveysLoading && (
            <div className="text-center py-16 bg-white/80 rounded-3xl border-2 border-navy">
              <RefreshCw className="w-8 h-8 mx-auto text-violet animate-spin mb-3" />
              <p className="font-jakarta font-bold text-sm text-navy">
                Matching live research surveys from database...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!surveysLoading && displayedSurveys.length === 0 && (
            <div className="text-center py-16 px-4 bg-white/80 rounded-3xl border-2 border-navy shadow-hard-sm space-y-3">
              <AlertCircle className="w-12 h-12 mx-auto text-violet/70 mb-2" />
              <h3 className="font-outfit font-bold text-xl text-navy">
                {activeFilterTab === 'matched'
                  ? `No exact matches for "${user?.roleTitle || 'your role'}" at this moment`
                  : activeFilterTab === 'completed'
                  ? 'No completed surveys yet'
                  : 'No active surveys right now'}
              </h3>
              <p className="font-jakarta text-sm text-navy/70 max-w-md mx-auto">
                {activeFilterTab === 'matched'
                  ? `We are dynamically onboarding enterprise surveys for ${user?.roleTitle || 'your profile'}. In the meantime, you can explore all available surveys.`
                  : 'When new surveys are published in MongoDB, they will automatically appear here on your dashboard.'}
              </p>
              {activeFilterTab === 'matched' && totalEligibleCount > 0 && (
                <div className="pt-2">
                  <PlayfulButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveFilterTab('all')}
                  >
                    View All {totalEligibleCount} Panel Surveys
                  </PlayfulButton>
                </div>
              )}
            </div>
          )}

          {/* Survey Cards Grid */}
          {!surveysLoading && displayedSurveys.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSurveys.map(({ survey, matchReasons, isRoleMatch }) => {
                const isCompleted = completedSurveyIds.has(survey.id);

                return (
                  <PlayfulCard
                    key={survey.id}
                    variant="static"
                    className="p-6 bg-white flex flex-col justify-between hover:shadow-hard transition-all border-2 border-navy"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <PlayfulBadge variant="violet" size="sm">
                          {survey.category || 'Technology'}
                        </PlayfulBadge>
                        <span className="flex items-center gap-1 text-xs font-jakarta font-semibold text-navy/60">
                          <Clock className="w-3.5 h-3.5" />
                          {survey.timeEstimate || 10} mins
                        </span>
                      </div>

                      {/* Match Reason Tag */}
                      {matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {matchReasons.slice(0, 2).map((reason, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-jakarta font-bold ${
                                isRoleMatch
                                  ? 'bg-violet/10 text-violet border border-violet/20'
                                  : 'bg-navy/5 text-navy/70 border border-navy/10'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-violet shrink-0" />
                              <span className="truncate max-w-[200px]">{reason}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <h3 className="font-outfit font-bold text-lg text-navy leading-snug">
                        {survey.title}
                      </h3>

                      <p className="font-jakarta text-xs sm:text-sm text-navy/70 line-clamp-3">
                        {survey.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-4 border-t border-navy/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-yellow/80 border border-navy flex items-center justify-center">
                          <Coins className="w-4 h-4 text-navy" />
                        </div>
                        <span className="font-outfit font-black text-base text-navy">
                          +{survey.pointsReward || 100} pts
                        </span>
                      </div>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green/20 text-emerald-800 rounded-full font-jakarta font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      ) : (
                        <PlayfulButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleTakeSurvey(survey)}
                          className="gap-1"
                        >
                          <span>Take Survey</span>
                          {survey.isExternal ? (
                            <ExternalLink className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                        </PlayfulButton>
                      )}
                    </div>
                  </PlayfulCard>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Onboarding Profile Modal (Accessible for view/update) */}
      <PanelOnboardingModal
        isOpen={showProfileModal}
        user={user}
        token={getStoredToken()}
        panelType={user?.panelType}
        onClose={() => setShowProfileModal(false)}
        onComplete={(updatedUser) => {
          if (setAuthUser) setAuthUser(updatedUser, getStoredToken());
          setShowProfileModal(false);
          addToast('Profile updated!', 'success');
        }}
      />
    </div>
  );
};
