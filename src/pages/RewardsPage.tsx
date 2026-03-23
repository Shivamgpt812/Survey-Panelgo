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
  LogOut
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Reward } from '@/types';
import { apiGet } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    void apiGet<{ rewards: Reward[] }>('/api/rewards')
      .then((d) => setRewards(d.rewards))
      .catch(() => setRewards([]));
  }, []);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully!', 'info');
    navigate('/auth');
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      {/* Background Pattern */}
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="yellow" size="md" className="right-[5%] top-[15%] opacity-40" />
      <DecorativeBlob variant="pink" size="md" className="left-[5%] bottom-[15%] opacity-40" />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-navy/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-navy rounded-pill hover:bg-periwinkle transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-navy" />
            <span className="font-jakarta font-medium text-sm text-navy hidden sm:block">Back</span>
          </button>

          <div className="flex items-center justify-center flex-1 min-w-0 px-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="min-w-0"
              aria-label="Survey Panel Go home"
            >
              <BrandLogo size="sm" className="max-h-8 sm:max-h-9 mx-auto" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow border-2 border-navy rounded-pill">
              <Coins className="w-4 h-4 text-navy" />
              <span className="font-outfit font-bold text-sm text-navy">{userPoints.toLocaleString()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
            >
              <LogOut className="w-4 h-4 text-navy" />
            </button>
          </div>
        </div>
      </nav>

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
              Turn your hard-earned points into amazing rewards. Choose from gift cards, cash, and more!
            </p>
          </section>

          {/* Points Balance Card */}
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
                  <div className="text-right">
                    <p className="font-jakarta text-sm text-navy-light">Estimated Value</p>
                    <p className="font-outfit font-bold text-2xl text-violet">
                      ₹{(userPoints / 2).toFixed(2)}
                    </p>
                  </div>
                </div>
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
                const canAfford = userPoints >= reward.pointsCost;
                const Icon = getCategoryIcon(reward.category);
                const colorVariant = getCategoryColor(reward.category);

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
                      <span className="font-mono text-xs text-navy-light">
                        ₹{(reward.pointsCost / 2).toFixed(0)} value
                      </span>
                    </div>

                    <PlayfulButton
                      variant={canAfford && reward.inStock ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full"
                      disabled={!canAfford || !reward.inStock}
                      leftIcon={canAfford && reward.inStock ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    >
                      {!reward.inStock ? 'Out of Stock' :
                        canAfford ? 'Redeem Now' :
                          `${(reward.pointsCost - userPoints).toLocaleString()} more pts needed`}
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
                    Want to earn more points?
                  </h3>
                  <p className="font-jakarta text-navy-light mb-4">
                    Complete more surveys to earn points faster. New surveys are added daily!
                  </p>
                  <PlayfulButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Browse Surveys
                  </PlayfulButton>
                </div>
              </div>
            </PlayfulCard>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 border-t-2 border-navy/10 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <BrandLogo size="sm" className="max-h-8" />
          </div>
          <p className="font-jakarta text-sm text-navy-light">
            © 2024 Survey Panel Go. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RewardsPage;
