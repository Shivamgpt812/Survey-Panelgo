import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Globe,
  Award,
  Target,
  Lightbulb,
  Heart,
  Shield,
  Zap,
  Check,
  Star,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  Building,
  Eye,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  expertise: string[];
}

interface CompanyValue {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  variant: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'white';
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Chief Executive Officer',
    bio: 'With over 15 years of experience in market research, Sarah leads our vision of delivering actionable insights that drive business growth.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80&auto=format&fit=crop',
    expertise: ['Strategic Planning', 'Quantitative Analysis', 'Global Markets'],
  },
  {
    name: 'Michael Rodriguez',
    role: 'Chief Research Officer',
    bio: 'Michael specializes in consumer behavior analysis and has helped Fortune 500 companies understand their customers better.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop',
    expertise: ['Consumer Insights', 'Behavioral Economics', 'Research Design'],
  },
  {
    name: 'Emma Thompson',
    role: 'Head of Operations',
    bio: 'Emma ensures our research projects run smoothly and efficiently, delivering high-quality insights on time and within budget.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop',
    expertise: ['Project Management', 'Quality Assurance', 'Process Optimization'],
  },
  {
    name: 'James Wilson',
    role: 'Director of Digital Research',
    bio: 'James pioneers innovative digital research methods, leveraging AI and machine learning to uncover deeper insights.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop',
    expertise: ['Digital Analytics', 'AI Research', 'Online Panels'],
  },
];

const companyValues: CompanyValue[] = [
  {
    icon: Shield,
    title: 'Integrity First',
    description: 'We uphold the highest ethical standards in all our research, ensuring data accuracy and participant privacy.',
    variant: 'blue' as const,
  },
  {
    icon: Lightbulb,
    title: 'Innovation Driven',
    description: 'We continuously explore new methodologies and technologies to deliver cutting-edge research solutions.',
    variant: 'yellow' as const,
  },
  {
    icon: Heart,
    title: 'Client Centric',
    description: 'Your success is our priority. We tailor our approach to meet your unique business needs and objectives.',
    variant: 'pink' as const,
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    description: 'With presence in multiple countries, we bring diverse cultural insights to every research project.',
    variant: 'green' as const,
  },
  {
    icon: Zap,
    title: 'Agile Execution',
    description: 'We adapt quickly to changing market conditions and deliver insights with speed and precision.',
    variant: 'lavender' as const,
  },
  {
    icon: Target,
    title: 'Results Focused',
    description: 'Our research is designed to deliver actionable insights that drive measurable business outcomes.',
    variant: 'orange' as const,
  },
];

const stats = [
  { value: 15, label: 'Years of Excellence', suffix: '+' },
  { value: 300, label: 'Brands Trust Us', suffix: '+' },
  { value: 6, label: 'Global Panellists', suffix: 'M+' },
  { value: 50, label: 'Countries Served', suffix: '+' },
];

const milestones = [
  { year: '2009', title: 'Founded', description: 'Started with a vision to transform market research' },
  { year: '2012', title: 'Global Expansion', description: 'Expanded operations to 10 countries' },
  { year: '2015', title: 'Digital Innovation', description: 'Launched our first online research platform' },
  { year: '2018', title: 'AI Integration', description: 'Incorporated machine learning into our research methodology' },
  { year: '2021', title: 'Million Milestone', description: 'Reached 1M+ verified global panellists' },
  { year: '2024', title: 'Industry Leadership', description: 'Recognized as leaders in AI-driven research' },
];

const AboutPage: React.FC = () => {
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
            <a href="/about" className="font-jakarta font-medium text-violet">
              About
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <PlayfulButton variant="secondary" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </PlayfulButton>
            <PlayfulButton variant="primary" size="sm" onClick={() => navigate('/auth')}>
              Join Free
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
              About Survey
              <br />
              <span className="relative inline-block">
                Panel Go
              </span>
            </h1>

            <p className="font-jakarta text-xl text-navy-light max-w-3xl mx-auto mb-8">
              We are a leading market research company dedicated to transforming data into actionable insights 
              that drive business growth and innovation across industries worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PlayfulButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/services')}
              >
                Our Services
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <PlayfulCard key={stat.label} variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
                <div className="flex justify-center mb-4">
                  <IconCircle variant={index === 0 ? 'yellow' : index === 1 ? 'pink' : index === 2 ? 'green' : 'lavender'} size="lg">
                    {index === 0 ? <Award className="w-6 h-6" /> : 
                     index === 1 ? <Building className="w-6 h-6" /> : 
                     index === 2 ? <Users className="w-6 h-6" /> : 
                     <Globe className="w-6 h-6" />}
                  </IconCircle>
                </div>
                <p className="font-outfit font-extrabold text-3xl text-violet mb-2">
                  {stat.value}{stat.suffix}
                </p>
                <p className="font-jakarta text-sm text-navy-light font-medium">{stat.label}</p>
              </PlayfulCard>
            ))}
          </div>

          {/* Our Story */}
          <div className="mb-20">
            <PlayfulCard variant="static" className="p-12 bg-white/90">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-outfit font-bold text-3xl text-navy mb-6">Our Story</h2>
                  <p className="font-jakarta text-navy-light mb-6 leading-relaxed">
                    Founded in 2009, Survey Panel Go began with a simple mission: to bridge the gap between businesses 
                    and their customers through meaningful research insights. What started as a small team of passionate 
                    researchers has grown into a global network of experts serving hundreds of brands across multiple continents.
                  </p>
                  <p className="font-jakarta text-navy-light mb-6 leading-relaxed">
                    Today, we combine cutting-edge technology with deep industry expertise to deliver research solutions that 
                    not only answer questions but also anticipate future trends. Our commitment to innovation and excellence 
                    has made us a trusted partner for businesses seeking to understand their markets better.
                  </p>
                  <p className="font-jakarta text-navy-light leading-relaxed">
                    As we look to the future, we remain dedicated to our core values of integrity, innovation, and client success, 
                    ensuring that every research project we undertake delivers measurable impact and lasting value.
                  </p>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop"
                    alt="Team collaboration"
                    className="rounded-3xl border-2 border-navy shadow-hard w-full"
                  />
                </div>
              </div>
            </PlayfulCard>
          </div>

          {/* Company Values */}
          <div className="mb-20">
            <h2 className="font-outfit font-bold text-3xl text-navy mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyValues.map((value, index) => (
                <PlayfulCard key={value.title} className="p-8 bg-white/90 hover:shadow-hard transition-all text-center group">
                  <div className="flex justify-center mb-6">
                    <IconCircle variant={value.variant} size="xl" className="group-hover:scale-110 transition-transform">
                      <value.icon className="w-8 h-8" />
                    </IconCircle>
                  </div>
                  <h3 className="font-outfit font-bold text-xl text-navy mb-4 group-hover:text-violet transition-colors">
                    {value.title}
                  </h3>
                  <p className="font-jakarta text-navy-light">
                    {value.description}
                  </p>
                </PlayfulCard>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h2 className="font-outfit font-bold text-3xl text-navy mb-12 text-center">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-navy/20"></div>
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <PlayfulCard className="p-6 bg-white/90 hover:shadow-hard transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-outfit font-bold text-2xl text-violet">{milestone.year}</span>
                      </div>
                      <h3 className="font-outfit font-bold text-lg text-navy mb-2">{milestone.title}</h3>
                      <p className="font-jakarta text-navy-light text-sm">{milestone.description}</p>
                    </PlayfulCard>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-violet border-2 border-white rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-20">
            <h2 className="font-outfit font-bold text-3xl text-navy mb-12 text-center">Leadership Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <PlayfulCard key={member.name} className="p-6 bg-white/90 hover:shadow-hard transition-all text-center group">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-navy">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-outfit font-bold text-lg text-navy mb-1 group-hover:text-violet transition-colors">
                    {member.name}
                  </h3>
                  <p className="font-jakarta text-sm text-violet font-medium mb-3">{member.role}</p>
                  <p className="font-jakarta text-navy-light text-sm mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-navy/10 text-navy text-xs rounded-full font-jakarta font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </PlayfulCard>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <PlayfulCard variant="static" className="p-12 bg-white/90">
              <div className="flex justify-center mb-6">
                <IconCircle variant="yellow" size="xl">
                  <MessageSquare className="w-8 h-8" />
                </IconCircle>
              </div>
              <h2 className="font-outfit font-bold text-3xl text-navy mb-4">
                Ready to Work Together?
              </h2>
              <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto mb-8">
                Join hundreds of companies that trust us to deliver actionable insights that drive business growth and innovation.
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
                  Contact Our Team
                </PlayfulButton>
              </div>
            </PlayfulCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
