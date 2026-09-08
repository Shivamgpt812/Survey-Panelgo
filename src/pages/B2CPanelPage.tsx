import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Globe,
  ShoppingBag,
  Sparkles,
  HeartHandshake,
  Car,
  GraduationCap,
  Briefcase,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Layers,
  Send,
  Check,
  Zap,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/useToast';

const consumerSegments = [
  {
    title: 'Parents & Teens',
    icon: Users,
    variant: 'violet' as const,
    desc: 'Household decision makers and dynamic youth cohorts shaping modern family purchasing, allowances, and lifestyle choices.',
    tags: ['Family Budgets', 'Parenting Decisions', 'Teen Trends', 'Education Spend']
  },
  {
    title: 'Kids & Family Dynamics',
    icon: Sparkles,
    variant: 'pink' as const,
    desc: 'Parent-assisted insights into children’s preferences across toys, interactive entertainment, breakfast cereals, and learning apps.',
    tags: ['Snack Trends', 'Toys & Gaming', 'EdTech', 'Media Consumption']
  },
  {
    title: 'High Net Worth Individuals',
    icon: Zap,
    variant: 'yellow' as const,
    desc: 'Affluent consumers and luxury shoppers with verified high disposable income and bespoke investment behaviors.',
    tags: ['Luxury Goods', 'Private Wealth', 'First-Class Travel', 'Real Estate']
  },
  {
    title: 'Car Owners & Auto Consumers',
    icon: Car,
    variant: 'green' as const,
    desc: 'Drivers and vehicle owners covering internal combustion engines (ICE), hybrids, electric vehicles (EV), and mobility services.',
    tags: ['EV Adoption', 'Car Insurance', 'Aftermarket Tech', 'Brand Loyalty']
  },
  {
    title: 'Students & Gen Z',
    icon: GraduationCap,
    variant: 'lavender' as const,
    desc: 'Digitally native Gen Z and university students influencing streaming culture, social commerce, and next-gen financial apps.',
    tags: ['Social Media', 'FinTech Adoption', 'Sustainable Brands', 'Gig Economy']
  },
  {
    title: 'Employment & Working Lifestyles',
    icon: Briefcase,
    variant: 'orange' as const,
    desc: 'Diverse working adults spanning corporate professionals, gig economy contractors, blue-collar workers, and retirees.',
    tags: ['Full-Time', 'Remote Workers', 'Freelancers', 'Retirees']
  }
];

const profilingPillars = [
  {
    category: 'Demographic Attributes',
    items: ['Age & Generation (Gen Z, Millennials, Gen X, Boomers)', 'Household Income & Socio-Economic Class', 'Education Level & Marital Status', 'Housing Type (Homeowners vs Renters)', 'Urban, Suburban & Rural Geographies']
  },
  {
    category: 'Retail & FMCG Habits',
    items: ['Weekly Grocery & Supermarket Preferences', 'eCommerce vs In-store Shopping Frequency', 'Subscription Box Adoption', 'Organic, Vegan & Sustainable Choices', 'Quick Commerce & On-demand Delivery']
  },
  {
    category: 'Digital & Media Consumption',
    items: ['OTT Video & Music Streaming Services', 'Mobile Gaming & Esports Engagement', 'Social Media Platforms & Creator Influence', 'Smart Home & Wearable Tech Usage', 'Device Ecosystems (iOS vs Android)']
  },
  {
    category: 'Financial & Lifestyle Preferences',
    items: ['Credit Cards & Digital Wallets Usage', 'Personal Investments, Stocks & Crypto', 'Health, Life & Motor Insurance Plans', 'Gym Memberships & Wellness Habits', 'Domestic & International Travel Frequencies']
  }
];

const globalMarkets = [
  { region: 'Asia Pacific', count: '1.2M+', countries: ['India', 'Hong Kong', 'Taiwan', 'Vietnam', 'Philippines', 'Malaysia', 'Australia', 'Thailand', 'Singapore', 'Indonesia', 'South Korea', 'Japan'] },
  { region: 'Europe', count: '650K+', countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Switzerland', 'Netherlands', 'Portugal', 'Poland'] },
  { region: 'Americas', count: '450K+', countries: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'] },
  { region: 'Middle East & Africa', count: '150K+', countries: ['South Africa', 'Nigeria', 'UAE', 'Saudi Arabia'] }
];

const B2CPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    targetSegment: 'General Consumer Population',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast('Thank you! Your B2C panel inquiry has been submitted. Our sampling specialists will get back to you shortly.', 'success');
      setFormData({ name: '', email: '', company: '', targetSegment: 'General Consumer Population', message: '' });
    }, 800);
  };

  const filteredSegments = consumerSegments.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="pink" size="lg" className="left-[8%] top-[12%] opacity-60" />
      <DecorativeBlob variant="yellow" size="md" className="right-[10%] top-[18%] opacity-60" />
      <DecorativeBlob variant="green" size="lg" className="right-[12%] bottom-[20%] opacity-60" />
      <DecorativeBlob variant="lavender" size="md" className="left-[12%] bottom-[15%] opacity-60" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Tag */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-jakarta font-semibold text-navy/70 hover:text-violet transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <span className="text-navy/30">•</span>
            <span className="text-xs sm:text-sm font-jakarta font-semibold text-navy/60">Panels</span>
            <span className="text-navy/30">•</span>
            <PlayfulBadge variant="pink">B2C Consumer Panel</PlayfulBadge>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-navy rounded-full shadow-hard-sm">
                <Sparkles className="w-4 h-4 text-pink-500 animate-spin-slow" />
                <span className="font-outfit font-bold text-xs uppercase tracking-wider text-navy">
                  Over 2.4M+ Active Panel Members Across 28 Markets
                </span>
              </div>

              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy leading-[1.1] tracking-tight">
                Authentic Consumer Perspectives for{' '}
                <span className="relative inline-block text-pink-500 underline decoration-wavy decoration-yellow decoration-2">
                  Modern Brands
                </span>
              </h1>

              <p className="font-jakarta text-lg sm:text-xl text-navy-light max-w-2xl leading-relaxed">
                We have built diversified consumer panels across the world for over a decade, capturing over 150 behavioural and demographic attributes for robust, reliable market research.
              </p>

              {/* Key Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-pink-500">2.4M+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Active Consumers</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-violet">150+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Profile Attributes</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600">28+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Global Markets</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-amber-500">10+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Years Built</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <PlayfulButton variant="primary" size="lg" onClick={() => navigate('/panels/b2c/signup')}>
                  Join B2C Panel
                  <ArrowLeft className="w-5 h-5 rotate-180 ml-1" />
                </PlayfulButton>
                <PlayfulButton variant="secondary" size="lg" onClick={() => navigate('/panels/b2c/login')}>
                  Login to B2C Panel
                </PlayfulButton>
              </div>
            </div>

            {/* Hero Interactive Card */}
            <div className="lg:col-span-5">
              <PlayfulCard variant="white" className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b-2 border-navy/10">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={ShoppingBag} variant="pink" size="md" />
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-navy">B2C Panel Portal</h3>
                      <p className="font-jakarta text-xs text-navy/60">Real consumers, verified identities</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-violet/20 border border-violet text-violet text-xs font-bold rounded-full">
                    High Response
                  </span>
                </div>

                <div className="space-y-4 font-jakarta text-sm">
                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Hyper-Targeted Cohorts</strong>
                      <span className="text-navy-light text-xs">Reach parents, Gen-Z gamers, auto owners, and high earners effortlessly.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Proprietary Quality Gateways</strong>
                      <span className="text-navy-light text-xs">Device fingerprinting, Geo-IP verification, and attentive re-profiling.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Fast Fieldwork Turnarounds</strong>
                      <span className="text-navy-light text-xs">Gather 1,000+ representative completes in under 24 to 48 hours.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <PlayfulButton variant="primary" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/b2c/login')}>
                    Login to B2C Panel
                  </PlayfulButton>
                  <PlayfulButton variant="yellow" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/b2c/signup')}>
                    Join Our Panel
                  </PlayfulButton>
                </div>
              </PlayfulCard>
            </div>
          </div>
        </div>
      </section>

      {/* Target Consumers Section */}
      <section id="consumer-segments" className="relative z-10 py-16 bg-white/80 border-y-2 border-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <PlayfulBadge variant="pink" className="mb-3">Target Audiences</PlayfulBadge>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
                Specialized Consumer Cohorts
              </h2>
              <p className="font-jakarta text-navy-light mt-2 max-w-xl">
                Ready-to-deploy audiences segmented by lifestyle, spending power, and family stage.
              </p>
            </div>

            <div className="w-full md:w-72 relative">
              <Search className="w-4 h-4 text-navy/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search consumer cohort..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-navy rounded-xl font-jakarta text-xs sm:text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-hard-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSegments.map((seg, i) => {
              const Icon = seg.icon;
              return (
                <PlayfulCard key={i} variant={seg.variant} className="p-6 sm:p-7 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <IconCircle icon={Icon} variant={seg.variant} size="md" />
                    <span className="font-outfit font-extrabold text-xs px-2.5 py-1 bg-white/80 border border-navy rounded-full text-navy shadow-hard-sm">
                      Target Ready
                    </span>
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-xl text-navy">{seg.title}</h3>
                    <p className="font-jakarta text-xs sm:text-sm text-navy/80 mt-2 leading-relaxed">{seg.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-navy/10">
                    {seg.tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-white/60 border border-navy/15 rounded-md font-jakarta text-[11px] font-semibold text-navy">
                        #{t}
                      </span>
                    ))}
                  </div>
                </PlayfulCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Profiling Attributes Matrix */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <PlayfulBadge variant="violet" className="mb-3">Profiling Matrix</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              150+ Deep Profiling Touchpoints
            </h2>
            <p className="font-jakarta text-navy-light mt-3">
              We continuously refresh individual panelist records so your screeners hit the right respondents immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {profilingPillars.map((pillar, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border-2 border-navy shadow-hard space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-navy/10">
                  <IconCircle icon={Layers} variant={i === 0 ? 'pink' : i === 1 ? 'yellow' : i === 2 ? 'violet' : 'green'} size="sm" />
                  <h3 className="font-outfit font-bold text-base text-navy">{pillar.category}</h3>
                </div>
                <ul className="space-y-2.5 font-jakarta text-xs sm:text-sm text-navy-light">
                  {pillar.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="relative z-10 py-16 bg-navy text-white border-y-2 border-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 bg-pink-500 text-white font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full mb-3 shadow-hard-sm">
              Global Scale
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">
              International Consumer Panels
            </h2>
            <p className="font-jakarta text-white/70 mt-3">
              Representing consumer demographics across 28+ key consumer markets worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalMarkets.map((m, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-outfit font-bold text-lg text-yellow flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{m.region}</span>
                  </h3>
                  <span className="text-xs font-bold font-jakarta text-pink-400 bg-white/10 px-2 py-0.5 rounded-full">
                    {m.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  {m.countries.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white/15 hover:bg-white/30 text-white font-jakarta text-xs font-semibold rounded-lg transition-colors"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Panelist Access & Consultation Section */}
      <section id="consultation" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Panelist Quick Access Card */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-3xl p-8 sm:p-10 border-2 border-navy text-white shadow-hard relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2 max-w-lg">
                <span className="inline-block px-3.5 py-1 bg-yellow text-navy font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full shadow-hard-sm">
                  Panelist Access
                </span>
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">
                  Join or Sign In to the B2C Community
                </h3>
                <p className="font-jakarta text-white/85 text-sm">
                  Take paid online surveys, share your opinions on everyday consumer products, and redeem instant cash rewards and gift cards.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <PlayfulButton variant="white" size="lg" onClick={() => navigate('/panels/b2c/login')}>
                  Login to B2C Panel
                </PlayfulButton>
                <PlayfulButton variant="yellow" size="lg" onClick={() => navigate('/panels/b2c/register')}>
                  Join B2C Panel
                </PlayfulButton>
              </div>
            </div>
          </div>

          {/* Client Feasibility Card */}
          <PlayfulCard variant="white" className="p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <PlayfulBadge variant="yellow" className="mb-3">For Consumer Brands</PlayfulBadge>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-navy">
                Request B2C Feasibility & Sampling
              </h2>
              <p className="font-jakarta text-navy-light mt-2 text-sm sm:text-base">
                Looking to deploy a consumer research project? Tell us about your target quotas and demographic mix.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@brand.com"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Consumer Insights Group"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Target Consumer Group
                  </label>
                  <select
                    value={formData.targetSegment}
                    onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 transition-all"
                  >
                    <option>General Consumer Population (Nat Rep)</option>
                    <option>Parents & Teens</option>
                    <option>Kids & Families (Parent-moderated)</option>
                    <option>High Net Worth Individuals (HNWI)</option>
                    <option>Car Owners & EV Drivers</option>
                    <option>Students & Gen Z</option>
                    <option>Specific FMCG / Retail Shoppers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                  Sample Size & Target Geographies (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. N=1,000 Nat Rep across UK & Germany, 18-45 years, grocery shoppers..."
                  className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 transition-all resize-none"
                />
              </div>

              <div className="text-center pt-2">
                <PlayfulButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 justify-center"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Get B2C Panel Feasibility'}
                  <Send className="w-4 h-4 ml-2" />
                </PlayfulButton>
              </div>
            </form>
          </PlayfulCard>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default B2CPanelPage;
