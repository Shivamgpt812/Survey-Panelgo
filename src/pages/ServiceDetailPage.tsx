import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Brain,
  BarChart3,
  Globe,
  Headphones,
  Building,
  FileText,
  ArrowLeft,
  Check,
  Star,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  MessageSquare,
  Zap
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface ServiceDetail {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  tagline: string;
  description: string;
  detailedDescription: string;
  features: string[];
  benefits: string[];
  process: string[];
  useCases: string[];
  technologies: string[];
  stats: { label: string; value: string; description: string }[];
  variant: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange';
  bgGradient: string;
  accentColor: string;
}

const servicesData: ServiceDetail[] = [
  {
    id: 'qualitative-research',
    icon: Brain,
    title: 'Qualitative Research',
    tagline: 'Understanding the Why Behind the What',
    description: 'We uncover human motivations through interviews, focus groups, and deep listening—bringing context to numbers and clarity to strategy.',
    detailedDescription: 'Our qualitative research methodology goes beyond surface-level responses to uncover the deep-seated motivations, emotions, and cultural factors that drive consumer behavior. Through carefully crafted conversations and observational techniques, we help you understand the stories behind your data.',
    features: [
      'In-depth interviews (IDIs)',
      'Focus group discussions',
      'Ethnographic research',
      'User experience studies',
      'Brand perception analysis',
      'Emotional mapping exercises',
      'Projective techniques',
      'Storytelling sessions'
    ],
    benefits: [
      'Deep consumer insights',
      'Contextual understanding',
      'Emotional connection mapping',
      'Brand perception clarity',
      'Product development guidance',
      'Communication strategy insights'
    ],
    process: [
      'Research design & planning',
      'Recruitment & screening',
      'Data collection (interviews/groups)',
      'Transcription & analysis',
      'Insight synthesis',
      'Strategic recommendations'
    ],
    useCases: [
      'New product development',
      'Brand positioning studies',
      'Customer journey mapping',
      'Advertising concept testing',
      'Usability research',
      'Cultural trend analysis'
    ],
    technologies: [
      'Digital recording systems',
      'Transcription software',
      'Qualitative analysis tools',
      'Video conferencing platforms',
      'Online focus group rooms',
      'Sentiment analysis AI'
    ],
    stats: [
      { label: 'Average Interview Duration', value: '45-60 min', description: 'Optimal for deep insights' },
      { label: 'Focus Group Size', value: '6-8 people', description: 'Ideal for dynamic discussion' },
      { label: 'Analysis Turnaround', value: '5-7 days', description: 'Quick insight delivery' },
      { label: 'Client Satisfaction', value: '98%', description: 'Exceeding expectations' }
    ],
    variant: 'pink',
    bgGradient: 'from-pink-50 to-purple-50',
    accentColor: 'text-pink-600'
  },
  {
    id: 'quantitative-research',
    icon: BarChart3,
    title: 'Quantitative Research',
    tagline: 'Measuring What Matters',
    description: 'We transform data into measurable insights through structured surveys, analytics, and segmentation across diverse demographics and regions.',
    detailedDescription: 'Our quantitative research approach combines rigorous statistical methodology with cutting-edge technology to deliver precise, actionable insights. From large-scale market studies to targeted customer satisfaction surveys, we ensure every number tells a story that drives business decisions.',
    features: [
      'Large-scale surveys',
      'Statistical analysis',
      'Market segmentation',
      'Conjoint analysis',
      'Predictive modeling',
      'Regression analysis',
      'Factor analysis',
      'Cluster analysis'
    ],
    benefits: [
      'Statistical significance',
      'Generalizable findings',
      'Trend identification',
      'Market sizing accuracy',
      'ROI measurement',
      'Risk assessment insights'
    ],
    process: [
      'Hypothesis formulation',
      'Sample design & calculation',
      'Questionnaire development',
      'Data collection & validation',
      'Statistical analysis',
      'Report generation'
    ],
    useCases: [
      'Market sizing studies',
      'Brand health tracking',
      'Customer satisfaction measurement',
      'Price sensitivity analysis',
      'Market share studies',
      'Advertising effectiveness'
    ],
    technologies: [
      'Advanced statistical software',
      'Online survey platforms',
      'Data visualization tools',
      'Machine learning algorithms',
      'Real-time analytics dashboards',
      'Mobile survey applications'
    ],
    stats: [
      { label: 'Sample Size Range', value: '200-50,000+', description: 'Scalable research solutions' },
      { label: 'Confidence Level', value: '95-99%', description: 'Statistical reliability' },
      { label: 'Data Processing', value: '24-48 hours', description: 'Quick turnaround' },
      { label: 'Accuracy Rate', value: '99.5%', description: 'Data quality assurance' }
    ],
    variant: 'yellow',
    bgGradient: 'from-yellow-50 to-orange-50',
    accentColor: 'text-yellow-600'
  },
  {
    id: 'online-research',
    icon: Globe,
    title: 'Online Research',
    tagline: 'Digital Insights at Digital Speed',
    description: 'We conduct research using digital panels and online tools delivering faster turnarounds, broader reach, and scalable study models.',
    detailedDescription: 'Leveraging our extensive digital panel network and advanced online research methodologies, we deliver insights at the speed of digital. Our online research solutions combine the reach of digital platforms with the rigor of traditional research methods.',
    features: [
      'Online panel management',
      'Digital surveys',
      'Mobile research',
      'Social media analytics',
      'Real-time data collection',
      'Online communities',
      'Digital ethnography',
      'Web analytics integration'
    ],
    benefits: [
      'Faster turnaround times',
      'Cost-effective solutions',
      'Global reach capability',
      'Real-time insights',
      'Higher response rates',
      'Digital-native respondents'
    ],
    process: [
      'Digital panel selection',
      'Online survey deployment',
      'Real-time monitoring',
      'Data quality checks',
      'Automated analysis',
      'Interactive reporting'
    ],
    useCases: [
      'Concept testing',
      'Brand tracking studies',
      'Customer experience research',
      'Product feedback collection',
      'Market trend analysis',
      'Competitive monitoring'
    ],
    technologies: [
      'Online survey platforms',
      'Panel management systems',
      'Real-time analytics',
      'Mobile-first design',
      'AI-powered insights',
      'Interactive dashboards'
    ],
    stats: [
      { label: 'Panel Size', value: '6M+', description: 'Global respondents' },
      { label: 'Response Rate', value: '25-40%', description: 'Above industry average' },
      { label: 'Field Time', value: '1-3 days', description: 'Rapid data collection' },
      { label: 'Geographic Reach', value: '50+', description: 'Countries covered' }
    ],
    variant: 'green',
    bgGradient: 'from-green-50 to-teal-50',
    accentColor: 'text-green-600'
  },
  {
    id: 'telephone-surveys',
    icon: Headphones,
    title: 'Telephone Surveys',
    tagline: 'Human Voice, Human Insights',
    description: 'Human-led voice surveys that build trust, explore sentiment, and gather nuanced responses—ideal for hard-to-reach or high-value audiences.',
    detailedDescription: 'Our telephone survey services combine the personal touch of human interaction with the efficiency of modern technology. Perfect for reaching specific demographics, conducting complex surveys, or gathering sensitive information that requires human nuance.',
    features: [
      'CATI services',
      'Executive interviews',
      'Customer satisfaction surveys',
      'Market research calls',
      'Quality assurance',
      'Multi-language support',
      'Appointment scheduling',
      'Real-time monitoring'
    ],
    benefits: [
      'Higher completion rates',
      'Quality data collection',
      'Clarification opportunities',
      'Rapport building',
      'Immediate feedback',
      'Complex survey handling'
    ],
    process: [
      'Script development',
      'Interviewer training',
      'Sample preparation',
      'Call scheduling',
      'Interview conduct',
      'Data verification'
    ],
    useCases: [
      'B2B research',
      'Executive interviews',
      'Healthcare research',
      'Financial services studies',
      'Government surveys',
      'Customer satisfaction'
    ],
    technologies: [
      'CATI systems',
      'Digital recording',
      'Real-time transcription',
      'Quality monitoring',
      'Automated dialing',
      'CRM integration'
    ],
    stats: [
      { label: 'Completion Rate', value: '60-80%', description: 'Industry leading' },
      { label: 'Interviewer Training', value: '40+ hours', description: 'Comprehensive preparation' },
      { label: 'Languages', value: '15+', description: 'Multi-language capability' },
      { label: 'Quality Score', value: '99%', description: 'Rigorous QA process' }
    ],
    variant: 'lavender',
    bgGradient: 'from-purple-50 to-pink-50',
    accentColor: 'text-purple-600'
  },
  {
    id: 'business-research',
    icon: Building,
    title: 'Business Research',
    tagline: 'Strategic Intelligence for Growth',
    description: 'From market mapping to competitor benchmarking, we deliver data-backed intelligence that powers strategic business and product decisions.',
    detailedDescription: 'Our business research services provide comprehensive intelligence that drives strategic decision-making. We combine primary research with secondary analysis to give you a complete picture of your market, competitors, and opportunities.',
    features: [
      'Market sizing studies',
      'Competitive intelligence',
      'Industry analysis',
      'Customer satisfaction',
      'Brand health tracking',
      'Opportunity assessment',
      'Risk analysis',
      'Growth strategy research'
    ],
    benefits: [
      'Strategic clarity',
      'Competitive advantage',
      'Market opportunity identification',
      'Risk mitigation',
      'Growth pathway mapping',
      'Investment decision support'
    ],
    process: [
      'Research scope definition',
      'Information gathering',
      'Data triangulation',
      'Analysis & synthesis',
      'Strategic framework development',
      'Actionable recommendations'
    ],
    useCases: [
      'Market entry strategy',
      'Competitive positioning',
      'M&A due diligence',
      'Product line expansion',
      'Customer segmentation',
      'Partnership evaluation'
    ],
    technologies: [
      'Business intelligence tools',
      'Market databases',
      'Financial modeling software',
      'Competitive monitoring systems',
      'Data visualization platforms',
      'Industry analytics'
    ],
    stats: [
      { label: 'Industries Covered', value: '50+', description: 'Cross-sector expertise' },
      { label: 'Analysis Depth', value: '360°', description: 'Comprehensive view' },
      { label: 'Report Detail', value: '100+ pages', description: 'Thorough analysis' },
      { label: 'Strategic Impact', value: '85%', description: 'Client success rate' }
    ],
    variant: 'violet',
    bgGradient: 'from-violet-50 to-indigo-50',
    accentColor: 'text-violet-600'
  },
  {
    id: 'other-services',
    icon: FileText,
    title: 'Other Services',
    tagline: 'Custom Solutions for Unique Needs',
    description: 'We offer flexible research extensions, including mystery shopping, CATI/CAWI, brand audits, and hybrid studies—tailored to your unique needs.',
    detailedDescription: 'Our specialized services fill the gaps where traditional research methods may not fully address your unique challenges. From mystery shopping to hybrid methodologies, we create custom solutions that deliver the specific insights you need.',
    features: [
      'Mystery shopping',
      'Brand audits',
      'Hybrid research methods',
      'Custom research design',
      'Consulting services',
      'Training programs',
      'Workshop facilitation',
      'Research methodology consulting'
    ],
    benefits: [
      'Tailored solutions',
      'Flexible methodologies',
      'Specialized expertise',
      'Custom deliverables',
      'Integrated approaches',
      'Innovation in research'
    ],
    process: [
      'Needs assessment',
      'Custom solution design',
      'Methodology selection',
      'Implementation planning',
      'Execution & monitoring',
      'Custom reporting'
    ],
    useCases: [
      'Service quality assessment',
      'Brand compliance audits',
      'Employee experience research',
      'Channel performance studies',
      'Innovation workshops',
      'Research capability building'
    ],
    technologies: [
      'Custom survey platforms',
      'Mobile data collection',
      'Video analysis tools',
      'Geolocation tracking',
      'Image recognition',
      'Custom analytics'
    ],
    stats: [
      { label: 'Custom Projects', value: '200+', description: 'Successfully delivered' },
      { label: 'Methodology Types', value: '25+', description: 'Research approaches' },
      { label: 'Flexibility Score', value: '100%', description: 'Fully customizable' },
      { label: 'Client Retention', value: '95%', description: 'Long-term partnerships' }
    ],
    variant: 'mint',
    bgGradient: 'from-teal-50 to-cyan-50',
    accentColor: 'text-teal-600'
  }
];

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const service = servicesData.find(s => s.id === serviceId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <div className="text-center">
          <h1 className="font-outfit font-bold text-4xl text-navy mb-4">Service Not Found</h1>
          <p className="font-jakarta text-navy-light mb-8">The service you're looking for doesn't exist.</p>
          <PlayfulButton variant="primary" onClick={() => navigate('/services')}>
            Back to Services
          </PlayfulButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-br ${service.bgGradient}`}>
      <DotGrid className="fixed inset-0" />
      
      {/* Unique decorative elements for each service */}
      <DecorativeBlob variant={service.variant} size="lg" className="left-[10%] top-[15%] opacity-60" />
      <DecorativeBlob variant={service.variant === 'pink' ? 'yellow' : 'pink'} size="md" className="right-[15%] top-[20%] opacity-60" />
      <DecorativeBlob variant={service.variant === 'green' ? 'lavender' : 'green'} size="lg" className="right-[10%] bottom-[20%] opacity-60" />
      <DecorativeBlob variant={service.variant === 'violet' ? 'mint' : 'violet'} size="md" className="left-[15%] bottom-[15%] opacity-60" />

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
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 mb-8 text-navy hover:text-violet transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-jakarta font-medium">Back to Services</span>
          </button>

          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <IconCircle variant={service.variant} size="xl">
                <service.icon className="w-12 h-12" />
              </IconCircle>
            </div>
            
            <h1 className={`font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy mb-4 leading-[1.1]`}>
              {service.title}
            </h1>
            
            <p className={`font-outfit font-semibold text-2xl ${service.accentColor} mb-6`}>
              {service.tagline}
            </p>
            
            <p className="font-jakarta text-xl text-navy-light max-w-3xl mx-auto mb-8">
              {service.description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {service.stats.map((stat) => (
              <PlayfulCard key={stat.label} variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
                <p className={`font-outfit font-extrabold text-2xl ${service.accentColor} mb-2`}>
                  {stat.value}
                </p>
                <p className="font-jakarta font-semibold text-navy mb-1">{stat.label}</p>
                <p className="font-jakarta text-sm text-navy-light">{stat.description}</p>
              </PlayfulCard>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Description */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <PlayfulCard variant="static" className="p-12 bg-white/90">
            <h2 className={`font-outfit font-bold text-3xl text-navy mb-6 flex items-center gap-3`}>
              <div className={`w-12 h-12 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-100 rounded-full flex items-center justify-center`}>
                <Lightbulb className={`w-6 h-6 ${service.accentColor}`} />
              </div>
              About This Service
            </h2>
            <p className="font-jakarta text-lg text-navy-light leading-relaxed">
              {service.detailedDescription}
            </p>
          </PlayfulCard>
        </div>
      </section>

      {/* Features & Benefits Grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Features */}
            <PlayfulCard variant="static" className="p-8 bg-white/90">
              <h3 className={`font-outfit font-bold text-2xl text-navy mb-6 flex items-center gap-3`}>
                <div className={`w-10 h-10 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-100 rounded-full flex items-center justify-center`}>
                  <Star className={`w-5 h-5 ${service.accentColor}`} />
                </div>
                Key Features
              </h3>
              <div className="space-y-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-jakarta text-navy">{feature}</span>
                  </div>
                ))}
              </div>
            </PlayfulCard>

            {/* Benefits */}
            <PlayfulCard variant="static" className="p-8 bg-white/90">
              <h3 className={`font-outfit font-bold text-2xl text-navy mb-6 flex items-center gap-3`}>
                <div className={`w-10 h-10 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-100 rounded-full flex items-center justify-center`}>
                  <TrendingUp className={`w-5 h-5 ${service.accentColor}`} />
                </div>
                Benefits
              </h3>
              <div className="space-y-3">
                {service.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-jakarta text-navy">{benefit}</span>
                  </div>
                ))}
              </div>
            </PlayfulCard>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`font-outfit font-bold text-3xl text-navy mb-4 flex items-center justify-center gap-3`}>
              <div className={`w-12 h-12 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-100 rounded-full flex items-center justify-center`}>
                <Clock className={`w-6 h-6 ${service.accentColor}`} />
              </div>
              Our Process
            </h2>
            <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto">
              A systematic approach to delivering actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.process.map((step, index) => (
              <PlayfulCard key={index} variant="static" className="p-6 bg-white/90 hover:shadow-hard transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold font-outfit`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-outfit font-semibold text-lg text-navy mb-2">
                      Step {index + 1}
                    </h4>
                    <p className="font-jakarta text-navy-light">{step}</p>
                  </div>
                </div>
              </PlayfulCard>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases & Technologies */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Use Cases */}
            <PlayfulCard variant="static" className="p-8 bg-white/90">
              <h3 className={`font-outfit font-bold text-2xl text-navy mb-6 flex items-center gap-3`}>
                <div className={`w-10 h-10 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-100 rounded-full flex items-center justify-center`}>
                  <Target className={`w-5 h-5 ${service.accentColor}`} />
                </div>
                Use Cases
              </h3>
              <div className="space-y-3">
                {service.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-jakarta text-navy">{useCase}</span>
                  </div>
                ))}
              </div>
            </PlayfulCard>

            {/* Technologies */}
            <PlayfulCard variant="static" className="p-8 bg-white/90">
              <h3 className={`font-outfit font-bold text-2xl text-navy mb-6 flex items-center gap-3`}>
                <div className={`w-10 h-10 bg-${service.variant === 'pink' ? 'pink' : service.variant === 'yellow' ? 'yellow' : service.variant === 'green' ? 'green' : service.variant === 'lavender' ? 'purple' : service.variant === 'violet' ? 'violet' : 'teal'}-100 rounded-full flex items-center justify-center`}>
                  <Zap className={`w-5 h-5 ${service.accentColor}`} />
                </div>
                Technologies & Tools
              </h3>
              <div className="space-y-3">
                {service.technologies.map((tech, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-jakarta text-navy">{tech}</span>
                  </div>
                ))}
              </div>
            </PlayfulCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <PlayfulCard variant="static" className="p-12 bg-white/90 text-center">
            <div className="flex justify-center mb-6">
              <IconCircle variant={service.variant} size="xl">
                <MessageSquare className="w-8 h-8" />
              </IconCircle>
            </div>
            
            <h2 className={`font-outfit font-bold text-3xl text-navy mb-4`}>
              Ready to Get Started?
            </h2>
            
            <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto mb-8">
              Let's discuss how our {service.title.toLowerCase()} can help you achieve your business goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <PlayfulButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/auth')}
              >
                Start Your Project
              </PlayfulButton>
              <PlayfulButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Schedule Consultation
              </PlayfulButton>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-navy-light">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-jakarta text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="font-jakarta text-sm">research@surveypanelgo.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-jakarta text-sm">Global Coverage</span>
              </div>
            </div>
          </PlayfulCard>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;
