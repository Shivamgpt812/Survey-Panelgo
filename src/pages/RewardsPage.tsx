import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Gift,
  Coins,
  Check,
  Lock,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  Wallet,
  LogOut,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { useAuth, getStoredToken } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Reward } from '@/types';
import { apiGet, apiPost } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';

const MINIMUM_REDEEM_POINTS = 5000;

const panelLabels: Record<string, { label: string; badgeVariant: 'violet' | 'pink' | 'yellow' | 'green' }> = {
  b2b: { label: 'B2B Decision Makers Panel', badgeVariant: 'violet' },
  b2c: { label: 'B2C Consumer & Lifestyle Panel', badgeVariant: 'pink' },
  'patients-carers': { label: 'Patients & Caregivers Panel', badgeVariant: 'yellow' },
  'healthcare-professionals': { label: 'Healthcare Professionals (HCP) Panel', badgeVariant: 'green' },
  general: { label: 'General Research Panel', badgeVariant: 'violet' },
};

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ rewards: Reward[] }>('/api/rewards')
      .then((d) => setRewards(d.rewards))
      .catch(() => setRewards([]));
  }, []);

  const isPanelist = user?.panelType && ['b2b', 'b2c', 'patients-carers', 'healthcare-professionals'].includes(user.panelType);
  const dashboardPath = isPanelist ? '/panels/dashboard' : '/dashboard';
  const panelInfo = panelLabels[user?.panelType || 'general'] || panelLabels.general;

  const handleLogout = () => {
    const pType = user?.panelType;
    logout();
    addToast('Logged out successfully!', 'info');
    if (pType && ['b2b', 'b2c', 'patients-carers', 'healthcare-professionals'].includes(pType)) {
      navigate(`/panels/${pType}/login`);
    } else {
      navigate('/');
    }
  };

  const handleRedeem = async (reward: Reward) => {
    const token = getStoredToken();
    if (!token) {
      addToast('Please sign in to redeem rewards', 'error');
      navigate('/');
      return;
    }

    if (userPoints < MINIMUM_REDEEM_POINTS) {
      addToast(
        `Minimum ${MINIMUM_REDEEM_POINTS.toLocaleString()} points required to redeem rewards. You need ${(MINIMUM_REDEEM_POINTS - userPoints).toLocaleString()} more points.`,
        'error'
      );
      return;
    }

    if (userPoints < reward.pointsCost) {
      addToast(
        `You need ${(reward.pointsCost - userPoints).toLocaleString()} more points to redeem ${reward.name}.`,
        'error'
      );
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        '/api/rewards/redeem',
        { rewardId: reward.id },
        token
      );
      addToast(res.message || '🎉 Reward redeemed successfully!', 'success');
      await refreshUser();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to redeem reward', 'error');
    } finally {
      setRedeemingId(null);
    }
  };

  const categories = [
    { id: 'all', label: 'All Rewards', icon: Gift },
    { id: 'giftcard', label: 'Gift Cards', icon: CreditCard },
    { id: 'cash', label: 'Cash', icon: Wallet },
    { id: 'product', label: 'Products', icon: ShoppingBag },
  ];

  const filteredRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter(r => r.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'giftcard': return CreditCard;
      case 'cash': return Wallet;
      case 'product': return ShoppingBag;
      default: return Gift;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'giftcard': return 'yellow';
      case 'cash': return 'green';
      case 'product': return 'pink';
      default: return 'violet';
    }
  };

  const userPoints = user?.points || 0;
  const isRedemptionEligible = userPoints >= MINIMUM_REDEEM_POINTS;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex flex-col justify-between">
      {/* Background Pattern */}
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="yellow" size="md" className="right-[5%] top-[15%] opacity-40" />
      <DecorativeBlob variant="pink" size="md" className="left-[5%] bottom-[15%] opacity-40" />

      {/* Header matching Panel Navbar layout */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b-2 border-navy/10">
        <div className="w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(dashboardPath)}
              className="flex items-center gap-3 text-left cursor-pointer shrink-0"
              aria-label="Back to dashboard"
            >
              <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
            </button>
            <span className="hidden sm:inline-block text-navy/30">•</span>
            <div className="hidden sm:flex items-center gap-2">
              <PlayfulBadge variant={panelInfo.badgeVariant} size="sm">
                {panelInfo.label}
              </PlayfulBadge>
            </div>
            <button
              onClick={() => navigate(dashboardPath)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-navy rounded-full shadow-hard-sm hover:bg-periwinkle transition-colors cursor-pointer text-navy font-jakarta text-xs sm:text-sm font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy" />
              <span className="hidden sm:inline">Back to Surveys</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Points pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow border-2 border-navy rounded-full shadow-hard-sm">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy" />
              <span className="font-outfit font-bold text-xs sm:text-sm text-navy">
                {userPoints.toLocaleString()} pts
              </span>
            </div>

            {/* User Avatar & Name */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-navy rounded-full shadow-hard-sm">
              <div className="w-7 h-7 rounded-full bg-violet text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-jakarta font-bold text-xs text-navy hidden md:inline">
                {user?.name || 'Panelist'}
              </span>
            </div>

            {/* Logout Button */}
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
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <section className="text-center">
            <div className="flex justify-center mb-4">
              <IconCircle variant="yellow" size="xl">
                <Gift className="w-8 h-8" />
              </IconCircle>
            </div>
            <h1 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-2">
              Redeem Your Rewards
            </h1>
            <p className="font-jakarta text-navy-light">
              Turn your hard-earned points into amazing rewards. Minimum 5,000 points required to cash out!
            </p>
          </section>

          {/* Points Balance & Minimum Threshold Alert Card */}
          <section>
            <PlayfulCard className="p-6 md:p-8 bg-gradient-to-r from-violet/10 via-pink/10 to-yellow/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <IconCircle variant="yellow" size="xl">
                    <Coins className="w-8 h-8" />
                  </IconCircle>
                  <div>
                    <p className="font-jakarta text-navy-light">Your Balance</p>
                    <p className="font-outfit font-bold text-4xl md:text-5xl text-navy">
                      {userPoints.toLocaleString()}
                      <span className="text-lg text-navy-light ml-2">points</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left md:text-right">
                    <p className="font-jakarta text-sm text-navy-light">Estimated Value</p>
                    <p className="font-outfit font-bold text-2xl text-violet">
                      ₹{(userPoints / 2).toFixed(2)}
                    </p>
                    <p className="font-mono text-xs text-navy-light">1 pt = ₹0.50</p>
                  </div>
                </div>
              </div>

              {/* Threshold Status Bar */}
              <div className="mt-6 pt-6 border-t-2 border-navy/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-jakarta font-semibold text-sm text-navy flex items-center gap-2">
                    {isRedemptionEligible ? (
                      <>
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Redemption Unlocked! (Eligible for all 5,000+ pt rewards)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>Redemption Threshold: 5,000 Points</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-xs font-bold text-navy">
                    {userPoints.toLocaleString()} / 5,000 pts
                  </span>
                </div>
                <div className="w-full bg-white border-2 border-navy rounded-full h-4 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRedemptionEligible ? 'bg-green-500' : 'bg-violet'
                    }`}
                    style={{ width: `${Math.min(100, (userPoints / MINIMUM_REDEEM_POINTS) * 100)}%` }}
                  />
                </div>
                {!isRedemptionEligible && (
                  <p className="font-jakarta text-xs text-navy-light mt-2">
                    🔒 You need <span className="font-bold text-violet">{(MINIMUM_REDEEM_POINTS - userPoints).toLocaleString()} more points</span> to make your first redemption. Complete available surveys on your dashboard to reach 5,000 points!
                  </p>
                )}
              </div>
            </PlayfulCard>
          </section>

          {/* Category Filter */}
          <section>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-navy rounded-pill font-jakarta font-medium text-sm transition-all ${selectedCategory === category.id
                    ? 'bg-violet text-white shadow-hard'
                    : 'bg-white text-navy hover:bg-periwinkle'
                    }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>
          </section>

          {/* Rewards Grid */}
          <section>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredRewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsCost && userPoints >= MINIMUM_REDEEM_POINTS;
                const Icon = getCategoryIcon(reward.category);
                const colorVariant = getCategoryColor(reward.category);
                const isRedeeming = redeemingId === reward.id;

                return (
                  <PlayfulCard
                    key={reward.id}
                    className={`p-5 flex flex-col ${!reward.inStock ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <IconCircle variant={colorVariant as any} size="lg">
                        <Icon className="w-6 h-6" />
                      </IconCircle>
                      <div className="flex flex-col items-end gap-1">
                        <PlayfulBadge variant={colorVariant as any} size="sm">
                          {reward.category === 'giftcard' ? 'Gift Card' :
                            reward.category === 'cash' ? 'Cash' : 'Product'}
                        </PlayfulBadge>
                        {!reward.inStock && (
                          <PlayfulBadge variant="pink" size="sm">
                            Out of Stock
                          </PlayfulBadge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-outfit font-bold text-lg text-navy mb-1">
                      {reward.name}
                    </h3>
                    <p className="font-jakarta text-sm text-navy-light mb-4 flex-1">
                      {reward.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-violet" />
                        <span className="font-outfit font-bold text-violet">
                          {reward.pointsCost.toLocaleString()}
                        </span>
                        <span className="font-mono text-xs text-navy-light">pts</span>
                      </div>
                      <span className="font-mono text-xs text-navy-light font-bold">
                        ₹{(reward.pointsCost / 2).toFixed(0)} value
                      </span>
                    </div>

                    <PlayfulButton
                      variant={canAfford && reward.inStock ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full"
                      disabled={!canAfford || !reward.inStock || isRedeeming}
                      onClick={() => handleRedeem(reward)}
                      leftIcon={canAfford && reward.inStock ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    >
                      {isRedeeming ? 'Processing...' :
                        !reward.inStock ? 'Out of Stock' :
                        canAfford ? 'Redeem Now' :
                        userPoints < MINIMUM_REDEEM_POINTS
                          ? `${(MINIMUM_REDEEM_POINTS - userPoints).toLocaleString()} pts to unlock`
                          : `${(reward.pointsCost - userPoints).toLocaleString()} more pts needed`}
                    </PlayfulButton>
                  </PlayfulCard>
                );
              })}
            </div>
          </section>

          {/* How to Earn More */}
          <section>
            <PlayfulCard className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <IconCircle variant="green" size="xl">
                    <ExternalLink className="w-8 h-8" />
                  </IconCircle>
                </div>
                <div className="flex-1">
                  <h3 className="font-outfit font-bold text-xl text-navy mb-2">
                    Want to reach 5,000 points faster?
                  </h3>
                  <p className="font-jakarta text-navy-light mb-4">
                    Complete available surveys on your dashboard to stack points rapidly. Once you reach 5,000 points, all rewards unlock instantly!
                  </p>
                  <PlayfulButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Browse Available Surveys
                  </PlayfulButton>
                </div>
              </div>
            </PlayfulCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RewardsPage;
