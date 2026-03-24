import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  BarChart3,
  Award,
  MapPin,
  Calendar,
  Eye,
  Heart,
  Map,
  TrendingUp,
  Target,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface CountryStats {
  country: string;
  flag: string;
  members: string;
  variant: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'white';
  totalPanelists: number;
  avgSurveysPerMonth: number;
  completionRate: number;
  satisfactionScore: number;
}

const countryStats: CountryStats[] = [
  {
    country: 'India',
    flag: '🇮🇳',
    members: '1.2M+',
    variant: 'yellow' as const,
    totalPanelists: 1200000,
    avgSurveysPerMonth: 8.5,
    completionRate: 78,
    satisfactionScore: 4.2,
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    members: '800K+',
    variant: 'pink' as const,
    totalPanelists: 800000,
    avgSurveysPerMonth: 6.2,
    completionRate: 82,
    satisfactionScore: 4.5,
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    members: '500K+',
    variant: 'lavender' as const,
    totalPanelists: 500000,
    avgSurveysPerMonth: 7.8,
    completionRate: 85,
    satisfactionScore: 4.3,
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    members: '400K+',
    variant: 'periwinkle' as const,
    totalPanelists: 400000,
    avgSurveysPerMonth: 8.2,
    completionRate: 88,
    satisfactionScore: 4.6,
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    members: '350K+',
    variant: 'green' as const,
    totalPanelists: 350000,
    avgSurveysPerMonth: 7.5,
    completionRate: 84,
    satisfactionScore: 4.4,
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    members: '300K+',
    variant: 'violet' as const,
    totalPanelists: 300000,
    avgSurveysPerMonth: 8.8,
    completionRate: 86,
    satisfactionScore: 4.5,
  },
  {
    country: 'Singapore',
    flag: '🇸🇬',
    members: '150K+',
    variant: 'yellow' as const,
    totalPanelists: 150000,
    avgSurveysPerMonth: 9.2,
    completionRate: 90,
    satisfactionScore: 4.7,
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    members: '200K+',
    variant: 'pink' as const,
    totalPanelists: 200000,
    avgSurveysPerMonth: 7.8,
    completionRate: 92,
    satisfactionScore: 4.8,
  },
];

const CountryHeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />

      <DecorativeBlob variant="pink" size="lg" className="left-[10%] top-[15%] opacity-60" />
      <DecorativeBlob variant="yellow" size="md" className="right-[15%] top-[20%] opacity-60" />
      <DecorativeBlob variant="green" size="lg" className="right-[10%] bottom-[20%] opacity-60" />
      <DecorativeBlob variant="lavender" size="md" className="left-[15%] bottom-[15%] opacity-60" />

      {/* Navigation */}
      <nav className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/70 backdrop-blur-md border-b-2 border-navy/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 min-w-0 text-left -ml-1 sm:-ml-0"
            aria-label="Back to home"
          >
            <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
          </button>

          <div className="hidden lg:flex items-center gap-8">
            <a href="/" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Home
            </a>
            <a href="/services" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Services
            </a>
            <a href="/blog" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Blog
            </a>
            <a href="/about" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <PlayfulButton variant="secondary" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </PlayfulButton>
            <PlayfulButton variant="primary" size="sm" onClick={() => navigate('/auth')}>
              Join Our Panel
            </PlayfulButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy leading-[1.1] mb-6">
              Global Panelist
              <br />
              <span className="relative inline-block">
                Distribution
              </span>
            </h1>
            <p className="font-jakarta text-xl text-navy-light max-w-4xl mx-auto mb-12">
              Explore our diverse global panelist community across 8 countries. 
              Click on any country to view detailed demographics, industry breakdown, and regional insights.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Map Section - 60% */}
            <div className="lg:col-span-3">
              <PlayfulCard className="p-8 h-96 bg-white/90 hover:shadow-hard transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <Map className="w-8 h-8 text-violet" />
                  <h3 className="font-outfit font-bold text-xl text-navy">
                    World Map
                  </h3>
                </div>
                <div className="w-full h-64 bg-gradient-to-br from-violet/10 to-violet/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-15267793571-f548733f5e3?w=800&h=400&fit=crop"
                    alt="World map showing global panelist distribution"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="font-jakarta text-xl text-white font-medium drop-shadow-lg">
                        Global Coverage
                      </p>
                    </div>
                  </div>
                </div>
              </PlayfulCard>
            </div>

            {/* Stats Section - 40% */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {countryStats.map((country, index) => (
                  <PlayfulCard key={country.country} className="p-6 bg-white/90 hover:shadow-hard transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl filter saturate-150 drop-shadow-sm">{country.flag}</span>
                        <h4 className="font-outfit font-bold text-lg text-navy group-hover:text-violet transition-colors">
                          {country.country}
                        </h4>
                      </div>
                      <MapPin className="w-4 h-4 text-navy-light group-hover:text-pink transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-jakarta text-sm text-navy-light">Total Panelists</span>
                        <span className="font-outfit font-bold text-2xl text-violet">
                          {country.totalPanelists.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-jakarta text-sm text-navy-light">Monthly Surveys</span>
                        <span className="font-outfit font-bold text-2xl text-violet group-hover:text-violet transition-colors">
                          {country.avgSurveysPerMonth}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-jakarta text-sm text-navy-light">Completion Rate</span>
                        <span className="font-outfit font-bold text-2xl text-violet group-hover:text-violet transition-colors">
                          {country.completionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-jakarta text-sm text-navy-light">Satisfaction</span>
                        <span className="font-outfit font-bold text-2xl text-violet group-hover:text-violet transition-colors">
                          {country.satisfactionScore}/5
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-navy/10">
                      <PlayfulButton 
                        variant="primary" 
                        size="sm"
                        onClick={() => navigate(`/country/${country.country.toLowerCase().replace(/\s+/g, '-')}`)}
                        className="w-full"
                      >
                        View Details
                      </PlayfulButton>
                    </div>
                  </PlayfulCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <PlayfulCard variant="static" className="p-12 bg-white/90 text-center">
            <div className="flex justify-center mb-8">
              <IconCircle variant="yellow" size="xl">
                <Users className="w-8 h-8" />
              </IconCircle>
            </div>
            <h2 className="font-outfit font-bold text-3xl text-navy mb-4">
              Join Our Global Panelist Community
            </h2>
            <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto mb-8">
              Become part of our diverse and engaged panelist community. 
              Share your opinions, earn rewards, and help shape the future of products and services worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PlayfulButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/auth')}
              >
                Join Now
              </PlayfulButton>
              <PlayfulButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/')}
              >
                Learn More
              </PlayfulButton>
            </div>
          </PlayfulCard>
        </div>
      </section>
    </div>
  );
};

export default CountryHeroSection;
