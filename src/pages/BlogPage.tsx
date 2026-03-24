import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  TrendingUp,
  Lightbulb,
  Target,
  Award,
  MessageSquare,
  Eye,
  Heart,
  Share2,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Market Research: AI and Machine Learning',
    excerpt: 'Explore how artificial intelligence is revolutionizing market research, from predictive analytics to automated sentiment analysis.',
    content: 'Artificial intelligence and machine learning are transforming the landscape of market research...',
    author: 'Dr. Sarah Chen',
    date: '2024-03-15',
    readTime: '5 min read',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    views: 1250,
    likes: 89,
    featured: true,
  },
  {
    id: '2',
    title: 'Understanding Consumer Behavior in the Digital Age',
    excerpt: 'Learn how digital transformation has changed consumer behavior and what it means for your research strategy.',
    content: 'The digital age has fundamentally altered how consumers interact with brands...',
    author: 'Michael Rodriguez',
    date: '2024-03-12',
    readTime: '7 min read',
    category: 'Consumer Insights',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
    views: 980,
    likes: 67,
    featured: true,
  },
  {
    id: '3',
    title: 'Quantitative vs Qualitative Research: When to Use Which',
    excerpt: 'A comprehensive guide to choosing the right research methodology for your specific business needs.',
    content: 'Choosing between quantitative and qualitative research methods is crucial...',
    author: 'Emma Thompson',
    date: '2024-03-10',
    readTime: '6 min read',
    category: 'Methodology',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop',
    views: 756,
    likes: 45,
    featured: false,
  },
  {
    id: '4',
    title: 'The Power of Online Panels in Modern Research',
    excerpt: 'Discover how online research panels are providing faster, more cost-effective insights for businesses.',
    content: 'Online research panels have become an essential tool for modern market research...',
    author: 'James Wilson',
    date: '2024-03-08',
    readTime: '4 min read',
    category: 'Digital Research',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80&auto=format&fit=crop',
    views: 623,
    likes: 38,
    featured: false,
  },
  {
    id: '5',
    title: 'Global Market Trends: What to Watch in 2024',
    excerpt: 'Key market trends and insights that will shape business strategies across industries this year.',
    content: 'As we navigate through 2024, several key trends are emerging in global markets...',
    author: 'Lisa Park',
    date: '2024-03-05',
    readTime: '8 min read',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    views: 1450,
    likes: 102,
    featured: true,
  },
  {
    id: '6',
    title: 'Customer Satisfaction Metrics That Actually Matter',
    excerpt: 'Beyond NPS: Discover the customer satisfaction metrics that provide actionable insights for growth.',
    content: 'While Net Promoter Score is valuable, there are other metrics that can provide deeper insights...',
    author: 'David Kim',
    date: '2024-03-01',
    readTime: '5 min read',
    category: 'Customer Experience',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&auto=format&fit=crop',
    views: 890,
    likes: 71,
    featured: false,
  },
];

const categories = [
  'All',
  'Technology',
  'Consumer Insights',
  'Methodology',
  'Digital Research',
  'Market Trends',
  'Customer Experience',
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
            <a href="/blog" className="font-jakarta font-medium text-violet">
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
              Research Insights
              <br />
              <span className="relative inline-block">
                & Expert Analysis
              </span>
            </h1>

            <p className="font-jakarta text-xl text-navy-light max-w-3xl mx-auto mb-8">
              Stay updated with the latest trends, methodologies, and insights in market research. 
              Our experts share valuable knowledge to help you make data-driven decisions.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy/50" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-navy rounded-2xl bg-white/90 backdrop-blur-sm focus:outline-none focus:border-violet transition-colors font-jakarta"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full border-2 transition-all font-jakarta font-medium ${
                    selectedCategory === category
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-navy border-navy/30 hover:border-navy hover:shadow-hard-sm'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="font-outfit font-bold text-3xl text-navy mb-8 text-center">Featured Articles</h2>
              <div className="grid lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <PlayfulCard key={post.id} className="overflow-hidden bg-white/90 hover:shadow-hard transition-all group cursor-pointer">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4 text-sm text-navy-light">
                        <span className="font-jakarta font-medium text-violet">{post.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-outfit font-bold text-xl text-navy mb-3 group-hover:text-violet transition-colors">
                        {post.title}
                      </h3>
                      <p className="font-jakarta text-navy-light mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-navy-light">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </span>
                        </div>
                        <PlayfulButton
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/blog/${post.id}`)}
                        >
                          Read More
                        </PlayfulButton>
                      </div>
                    </div>
                  </PlayfulCard>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          <div>
            <h2 className="font-outfit font-bold text-3xl text-navy mb-8 text-center">Latest Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {regularPosts.map((post) => (
                <PlayfulCard key={post.id} className="overflow-hidden bg-white/90 hover:shadow-hard transition-all group cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
                  <div className="md:flex">
                    <div className="md:w-1/3 aspect-video md:aspect-square overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-navy-light">
                        <span className="font-jakarta font-medium text-violet">{post.category}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-outfit font-bold text-lg text-navy mb-2 group-hover:text-violet transition-colors">
                        {post.title}
                      </h3>
                      <p className="font-jakarta text-navy-light mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-navy-light">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-violet group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </PlayfulCard>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="mt-20">
            <PlayfulCard variant="static" className="p-12 bg-white/90 text-center">
              <div className="flex justify-center mb-6">
                <IconCircle variant="yellow" size="xl">
                  <MessageSquare className="w-8 h-8" />
                </IconCircle>
              </div>
              <h2 className="font-outfit font-bold text-3xl text-navy mb-4">
                Stay in the Loop
              </h2>
              <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto mb-8">
                Get the latest research insights and industry trends delivered straight to your inbox.
              </p>
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border-2 border-navy rounded-2xl focus:outline-none focus:border-violet transition-colors font-jakarta"
                />
                <PlayfulButton variant="primary" size="lg">
                  Subscribe
                </PlayfulButton>
              </div>
            </PlayfulCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
