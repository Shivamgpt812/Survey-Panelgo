import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  ClipboardList,
  Gift,
  Clock,
  TrendingUp,
  LogOut,
  User,
  ChevronRight,
  Flame,
  Sparkles,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge, PlayfulProgress } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import type { Survey, SurveyResponseRecord } from '@/types';
import { apiGet } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth, getStoredToken } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [responses, setResponses] = useState<SurveyResponseRecord[]>([]);

  useEffect(() => {
    setSurveysLoading(true);
    const token = getStoredToken();

    Promise.all([
      apiGet<{ surveys: Survey[] }>('/api/surveys'),
      token ? apiGet<{ responses: SurveyResponseRecord[] }>('/api/my-responses', token) : Promise.resolve({ responses: [] })
    ])
      .then(([surveyData, responseData]) => {
        setSurveys(surveyData.surveys);
        setResponses(responseData.responses);
      })
      .catch(() => {
        setSurveys([]);
        setResponses([]);
      })
      .finally(() => setSurveysLoading(false));
  }, []);

  const completedSurveyIds = new Set(
    responses.filter(r => r.status === 'complete').map(r => r.surveyId)
  );

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully!', 'info');
    navigate('/auth');
  };

  const stats = [
    {
      icon: Coins,
      label: 'Total Points',
      value: user?.points?.toLocaleString() || '0',
      variant: 'yellow' as const,
      trend: '+250 this week',
    },
    {
      icon: ClipboardList,
      label: 'Surveys Completed',
      value: user?.surveysCompleted?.toString() || '0',
      variant: 'green' as const,
      trend: '+3 today',
    },
    {
      icon: Gift,
      label: 'Rewards Redeemed',
      value: '3',
      variant: 'pink' as const,
      trend: 'Last: ₹500 Amazon',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'hard':
        return 'orange';
      default:
        return 'violet';
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      {/* Background Pattern */}
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="pink" size="md" className="right-[5%] top-[15%] opacity-40" />
      <DecorativeBlob variant="yellow" size="sm" className="left-[8%] top-[25%] opacity-40" />
      <DecorativeBlob variant="green" size="md" className="left-[5%] bottom-[15%] opacity-40" />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-navy/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center min-w-0 cursor-pointer text-left"
            onClick={() => navigate('/')}
            aria-label="Survey Panel Go home"
          >
            <BrandLogo size="nav" className="max-h-9 sm:max-h-12" />
          </button>

          {/* Desktop Stats & Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow border-2 border-navy rounded-pill">
              <Coins className="w-4 h-4 text-navy" />
              <span className="font-outfit font-bold text-navy">{user?.points?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green border-2 border-navy rounded-pill">
              <ClipboardList className="w-4 h-4 text-navy" />
              <span className="font-outfit font-bold text-navy">{user?.surveysCompleted || '0'}</span>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-navy rounded-pill">
              <div className="w-8 h-8 bg-violet border-2 border-navy rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-jakarta font-medium text-sm text-navy">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
            >
              <LogOut className="w-5 h-5 text-navy" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b-2 border-navy/10 shadow-lg">
            <div className="flex flex-col p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-periwinkle/30 border-2 border-navy/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet border-2 border-navy rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-jakarta font-medium text-sm text-navy">{user?.name}</p>
                    <p className="font-mono text-xs text-navy-light">{user?.points?.toLocaleString() || '0'} points</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
                >
                  <LogOut className="w-4 h-4 text-navy" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow border-2 border-navy rounded-pill">
                  <Coins className="w-4 h-4 text-navy" />
                  <span className="font-outfit font-bold text-navy text-sm">{user?.points?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green border-2 border-navy rounded-pill">
                  <ClipboardList className="w-4 h-4 text-navy" />
                  <span className="font-outfit font-bold text-navy text-sm">{user?.surveysCompleted || '0'}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-navy/10">
                <PlayfulButton variant="secondary" size="sm" onClick={() => { navigate('/rewards'); setIsMobileMenuOpen(false); }}>
                  View Rewards
                </PlayfulButton>
                <PlayfulButton variant="primary" size="sm" onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}>
                  Sign Out
                </PlayfulButton>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PlayfulBadge variant="violet" size="sm" leftIcon={<Sparkles className="w-3 h-3" />}>
                  Welcome Back
                </PlayfulBadge>
                <PlayfulBadge variant="yellow" size="sm" leftIcon={<Flame className="w-3 h-3" />}>
                  5 Day Streak
                </PlayfulBadge>
              </div>
              <h1 className="font-outfit font-bold text-3xl md:text-4xl text-navy">
                Hey, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="font-jakarta text-navy-light mt-1">Ready to earn some points today?</p>
            </div>
            <PlayfulButton
              variant="primary"
              rightIcon={<ChevronRight className="w-5 h-5" />}
              onClick={() => navigate('/rewards')}
            >
              Redeem Rewards
            </PlayfulButton>
          </section>

          {/* Stats Cards */}
          <section className="grid md:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <PlayfulCard key={index} className="p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-jakarta text-sm text-navy-light mb-1">{stat.label}</p>
                    <p className="font-outfit font-bold text-2xl md:text-3xl text-navy">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="font-mono text-xs text-green-600">{stat.trend}</span>
                    </div>
                  </div>
                  <IconCircle variant={stat.variant} size="lg">
                    <stat.icon className="w-6 h-6" />
                  </IconCircle>
                </div>
              </PlayfulCard>
            ))}
          </section>

          {/* Progress to Next Reward */}
          <section>
            <PlayfulCard className="p-5 md:p-6 bg-gradient-to-r from-violet/10 to-pink/10">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex-shrink-0">
                  <IconCircle variant="yellow" size="xl">
                    <Gift className="w-8 h-8" />
                  </IconCircle>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-outfit font-bold text-lg text-navy">Next Reward</h3>
                    <span className="font-mono text-sm text-navy-light">
                      {user?.points || 0} / 1000 points
                    </span>
                  </div>
                  <PlayfulProgress
                    value={user?.points || 0}
                    max={1000}
                    variant="violet"
                    size="md"
                  />
                  <p className="font-jakarta text-sm text-navy-light mt-2">
                    You're {Math.max(0, 1000 - (user?.points || 0)).toLocaleString()} points away from a ₹500 Amazon
                    Gift Card!
                  </p>
                </div>
                <PlayfulButton variant="secondary" size="sm" onClick={() => navigate('/rewards')}>
                  View All
                </PlayfulButton>
              </div>
            </PlayfulCard>
          </section>

          {/* Available Surveys */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-outfit font-bold text-2xl text-navy">Available Surveys</h2>
                <p className="font-jakarta text-navy-light">Complete surveys to earn points</p>
              </div>
              <PlayfulBadge variant="violet" size="md">
                {surveys.length} Available
              </PlayfulBadge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {surveysLoading && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!surveysLoading && surveys.length === 0 && (
                <p className="col-span-full text-center font-jakarta text-navy-light py-8">
                  No surveys available yet. Check back soon.
                </p>
              )}
              {!surveysLoading &&
                surveys.map((survey) => {
                  const isCompleted = completedSurveyIds.has(survey.id);

                  return (
                    <PlayfulCard key={survey.id} className="p-5 flex flex-col relative overflow-hidden">
                      {isCompleted && (
                        <div className="absolute top-0 right-0 bg-green text-navy px-3 py-1 rounded-bl-xl font-outfit font-bold text-[10px] sm:text-xs shadow-sm z-10 flex items-center gap-1 border-l-2 border-b-2 border-navy">
                          <Check className="w-3 h-3" />
                          COMPLETED
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-2">
                          {survey.isNew && <PlayfulBadge variant="pink" size="sm">NEW</PlayfulBadge>}
                          {survey.isPopular && <PlayfulBadge variant="yellow" size="sm">POPULAR</PlayfulBadge>}
                        </div>
                        <PlayfulBadge variant={getDifficultyColor(survey.difficulty) as any} size="sm">
                          {survey.difficulty}
                        </PlayfulBadge>
                      </div>

                      <h3 className="font-outfit font-bold text-lg text-navy mb-2 truncate pr-16">{survey.title}</h3>
                      <p className="font-jakarta text-sm text-navy-light mb-4 flex-1 line-clamp-3 leading-relaxed">{survey.description}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-navy-light" />
                          <span className="font-mono text-xs text-navy-light">{survey.timeEstimate} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-violet" />
                          <span className="font-mono text-xs font-bold text-violet">{survey.pointsReward} pts</span>
                        </div>
                      </div>

                      <PlayfulButton
                        variant={isCompleted ? 'secondary' : 'primary'}
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/survey/${survey.id}/precheck`)}
                        disabled={isCompleted}
                      >
                        {isCompleted ? 'Completed' : 'Start Survey'}
                      </PlayfulButton>
                    </PlayfulCard>
                  );
                })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 border-t-2 border-navy/10 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <BrandLogo size="sm" className="max-h-8" />
          </div>
          <p className="font-jakarta text-sm text-navy-light">© 2024 Survey Panel Go. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
