import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  Coins,
  ClipboardList,
  Gift,
  ArrowRight,
  Star,
  Check,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Globe,
  MapPin,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  Award,
  Brain,
  Headphones,
  Building,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, FloatingIcons, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/useToast';

// Hero tabs data from Survey PanelGo with corresponding images
const heroTabs = [
  {
    id: 'insights',
    title: 'Insights',
    subtitle: 'that power your next move',
    description: 'At Survey PanelGo, we bring a rigorous approach to quantitative methodologies designed to decode complex markets and empower organizations worldwide.',
    features: ['Custom-built methodologies', 'Deep industry familiarity', 'Agile, client-first approach'],
    ctaText: 'Explore Our Services',
    stat: '300+',
    statLabel: 'Brands gained momentum with our insights',
    images: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80&auto=format&fit=crop', // business analytics
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80&auto=format&fit=crop', // data visualization
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop', // research meeting
    ]
  },
  {
    id: 'partnerships',
    title: 'Research Partnerships',
    subtitle: 'that drive impact',
    description: 'We don\'t just deliver data—we craft narratives that unlock opportunity. With Blanc, every insight is built on trust, transparency, and collaborative execution.',
    features: ['Actionable insights delivery', 'Multi-sector research coverage', 'Strategic & tactical support'],
    ctaText: 'Learn About Us',
    stat: '6M+',
    statLabel: 'Verified Global Panellists',
    images: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop', // business meeting
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80&auto=format&fit=crop', // workshop
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop', // coffee meeting
    ]
  },
  {
    id: 'decisions',
    title: 'Decisions',
    subtitle: 'shaped by lasting intelligence',
    description: 'From trend exploration to global behavioral analysis, our tools enable organizations to think forward, confidently and clearly.',
    features: ['Full-spectrum data expertise', 'Scalable research operations', 'Precision-led analytics'],
    ctaText: 'Read Our Blogs',
    stat: '100%',
    statLabel: 'Compliant with global research standards',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&auto=format&fit=crop', // team meeting
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80&auto=format&fit=crop', // analytics
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop', // rewards
    ]
  }
];

// Services type definition
interface ServiceItem {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  variant: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'white';
  id: string;
}

// Services data
const services: ServiceItem[] = [
  {
    icon: Brain,
    title: 'Qualitative Research',
    description: 'We uncover human motivations through interviews, focus groups, and deep listening—bringing context to numbers and clarity to strategy.',
    variant: 'pink' as const,
    id: 'qualitative-research',
  },
  {
    icon: BarChart3,
    title: 'Quantitative Research',
    description: 'We transform data into measurable insights through structured surveys, analytics, and segmentation across diverse demographics and regions.',
    variant: 'yellow' as const,
    id: 'quantitative-research',
  },
  {
    icon: Globe,
    title: 'Online Research',
    description: 'We conduct research using digital panels and online tools delivering faster turnarounds, broader reach, and scalable study models.',
    variant: 'green' as const,
    id: 'online-research',
  },
  {
    icon: Headphones,
    title: 'Telephone Surveys',
    description: 'Human-led voice surveys that build trust, explore sentiment, and gather nuanced responses—ideal for hard-to-reach or high-value audiences.',
    variant: 'lavender' as const,
    id: 'telephone-surveys',
  },
  {
    icon: Building,
    title: 'Business Research',
    description: 'From market mapping to competitor benchmarking, we deliver data-backed intelligence that powers strategic business and product decisions.',
    variant: 'violet' as const,
    id: 'business-research',
  },
  {
    icon: FileText,
    title: 'Other Services',
    description: 'We offer flexible research extensions, including mystery shopping, CATI/CAWI, brand audits, and hybrid studies—tailored to your unique needs.',
    variant: 'mint' as const,
    id: 'other-services',
  },
];

const features = [
  {
    icon: ClipboardList,
    title: 'Complete Surveys',
    description:
      'Answer quick surveys on tech, lifestyle, brands, and more—your voice shapes real products.',
    variant: 'pink' as const,
  },
  {
    icon: Coins,
    title: 'Earn Points',
    description: 'Every completed survey adds points to your balance. Stack them and cash in.',
    variant: 'yellow' as const,
  },
  {
    icon: Gift,
    title: 'Redeem Rewards',
    description: 'Gift cards, cash-style payouts, and prizes—your opinion has real value.',
    variant: 'green' as const,
  },
];

const stats = [
  { value: 300, label: 'Brands gained momentum', suffix: '+' },
  { value: 6, label: 'Verified Global Panellists', suffix: 'M+' },
  { value: 100, label: 'Compliance with standards', suffix: '%' },
];

// Number counting animation hook with scroll trigger
const useCountUp = (target: number, duration: number = 2000, start: boolean = true) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start) return;

    const startTime = Date.now();

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * target);
      setCount(currentCount);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(updateCount);
      }
    };

    rafRef.current = requestAnimationFrame(updateCount);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [start, target, duration]);

  return count;
};

// Custom cursor hook with optimized performance
const useCustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"], .cursor-pointer, input, textarea')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { position, isHovering };
};

/** Curated stock photos: surveys, rewards, people, data (replace anytime). */
const gallery = [
  {
    src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80&auto=format&fit=crop',
    alt: 'Team reviewing survey insights on a laptop',
    caption: 'Insights that matter',
  },
  {
    src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop',
    alt: 'Person redeeming rewards online',
    caption: 'Rewards you’ll love',
  },
  {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop',
    alt: 'Diverse group collaborating',
    caption: 'Community first',
  },
];

const storyImages = [
  {
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop',
    alt: 'Workshop and feedback session',
  },
  {
    src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80&auto=format&fit=crop',
    alt: 'Casual meeting with coffee',
  },
];

const topicTiles = [
  {
    label: 'Technology',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop',
    alt: 'Technology and gadgets',
  },
  {
    label: 'Shopping & brands',
    src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&auto=format&fit=crop',
    alt: 'Retail and shopping',
  },
  {
    label: 'Health & wellness',
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop',
    alt: 'Fitness and wellness',
  },
  {
    label: 'Food & lifestyle',
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop',
    alt: 'Food and dining',
  },
  {
    label: 'Finance',
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&auto=format&fit=crop',
    alt: 'Finance and planning',
  },
  {
    label: 'Entertainment',
    src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80&auto=format&fit=crop',
    alt: 'Movies and entertainment',
  },
];
const globalPanels = [
  { country: 'India', flag: '🇮🇳', members: '1.2M+', variant: 'yellow' as const },
  { country: 'United States', flag: '🇺🇸', members: '800K+', variant: 'pink' as const },
  { country: 'United Kingdom', flag: '🇬🇧', members: '500K+', variant: 'lavender' as const },
  { country: 'Germany', flag: '🇩🇪', members: '400K+', variant: 'periwinkle' as const },
  { country: 'Canada', flag: '🇨🇦', members: '350K+', variant: 'green' as const },
  { country: 'Australia', flag: '🇦🇺', members: '300K+', variant: 'violet' as const },
  { country: 'Singapore', flag: '🇸🇬', members: '150K+', variant: 'yellow' as const },
  { country: 'Japan', flag: '🇯🇵', members: '200K+', variant: 'pink' as const },
];

const associations = [
  { name: 'ESOMAR', src: '/Association/esomar_20250703_170634.png' },
  { name: 'Insights Platform', src: '/Association/insights-platform_20240925_181135.png' },
  { name: 'Insights Association', src: '/Association/insights_20240925_181101.png' },
  { name: 'ISO Standards', src: '/Association/iso_20240925_180912.png' },
  { name: 'MRSI Member', src: '/Association/mrsi_20250929_142210.png' },
  { name: 'MRSI Verified', src: '/Association/mrsi_20250929_172356.jpg' },
  { name: 'PAIR Research', src: '/Association/pair_20240925_181157.png' },
];

// Clients data for marquee
const clients = [
  { name: 'Team Visory', src: '/Client/Team Visory.png' },
  { name: 'Bilendi', src: '/Client/Bilendi.png' },
  { name: 'Ipsos', src: '/Client/Ipsos.png' },
  { name: 'Nimble Insight', src: '/Client/Nimble Insight.png' },
  { name: 'Zamplia', src: '/Client/Zamplia.png' },
  { name: 'Logit', src: '/Client/Logit.png' },
  { name: 'Globalsurvey', src: '/Client/Globalsurvey.png' },
];

const perks = [
  { icon: Shield, title: 'Privacy-first', text: 'Your data is handled with care.' },
  { icon: Zap, title: 'Fast payouts', text: 'Redeem when you’re ready.' },
  { icon: Heart, title: 'Made for you', text: 'Surveys matched to your profile.' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const partnerStrip = [...associations, ...associations];
  const clientsStrip = [...clients, ...clients];
  const [activeTab, setActiveTab] = useState(0);
  const { position, isHovering } = useCustomCursor();
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stats section visibility state for scroll-triggered animation
  const [statsVisible, setStatsVisible] = useState(false);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }

    return () => observer.disconnect();
  }, [statsVisible]);

  // Stats counts with scroll trigger
  const statCount1 = useCountUp(300, 2500, statsVisible);
  const statCount2 = useCountUp(6, 2500, statsVisible);
  const statCount3 = useCountUp(100, 2500, statsVisible);
  const statCounts = [statCount1, statCount2, statCount3];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoSliding) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % heroTabs.length);
    }, 4000); // Change tab every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoSliding]);

  // Pause auto-slide on user interaction
  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setIsAutoSliding(false);
    // Resume auto-slide after 10 seconds of inactivity
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    query: '',
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const templateParams = {
        from_name: contactForm.name,
        from_email: contactForm.email,
        phone_number: contactForm.phone,
        message: contactForm.query,
        to_name: 'Survey Panel Go Team',
      };

      await emailjs.send(
        'service_p06p7hf',
        'template_gu34p8h',
        templateParams,
        'eAJLF5uxWtHVtQgGX'
      );

      addToast('Thanks! We have received your message and will get back to you soon.', 'success');
      setContactForm({
        name: '',
        email: '',
        phone: '',
        query: '',
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      addToast('Failed to send message. Please try again later or email us directly.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      {/* Custom Cursor - Optimized */}
      <div
        className="fixed w-8 h-8 border-2 border-navy rounded-full pointer-events-none z-50 transition-transform duration-150 ease-out mix-blend-difference cursor-optimized"
        style={{
          left: position.x - 16,
          top: position.y - 16,
          transform: isHovering ? 'scale(1.3)' : 'scale(1)',
        }}
      />
      <div
        className="fixed w-2 h-2 bg-navy rounded-full pointer-events-none z-50 transition-transform duration-75 ease-out cursor-optimized"
        style={{
          left: position.x - 4,
          top: position.y - 4,
        }}
      />

      <DotGrid className="fixed inset-0" />

      <DecorativeBlob variant="pink" size="lg" className="left-[10%] top-[15%] opacity-60" />
      <DecorativeBlob variant="yellow" size="md" className="right-[15%] top-[20%] opacity-60" />
      <DecorativeBlob variant="green" size="lg" className="right-[10%] bottom-[20%] opacity-60" />
      <DecorativeBlob variant="lavender" size="md" className="left-[15%] bottom-[15%] opacity-60" />

      <FloatingIcons count={8} />

      {/* Navigation */}
      <nav className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/70 backdrop-blur-md border-b-2 border-navy/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 min-w-0 text-left -ml-1 sm:-ml-0"
            aria-label="Survey Panel Go home"
          >
            <BrandLogo size="nav" className="shrink-0 drop-shadow-sm" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              How it works
            </a>
            <a href="#services" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Services
            </a>
            <a href="#industries" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Industries
            </a>
            <a href="#gallery" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Insights
            </a>
            <a href="#topics" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Topics
            </a>
            <a href="#partners" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Associations
            </a>
            <a href="#global" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Throughout Global
            </a>
            <a href="#contact" className="font-jakarta font-medium text-navy hover:text-violet transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <PlayfulButton variant="secondary" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </PlayfulButton>
            <PlayfulButton variant="primary" size="sm" onClick={() => navigate('/auth?mode=signup')}>
              Join Our Panel
            </PlayfulButton>
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
              <a href="#features" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                How it works
              </a>
              <a href="#services" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Services
              </a>
              <a href="#industries" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Industries
              </a>
              <a href="#gallery" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Insights
              </a>
              <a href="#topics" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Topics
              </a>
              <a href="#partners" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Associations
              </a>
              <a href="#global" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Throughout Global
              </a>
              <a href="#contact" className="font-jakarta font-medium text-navy hover:text-violet transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-navy/10">
                <PlayfulButton variant="secondary" size="sm" onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}>
                  Sign In
                </PlayfulButton>
                <PlayfulButton variant="primary" size="sm" onClick={() => { navigate('/auth?mode=signup'); setIsMobileMenuOpen(false); }}>
                  Join Our Panel
                </PlayfulButton>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero with Multi-tab Content */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation with Auto-slide Indicators */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {heroTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(index)}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all duration-300 font-outfit font-semibold ${activeTab === index
                    ? 'bg-navy text-white border-navy shadow-hard scale-105'
                    : 'bg-white text-navy border-navy/30 hover:border-navy hover:shadow-hard-sm'
                    } cursor-pointer`}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {heroTabs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeTab === index
                    ? 'bg-navy w-8'
                    : 'bg-navy/30 hover:bg-navy/50'
                    }`}
                  aria-label={`Go to ${heroTabs[index].title} tab`}
                />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-navy rounded-pill shadow-hard-sm mx-auto lg:mx-0">
                <IconCircle variant="yellow" size="sm">
                  <Sparkles className="w-4 h-4" />
                </IconCircle>
                <span className="font-mono text-xs font-bold text-navy tracking-wide">
                  WHERE STRATEGY MEETS CLARITY
                </span>
              </div>

              {/* Animated Content Switching */}
              <div className="relative overflow-hidden min-h-[120px] sm:min-h-0">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeTab * 100}%)` }}
                >
                  {heroTabs.map((tab) => (
                    <div key={tab.id} className="w-full flex-shrink-0">
                      <h1 className="font-outfit font-extrabold text-3xl sm:text-5xl lg:text-6xl text-navy leading-[1.2] sm:leading-[1.1]">
                        {tab.title}{' '}
                        <span className="relative inline-block">
                          {tab.subtitle}
                        </span>
                      </h1>
                    </div>
                  ))}
                </div>
              </div>

              {/* Animated Description */}
              <div className="relative overflow-hidden h-auto sm:h-16">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeTab * 100}%)` }}
                >
                  {heroTabs.map((tab) => (
                    <div key={tab.id} className="w-full flex-shrink-0">
                      <p className="font-jakarta text-base sm:text-lg text-navy-light max-w-xl mx-auto lg:mx-0">
                        {tab.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Animated Features */}
              <div className="space-y-3">
                {heroTabs[activeTab].features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 opacity-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-5 h-5 bg-green border-2 border-navy rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-navy" />
                    </div>
                    <span className="font-jakarta text-sm text-navy">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <PlayfulButton
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => {
                    if (activeTab === 0) {
                      navigate('/services');
                    } else if (activeTab === 1) {
                      navigate('/about');
                    } else if (activeTab === 2) {
                      navigate('/blog');
                    }
                  }}
                >
                  {heroTabs[activeTab].ctaText}
                </PlayfulButton>
              </div>

              <p className="font-jakarta text-sm text-navy-light">Free to join • No credit card • Fair rewards</p>
            </div>

            <div className="relative order-1 lg:order-2">
              {/* Animated Stat Card */}
              <div className="absolute -bottom-2 -left-2 sm:left-4 bg-yellow border-2 border-navy rounded-2xl px-4 py-3 shadow-hard animate-float z-10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-navy" />
                  <div>
                    <p className="font-mono text-xs text-navy/80">Growing strong</p>
                    <p className="font-outfit font-bold text-navy">
                      300+ Brands
                    </p>
                  </div>
                </div>
              </div>

              {/* Animated Image Grid - Changes with tabs */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-10">
                    <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard rotate-[-2deg] bg-white transition-all duration-500">
                      <img
                        key={heroTabs[activeTab].images[0]} // Key for re-render animation
                        src={heroTabs[activeTab].images[0]}
                        alt="Research analytics"
                        className="w-full h-40 sm:h-48 object-cover image-transition"
                        loading="eager"
                      />
                    </div>
                    <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard rotate-[1deg] bg-white transition-all duration-500">
                      <img
                        key={heroTabs[activeTab].images[1]} // Key for re-render animation
                        src={heroTabs[activeTab].images[1]}
                        alt="Team collaboration"
                        className="w-full h-32 sm:h-40 object-cover image-transition"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard rotate-[2deg] bg-white transition-all duration-500">
                      <img
                        key={heroTabs[activeTab].images[2]} // Key for re-render animation
                        src={heroTabs[activeTab].images[2]}
                        alt="Business insights"
                        className="w-full h-36 sm:h-44 object-cover image-transition"
                        loading="lazy"
                      />
                    </div>
                    <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard rotate-[-1deg] bg-pink/30 transition-all duration-500">
                      <img
                        src={gallery[2].src}
                        alt={gallery[2].alt}
                        className="w-full h-40 sm:h-52 object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section - Right after hero */}
      <section ref={statsSectionRef} className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 bg-white/60 backdrop-blur-sm border-y-2 border-navy/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`opacity-0 translate-y-8 ${statsVisible ? 'animate-fadeSlideUp' : ''
                  }`}
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                <PlayfulCard variant="static" className="p-8 text-center bg-white/90 hover:shadow-hard transition-all cursor-pointer group h-full">
                  <div className="flex justify-center mb-4">
                    <IconCircle variant={index === 0 ? 'yellow' : index === 1 ? 'pink' : 'green'} size="lg" className="group-hover:scale-110 transition-transform">
                      {index === 0 ? <TrendingUp className="w-6 h-6" /> : index === 1 ? <Users className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                    </IconCircle>
                  </div>
                  <p className="font-outfit font-extrabold text-4xl text-violet mb-2 tabular-nums">
                    {statCounts[index]}{stat.suffix}
                  </p>
                  <p className="font-jakarta text-sm text-navy-light font-medium">{stat.label}</p>
                </PlayfulCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-16 sm:py-20 bg-gradient-to-b from-white/80 to-periwinkle border-y-2 border-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-3">Research solutions built for impact</h2>
            <p className="font-jakarta text-navy-light max-w-2xl mx-auto">
              We deliver research-driven solutions that move business forward.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <PlayfulCard
                key={service.title}
                className="p-6 text-center h-full group hover:shadow-hard transition-all cursor-pointer"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <div className="flex justify-center mb-6">
                  <IconCircle variant={service.variant} size="xl">
                    <service.icon className="w-8 h-8" />
                  </IconCircle>
                </div>
                <h3 className="font-outfit font-bold text-xl text-navy mb-3 group-hover:text-violet transition-colors">
                  {service.title}
                </h3>
                <p className="font-jakarta text-navy-light">{service.description}</p>
                <div className="mt-4">
                  <ArrowRight className="w-5 h-5 text-violet mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </PlayfulCard>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-3">Industries we serve deeply</h2>
            <p className="font-jakarta text-navy-light max-w-2xl mx-auto">
              We support smarter decisions through research built to adapt across industries and evolving business needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              'Financial Services',
              'Advanced Manufacturing',
              'Automotive and Mobility',
              'Energy and Natural Resources',
              'Retail and Ecommerce',
              'Health care and Insurance',
              'Social and Public Sectors',
              'Digital Media and Entertainment',
              'Technology and Electronics',
            ].map((industry) => (
              <div
                key={industry}
                className="group relative p-4 bg-white border-2 border-navy rounded-2xl shadow-hard-sm hover:shadow-hard hover:-translate-y-1 transition-all cursor-pointer"
              >
                <h4 className="font-outfit font-bold text-navy text-sm text-center group-hover:text-violet transition-colors">
                  {industry}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section id="gallery" className="relative z-10 py-12 sm:py-16 border-y-2 border-navy/10 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-3">Powering insights that drive action</h2>
            <p className="font-jakarta text-navy-light">
              Real-world behavior signals, data validated at every layer, and insights that drive measurable impact.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <PlayfulCard key={item.caption} variant="static" className="overflow-hidden p-0 border-2 border-navy">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.src} alt={item.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4 bg-white border-t-2 border-navy">
                  <p className="font-outfit font-bold text-navy">{item.caption}</p>
                </div>
              </PlayfulCard>
            ))}
          </div>
        </div>
      </section>

      {/* Story + perks */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard-lg col-span-2 sm:col-span-1 sm:row-span-2">
              <img src={storyImages[1].src} alt={storyImages[1].alt} className="w-full h-full min-h-[220px] object-cover" loading="lazy" />
            </div>
            <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard bg-lavender/40 p-4 flex flex-col justify-center">
              <p className="font-outfit font-bold text-xl text-navy mb-2">Your time is valuable</p>
              <p className="font-jakarta text-sm text-navy-light">
                We match you with surveys that fit your interests—so every minute feels worthwhile.
              </p>
            </div>
            <div className="rounded-3xl border-2 border-navy overflow-hidden shadow-hard">
              <img src={storyImages[0].src} alt={storyImages[0].alt} className="w-full h-36 object-cover" loading="lazy" />
            </div>
          </div>
          <div>
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-4">Where strategy meets clarity</h2>
            <p className="font-jakarta text-navy-light mb-8">
              At Blanc, we deliver research that fits your reality - custom-built, analyst-backed, and designed to scale with you. Whether you're testing ideas, entering new markets, or optimizing performance, we help you move forward with confidence.
            </p>
            <ul className="space-y-4">
              {[
                { icon: Target, title: 'Real-world behavior signals', text: 'We blend survey, location, and digital data to understand what people think, do, and experience.' },
                { icon: Shield, title: 'Data validated at every layer', text: 'Our multi-step quality process ensures that what you see is clean, verified, and ready for confident use.' },
                { icon: TrendingUp, title: 'Insights that drive measurable impact', text: 'Every project is built to inform real decisions, spark action, and deliver clear business outcomes.' },
              ].map((item) => (
                <li key={item.title} className="flex gap-4 items-start">
                  <IconCircle variant="violet" size="md">
                    <item.icon className="w-5 h-5" />
                  </IconCircle>
                  <div>
                    <p className="font-outfit font-bold text-navy">{item.title}</p>
                    <p className="font-jakarta text-sm text-navy-light">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="relative z-10 py-16 sm:py-20 bg-gradient-to-b from-periwinkle to-white/80 border-y-2 border-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-3">Topics we cover</h2>
            <p className="font-jakarta text-navy-light max-w-2xl mx-auto">
              From gadgets to groceries—share what you think and unlock rewards across categories.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {topicTiles.map((t) => (
              <div
                key={t.label}
                className="group relative rounded-2xl border-2 border-navy overflow-hidden shadow-hard-sm hover:shadow-hard hover:-translate-y-1 transition-all bg-white"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={t.src} alt={t.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-navy/85 text-white px-2 py-2 text-center">
                  <span className="font-jakarta font-semibold text-xs sm:text-sm">{t.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-3">How it works</h2>
            <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto">
              Three simple steps from signup to your first reward.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <PlayfulCard key={feature.title} className="p-6 md:p-8 text-center h-full">
                <div className="flex justify-center mb-6">
                  <IconCircle variant={feature.variant} size="xl">
                    <feature.icon className="w-8 h-8" />
                  </IconCircle>
                </div>
                <h3 className="font-outfit font-bold text-xl text-navy mb-3">{feature.title}</h3>
                <p className="font-jakarta text-navy-light">{feature.description}</p>
              </PlayfulCard>
            ))}
          </div>

        </div>
      </section>

      {/* Global Panelists */}
      <section id="global" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-white/40 border-y-2 border-navy/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-lavender/30 border-2 border-navy rounded-pill">
                <Globe className="w-5 h-5 text-violet" />
                <span className="font-outfit font-bold text-sm text-navy uppercase tracking-wider">Throughout Global</span>
              </div>
              <h2 className="font-outfit font-bold text-4xl md:text-5xl text-navy leading-tight">
                Empowering Voices <br />
                <span className="text-violet">Across 50+ Countries</span>
              </h2>
              <p className="font-jakarta text-lg text-navy-light max-w-xl">
                We bridge the gap between global brands and local people. Our verified panelist network provides high-quality data across diverse cultures and markets.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-1">
                  <p className="font-outfit font-bold text-3xl text-navy">15M+</p>
                  <p className="font-jakarta text-sm text-navy-light uppercase tracking-wide">Potential Reach</p>
                </div>
                <div className="space-y-1">
                  <p className="font-outfit font-bold text-3xl text-navy">50+</p>
                  <p className="font-jakarta text-sm text-navy-light uppercase tracking-wide">Regions Linked</p>
                </div>
                <div className="space-y-1">
                  <p className="font-outfit font-bold text-3xl text-navy">24/7</p>
                  <p className="font-jakarta text-sm text-navy-light uppercase tracking-wide">Flow Active</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {globalPanels.map((panel) => (
                <div
                  key={panel.country}
                  className="group relative p-4 bg-white border-2 border-navy rounded-2xl shadow-hard-sm hover:shadow-hard transition-all -rotate-1 odd:rotate-1 cursor-pointer"
                  onClick={() => {
                    const countryKey = panel.country.toLowerCase().replace(/\s+/g, '-');
                    console.log('Country clicked:', panel.country, 'URL:', `/country/${countryKey}`);
                    navigate(`/country/${countryKey}`);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl filter saturate-150 drop-shadow-sm">{panel.flag}</span>
                    <MapPin className="w-4 h-4 text-navy-light group-hover:text-pink transition-colors" />
                  </div>
                  <h4 className="font-outfit font-bold text-navy truncate">{panel.country}</h4>
                  <p className="font-mono text-[10px] text-navy-light uppercase tracking-wider mt-1">
                    {panel.members} panelists
                  </p>
                </div>
              ))}
              <div className="p-4 bg-violet text-white border-2 border-navy rounded-2xl shadow-hard-sm flex flex-col items-center justify-center text-center">
                <p className="font-outfit font-bold text-lg leading-tight">And many more ...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Associations — infinite marquee */}
      <section id="partners" className="relative z-10 py-14 sm:py-16 overflow-hidden border-y-2 border-navy/10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <IconCircle variant="lavender" size="lg">
              <Star className="w-7 h-7" />
            </IconCircle>
          </div>
          <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-navy">Our Associations</h2>
          <p className="font-jakarta text-navy-light mt-2 max-w-xl mx-auto text-sm sm:text-base">
            We are proud members and partners of global research organizations and quality councils, ensuring the highest standards of data integrity.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-periwinkle via-periwinkle/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-periwinkle via-periwinkle/80 to-transparent" />

          <div className="flex w-max animate-marquee gap-10 sm:gap-14 py-4">
            {partnerStrip.map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex-shrink-0 flex items-center justify-center h-28 sm:h-36 px-10 sm:px-16 py-6 sm:py-8 rounded-3xl border-2 border-navy bg-white shadow-hard-sm hover:shadow-hard transition-all group"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="h-full w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Clients — infinite marquee */}
      <section id="clients" className="relative z-10 py-14 sm:py-16 overflow-hidden border-y-2 border-navy/10 bg-gradient-to-br from-violet/10 via-pink/5 to-yellow/10">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <IconCircle variant="green" size="lg">
              <Users className="w-7 h-7" />
            </IconCircle>
          </div>
          <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-navy">Trusted by Industry Leaders</h2>
          <p className="font-jakarta text-navy-light mt-2 max-w-xl mx-auto text-sm sm:text-base">
            We partner with the world's most innovative research firms and technology companies to deliver exceptional insights.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-periwinkle via-periwinkle/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-periwinkle via-periwinkle/80 to-transparent" />

          <div className="flex w-max animate-marquee gap-8 sm:gap-12 py-4">
            {clientsStrip.map((client, i) => (
              <div
                key={`${client.name}-${i}`}
                className="flex-shrink-0 flex items-center justify-center h-32 sm:h-40 w-40 sm:w-48 px-6 sm:px-8 py-4 sm:py-6 rounded-2xl border-2 border-navy bg-white shadow-hard-sm hover:shadow-hard hover:scale-105 transition-all group"
              >
                <img
                  src={client.src}
                  alt={client.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section id="contact" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 bg-white/40 backdrop-blur-sm border-y-2 border-navy/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="font-outfit font-bold text-3xl md:text-5xl text-navy mb-6">Get in touch</h2>
                <p className="font-jakarta text-lg text-navy-light">
                  Have questions about surveys, rewards, or your account? Our friendly team is here to help you get the
                  most out of Survey Panel Go.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Mail, variant: 'violet' as const, title: 'Email us', text: 'sales@surveypanelgo.com' },
                  { icon: Phone, variant: 'green' as const, title: 'Call us', text: '+91 97111 08615' },
                  {
                    icon: MessageSquare,
                    variant: 'yellow' as const,
                    title: 'Live Chat',
                    text: 'Available 24/7 in your dashboard',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 items-center">
                    <IconCircle variant={item.variant} size="md">
                      <item.icon className="w-5 h-5" />
                    </IconCircle>
                    <div>
                      <p className="font-outfit font-bold text-navy">{item.title}</p>
                      <p className="font-jakarta text-sm text-navy-light">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PlayfulCard className="p-8 border-2 border-navy">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-outfit font-semibold text-sm text-navy block">Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-outfit font-semibold text-sm text-navy block">Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="Email address"
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-outfit font-semibold text-sm text-navy block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-outfit font-semibold text-sm text-navy block">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.query}
                    onChange={(e) => setContactForm({ ...contactForm, query: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all resize-none"
                  ></textarea>
                </div>

                <PlayfulButton
                  variant="primary"
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                  rightIcon={isSubmitting ? null : <Send className="w-5 h-5" />}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </PlayfulButton>
              </form>
            </PlayfulCard>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <PlayfulCard className="p-8 md:p-12 text-center bg-gradient-to-br from-violet/15 via-pink/10 to-yellow/15 border-2 border-navy">
            <div className="flex justify-center mb-6">
              <BrandLogo size="lg" className="mx-auto" />
            </div>
            <h2 className="font-outfit font-bold text-3xl md:text-4xl text-navy mb-4">Ready when you are</h2>
            <p className="font-jakarta text-lg text-navy-light mb-8 max-w-xl mx-auto">
              Create your free account and start turning opinions into rewards today.
            </p>
            <PlayfulButton
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/auth')}
            >
              Get started free
            </PlayfulButton>
          </PlayfulCard>
        </div>
      </section>

      {/* Footer + credits */}
      <Footer />
    </div>
  );
};

export default LandingPage;
