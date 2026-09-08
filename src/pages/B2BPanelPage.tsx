import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Globe,
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Download,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Award,
  Filter,
  Layers,
  Send,
  Check,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/useToast';

const professionsList = [
  'Accountants', 'Architects', 'Auto Mechanics/Repairers', 'Chartered Accountants',
  'Computer Engineers', 'Dentists', 'Drivers', 'Electricians', 'Engineers',
  'Entrepreneurs', 'Event Managers', 'Farmers', 'Financial/Investment Managers',
  'Graphic Designers', 'Beauticians / Salon Workers', 'Hoteliers', 'HVAC Installers',
  'Insurance Brokers', 'Interior Designers', 'Lawyers', 'Nurses', 'Painters',
  'Pharmacists', 'Photographers', 'Plumbers', 'Teachers', 'Travel Agents',
  'Value Added Resellers'
];

const jobTitlesList = [
  'C-Level Executives', 'Financial Controller', 'Exec Financial Management',
  'Exec Tech Management', 'Managing Director', 'President',
  'Executive Vice President (EVP)', 'Owner / Co-owner / Partner',
  'Senior Vice President (SVP)', 'Vice President (VP)', 'Executive Director',
  'Company Secretary', 'General Manager (GM)', 'Director', 'Head of Department',
  'Head of Business Unit', 'Manager'
];

const decisionMakersList = [
  { code: 'ITDMs', title: 'IT Decision Makers', desc: 'Enterprise software, infrastructure, cloud & cybersecurity procurement.' },
  { code: 'BDMs', title: 'Business Decision Makers', desc: 'Corporate strategy, operations, partnerships & commercial expansion.' },
  { code: 'HRDMs', title: 'HR Decision Makers', desc: 'Talent acquisition, organizational development, benefits & workforce tools.' },
  { code: 'FDMs', title: 'Financial Decision Makers', desc: 'Capital allocation, budgeting, audits, ERP systems & fiscal governance.' },
  { code: 'IT Purchasing DMs', title: 'IT Purchasing Leaders', desc: 'Hardware, licensing, SaaS subscriptions & vendor contract negotiations.' },
  { code: 'Non-IT Purchasing DMs', title: 'Procurement & Supply Chain', desc: 'Raw materials, logistics, office facilities & specialized vendor sourcing.' },
  { code: 'Marketing DMs', title: 'Marketing Decision Makers', desc: 'Brand management, media spend, digital advertising & CRM technologies.' }
];

const seniorityLevels = [
  { level: 'C-Level Executives', desc: 'CEOs, CTOs, CFOs, CIOs, CMOs steering enterprise vision and high-stakes budgets.' },
  { level: 'High-Level Executives', desc: 'VPs, SVPs, EVPs, and Managing Directors executing corporate division goals.' },
  { level: 'Mid-Level Executives', desc: 'Department heads, team leads, and unit managers driving daily operational excellence.' },
  { level: 'Business Owners / Partners', desc: 'Founders, proprietors, and enterprise partners with direct purchasing authority.' }
];

const breadthAttributes = [
  { title: 'Industry Vertical', items: ['Technology & SaaS', 'Healthcare & Pharma', 'Financial Services', 'Manufacturing', 'Retail & eCommerce', 'Energy & Utilities', 'Automotive', 'Construction & Real Estate'] },
  { title: 'Company Size', items: ['Micro (1-10)', 'Small (11-50)', 'Mid-Market (51-250)', 'Large (251-1,000)', 'Enterprise (1,000-5,000)', 'Global Mega Enterprise (5,000+)'] },
  { title: 'Company Revenue', items: ['Under $1M', '$1M - $10M', '$10M - $50M', '$50M - $250M', '$250M - $1B', '$1B+ Global Turnovers'] },
  { title: 'Department & Line of Business', items: ['Information Technology', 'Finance & Accounting', 'Human Resources', 'Sales & Marketing', 'Operations & Supply Chain', 'Legal & Compliance', 'R&D / Engineering'] },
];

const globalMarkets = [
  { region: 'Asia Pacific', countries: ['India', 'Hong Kong', 'Taiwan', 'Vietnam', 'Philippines', 'Malaysia', 'Australia', 'Thailand', 'Singapore', 'Indonesia', 'South Korea', 'Japan'] },
  { region: 'Europe', countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Switzerland', 'Netherlands', 'Portugal', 'Poland'] },
  { region: 'Americas', countries: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'] },
  { region: 'Middle East & Africa', countries: ['South Africa', 'Nigeria', 'UAE', 'Saudi Arabia'] }
];

const B2BPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'professions' | 'titles' | 'decision-makers' | 'seniority'>('professions');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    requirement: 'B2B Panel Access',
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
      addToast('Thank you! Your B2B panel request has been received. Our team will contact you shortly.', 'success');
      setFormData({ name: '', email: '', company: '', requirement: 'B2B Panel Access', message: '' });
    }, 800);
  };

  const filteredProfessions = professionsList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTitles = jobTitlesList.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="yellow" size="lg" className="left-[8%] top-[12%] opacity-60" />
      <DecorativeBlob variant="pink" size="md" className="right-[10%] top-[18%] opacity-60" />
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
            <PlayfulBadge variant="violet">B2B Proprietary Panel</PlayfulBadge>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-navy rounded-full shadow-hard-sm">
                <Sparkles className="w-4 h-4 text-violet animate-spin-slow" />
                <span className="font-outfit font-bold text-xs uppercase tracking-wider text-navy">
                  Authentic Respondents Across Hard-To-Reach Audiences
                </span>
              </div>

              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy leading-[1.1] tracking-tight">
                Empowering Decisions with Verified{' '}
                <span className="relative inline-block text-violet underline decoration-wavy decoration-yellow decoration-2">
                  B2B Leaders
                </span>
              </h1>

              <p className="font-jakarta text-lg sm:text-xl text-navy-light max-w-2xl leading-relaxed">
                Our aim is to provide seamless access to a broad variety of industries as well as multiple organizational tiers—from C-suite visionaries and departmental heads to verified frontline specialists.
              </p>

              {/* Key Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-violet">28+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Global Markets</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-pink-500">150+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Profile Attributes</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600">100%</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Verified DMs</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-amber-500">99.4%</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Data Quality</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <PlayfulButton variant="primary" size="lg" onClick={() => navigate('/panels/b2b/signup')}>
                  Join B2B Panel
                  <ArrowLeft className="w-5 h-5 rotate-180 ml-1" />
                </PlayfulButton>
                <PlayfulButton variant="secondary" size="lg" onClick={() => navigate('/panels/b2b/login')}>
                  Login to B2B Panel
                </PlayfulButton>
              </div>
            </div>

            {/* Hero Interactive Card */}
            <div className="lg:col-span-5">
              <PlayfulCard variant="white" className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b-2 border-navy/10">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={Briefcase} variant="violet" size="md" />
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-navy">B2B Panel Portal</h3>
                      <p className="font-jakarta text-xs text-navy/60">Verified business community</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green/20 border border-green-700 text-green-800 text-xs font-bold rounded-full">
                    Active Panel
                  </span>
                </div>

                <div className="space-y-4 font-jakarta text-sm">
                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">C-Suite & Key Decision Makers</strong>
                      <span className="text-navy-light text-xs">Direct access to enterprise ITDMs, BDMs, FDMs, and HR directors.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Granular Industry Representation</strong>
                      <span className="text-navy-light text-xs">Spanning 30+ sectors including Tech, Healthcare, Finance, and Industrial.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Stringent KYC & Verification</strong>
                      <span className="text-navy-light text-xs">Multi-layer corporate email, phone, and role cross-verification.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <PlayfulButton variant="primary" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/b2b/login')}>
                    Login to B2B Panel
                  </PlayfulButton>
                  <PlayfulButton variant="yellow" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/b2b/signup')}>
                    Join Our Panel
                  </PlayfulButton>
                </div>
              </PlayfulCard>
            </div>
          </div>
        </div>
      </section>

      {/* Depth of B2B Profiling Section */}
      <section id="profiling-depth" className="relative z-10 py-16 bg-white/80 border-y-2 border-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <PlayfulBadge variant="yellow" className="mb-3">Depth of Profiling</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              Comprehensive B2B Respondent Profiling
            </h2>
            <p className="font-jakarta text-navy-light mt-3">
              We capture over 150+ variables to pinpoint exact professional cohorts with zero guesswork.
            </p>
          </div>

          {/* Profiling Category Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {[
              { id: 'professions', label: 'Professions (28+)', icon: Briefcase },
              { id: 'titles', label: 'Job Titles (17+)', icon: Building2 },
              { id: 'decision-makers', label: 'Decision Makers (7 Categories)', icon: Users },
              { id: 'seniority', label: 'Seniority Levels (4 Tiers)', icon: Layers },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-outfit font-bold text-sm sm:text-base border-2 border-navy transition-all duration-200 shadow-hard-sm ${
                    isActive
                      ? 'bg-violet text-white -translate-y-1'
                      : 'bg-white text-navy hover:bg-periwinkle/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Filter for Professions and Titles */}
          {(activeTab === 'professions' || activeTab === 'titles') && (
            <div className="max-w-md mx-auto mb-8 relative">
              <Search className="w-5 h-5 text-navy/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Filter ${activeTab}...`}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-violet shadow-hard-sm"
              />
            </div>
          )}

          {/* Tab Content Display */}
          <div className="mt-6">
            {activeTab === 'professions' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProfessions.map((prof, i) => (
                  <div
                    key={i}
                    className="p-4 bg-periwinkle/40 hover:bg-white border-2 border-navy/15 hover:border-navy rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-hard-sm flex items-center gap-3"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-violet shrink-0" />
                    <span className="font-jakarta font-semibold text-xs sm:text-sm text-navy">{prof}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'titles' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTitles.map((title, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white border-2 border-navy rounded-2xl shadow-hard-sm hover:-translate-y-1 transition-transform flex items-center justify-between"
                  >
                    <span className="font-jakarta font-bold text-sm text-navy">{title}</span>
                    <ChevronRight className="w-4 h-4 text-violet shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'decision-makers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decisionMakersList.map((dm, i) => (
                  <PlayfulCard key={i} variant="white" className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-violet text-white font-outfit font-extrabold text-sm rounded-xl border border-navy shadow-hard-sm">
                        {dm.code}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-outfit font-bold text-lg text-navy">{dm.title}</h3>
                    <p className="font-jakarta text-xs sm:text-sm text-navy-light leading-relaxed">{dm.desc}</p>
                  </PlayfulCard>
                ))}
              </div>
            )}

            {activeTab === 'seniority' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {seniorityLevels.map((lvl, i) => (
                  <PlayfulCard key={i} variant={i % 2 === 0 ? 'lavender' : 'pink'} className="p-6 space-y-3 text-left">
                    <div className="font-outfit font-black text-3xl text-navy/20">0{i + 1}</div>
                    <h3 className="font-outfit font-bold text-lg text-navy">{lvl.level}</h3>
                    <p className="font-jakarta text-xs sm:text-sm text-navy/80">{lvl.desc}</p>
                  </PlayfulCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Breadth of B2B Profiling Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <PlayfulBadge variant="green" className="mb-3">Breadth of Coverage</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              Multi-Dimensional Segmentation
            </h2>
            <p className="font-jakarta text-navy-light mt-3">
              Filter by exact organization metrics to mirror your precise target demographic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {breadthAttributes.map((attr, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border-2 border-navy shadow-hard space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-navy/10">
                  <IconCircle icon={Filter} variant={i === 0 ? 'violet' : i === 1 ? 'pink' : i === 2 ? 'yellow' : 'green'} size="sm" />
                  <h3 className="font-outfit font-bold text-base text-navy">{attr.title}</h3>
                </div>
                <ul className="space-y-2 font-jakarta text-xs sm:text-sm text-navy-light">
                  {attr.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-violet shrink-0" />
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
            <span className="inline-block px-4 py-1.5 bg-yellow text-navy font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full mb-3">
              Worldwide Reach
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">
              Global Network of B2B Panels
            </h2>
            <p className="font-jakarta text-white/70 mt-3">
              Direct access across 28+ countries with local demographic alignment and multi-language support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalMarkets.map((m, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="font-outfit font-bold text-lg text-yellow mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{m.region}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
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
          <div className="bg-gradient-to-r from-violet to-indigo-600 rounded-3xl p-8 sm:p-10 border-2 border-navy text-white shadow-hard relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2 max-w-lg">
                <span className="inline-block px-3.5 py-1 bg-yellow text-navy font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full shadow-hard-sm">
                  Panelist Access
                </span>
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">
                  Already a B2B Panel Member?
                </h3>
                <p className="font-jakarta text-white/80 text-sm">
                  Sign in to participate in executive surveys, check your accumulated rewards balance, or register as a new verified business panelist.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <PlayfulButton variant="white" size="lg" onClick={() => navigate('/auth')}>
                  Login to B2B Panel
                </PlayfulButton>
                <PlayfulButton variant="yellow" size="lg" onClick={() => navigate('/auth?mode=signup')}>
                  Join B2B Panel
                </PlayfulButton>
              </div>
            </div>
          </div>

          {/* Client Feasibility Card */}
          <PlayfulCard variant="white" className="p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <PlayfulBadge variant="pink" className="mb-3">For Corporate Researchers</PlayfulBadge>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-navy">
                Request B2B Panel Access & Feasibility
              </h2>
              <p className="font-jakarta text-navy-light mt-2 text-sm sm:text-base">
                Looking to sample our verified B2B panel for your study? Share your specifications and our team will return with feasibility and sample counts.
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
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
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
                    placeholder="jane@company.com"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
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
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Consultation Type
                  </label>
                  <select
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
                  >
                    <option>B2B Panel Access</option>
                    <option>Quantitative Survey Execution</option>
                    <option>Qualitative IDIs & Focus Groups</option>
                    <option>Custom Hard-to-Reach Recruit</option>
                    <option>Panel Book PDF Download</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                  Project Details / Target Criteria (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your target roles, geographies, required completes, and timeline..."
                  className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all resize-none"
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
                  {isSubmitting ? 'Sending Request...' : 'Submit Consultation Request'}
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

export default B2BPanelPage;
