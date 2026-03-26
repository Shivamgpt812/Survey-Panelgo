import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Brain,
  BarChart3,
  Globe,
  Headphones,
  Building,
  FileText,
  ArrowLeft,
  Check,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Award,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Footer from '@/components/layout/Footer';

interface ServiceItem {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  features: string[];
  variant: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'white';
  id: string;
}

const services: ServiceItem[] = [
  {
    icon: Brain,
    title: 'Qualitative Research',
    description: 'We uncover human motivations through interviews, focus groups, and deep listening—bringing context to numbers and clarity to strategy.',
    features: [
      'In-depth interviews',
      'Focus group moderation',
      'Ethnographic research',
      'User experience studies',
      'Brand perception analysis'
    ],
    variant: 'pink' as const,
    id: 'qualitative-research',
  },
  {
    icon: BarChart3,
    title: 'Quantitative Research',
    description: 'We transform data into measurable insights through structured surveys, analytics, and segmentation across diverse demographics and regions.',
    features: [
      'Large-scale surveys',
      'Statistical analysis',
      'Market segmentation',
      'Conjoint analysis',
      'Predictive modeling'
    ],
    variant: 'yellow' as const,
    id: 'quantitative-research',
  },
  {
    icon: Globe,
    title: 'Online Research',
    description: 'We conduct research using digital panels and online tools delivering faster turnarounds, broader reach, and scalable study models.',
    features: [
      'Online panel management',
      'Digital surveys',
      'Mobile research',
      'Social media analytics',
      'Real-time data collection'
    ],
    variant: 'green' as const,
    id: 'online-research',
  },
  {
    icon: Headphones,
    title: 'Telephone Surveys',
    description: 'Human-led voice surveys that build trust, explore sentiment, and gather nuanced responses—ideal for hard-to-reach or high-value audiences.',
    features: [
      'CATI services',
      'Executive interviews',
      'Customer satisfaction surveys',
      'Market research calls',
      'Quality assurance'
    ],
    variant: 'lavender' as const,
    id: 'telephone-surveys',
  },
  {
    icon: Building,
    title: 'Business Research',
    description: 'From market mapping to competitor benchmarking, we deliver data-backed intelligence that powers strategic business and product decisions.',
    features: [
      'Market sizing studies',
      'Competitive intelligence',
      'Industry analysis',
      'Customer satisfaction',
      'Brand health tracking'
    ],
    variant: 'violet' as const,
    id: 'business-research',
  },
  {
    icon: FileText,
    title: 'Other Services',
    description: 'We offer flexible research extensions, including mystery shopping, CATI/CAWI, brand audits, and hybrid studies—tailored to your unique needs.',
    features: [
      'Mystery shopping',
      'Brand audits',
      'Hybrid research methods',
      'Custom research design',
      'Consulting services'
    ],
    variant: 'mint' as const,
    id: 'other-services',
  },
];

const stats = [
  { value: 300, label: 'Brands served', suffix: '+' },
  { value: 6, label: 'Global panellists', suffix: 'M+' },
  { value: 50, label: 'Industries covered', suffix: '+' },
  { value: 100, label: 'Client satisfaction', suffix: '%' },
];

const ServicesPage: React.FC = () => {
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
            <a href="/services" className="font-jakarta font-medium text-violet">
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
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 mb-8 text-navy hover:text-violet transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-jakarta font-medium">Back to Home</span>
            </button>

            <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy mb-6 leading-[1.1]">
              Research Solutions
              <br />
              <span className="relative inline-block">
                Built for Impact
              </span>
            </h1>

            <p className="font-jakarta text-xl text-navy-light max-w-3xl mx-auto mb-8">
              We deliver comprehensive research solutions that transform data into actionable insights,
              helping businesses make informed decisions with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PlayfulButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </PlayfulButton>
              <PlayfulButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </PlayfulButton>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <PlayfulCard key={stat.label} variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
                <div className="flex justify-center mb-4">
                  <IconCircle variant={index === 0 ? 'yellow' : index === 1 ? 'pink' : index === 2 ? 'green' : 'lavender'} size="lg">
                    {index === 0 ? <TrendingUp className="w-6 h-6" /> :
                      index === 1 ? <Users className="w-6 h-6" /> :
                        index === 2 ? <Target className="w-6 h-6" /> :
                          <Award className="w-6 h-6" />}
                  </IconCircle>
                </div>
                <p className="font-outfit font-extrabold text-3xl text-violet mb-2">
                  {stat.value}{stat.suffix}
                </p>
                <p className="font-jakarta text-sm text-navy-light font-medium">{stat.label}</p>
              </PlayfulCard>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <PlayfulCard key={service.title} className="p-8 bg-white/90 hover:shadow-hard transition-all group">
                <div className="flex justify-center mb-6">
                  <IconCircle variant={service.variant} size="xl" className="group-hover:scale-110 transition-transform">
                    <service.icon className="w-8 h-8" />
                  </IconCircle>
                </div>

                <h3 className="font-outfit font-bold text-2xl text-navy mb-4 text-center group-hover:text-violet transition-colors">
                  {service.title}
                </h3>

                <p className="font-jakarta text-navy-light mb-6 text-center">
                  {service.description}
                </p>

                <div className="space-y-3">
                  <h4 className="font-jakarta font-semibold text-navy mb-3">Key Features:</h4>
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green border-2 border-navy rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-navy" />
                      </div>
                      <span className="font-jakarta text-sm text-navy">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-navy/10">
                  <PlayfulButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/services/${service.id}`)}
                  >
                    Learn More
                  </PlayfulButton>
                </div>
              </PlayfulCard>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <PlayfulCard variant="static" className="p-12 bg-white/90">
              <div className="flex justify-center mb-6">
                <IconCircle variant="yellow" size="xl">
                  <Lightbulb className="w-8 h-8" />
                </IconCircle>
              </div>
              <h2 className="font-outfit font-bold text-3xl text-navy mb-4">
                Ready to Transform Your Research?
              </h2>
              <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto mb-8">
                Join hundreds of companies that trust us to deliver actionable insights that drive business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PlayfulButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Start Your Journey
                </PlayfulButton>
                <PlayfulButton
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/contact')}
                >
                  Schedule a Consultation
                </PlayfulButton>
              </div>
            </PlayfulCard>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ServicesPage;
