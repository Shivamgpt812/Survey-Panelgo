import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Target,
  MapPin,
  Calendar,
  Heart,
  BarChart3,
  Map,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Footer from '@/components/layout/Footer';

interface CountryData {
  country: string;
  flag: string;
  members: string;
  variant: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'white';
  totalPanelists: number;
  demographics: {
    ageGroups: Array<{ range: string; percentage: number; count: string }>;
    gender: Array<{ type: string; percentage: number; count: string }>;
    race: Array<{ type: string; percentage: number; count: string }>;
    education: Array<{ level: string; percentage: number; count: string }>;
    income: Array<{ range: string; percentage: number; count: string }>;
  };
  industries: Array<{
    industry: string;
    percentage: number;
    count: string;
    trend: 'growing' | 'stable' | 'declining';
  }>;
  regions: Array<{
    region: string;
    percentage: number;
    count: string;
    majorCities: string[];
  }>;
  engagement: {
    avgSurveysPerMonth: number;
    completionRate: number;
    satisfactionScore: number;
    retentionRate: number;
  };
}

const countryData: Record<string, CountryData> = {
  'India': {
    country: 'India',
    flag: '🇮🇳',
    members: '1.2M+',
    variant: 'yellow' as const,
    totalPanelists: 1200000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 28, count: '336K' },
        { range: '25-34', percentage: 32, count: '384K' },
        { range: '35-44', percentage: 22, count: '264K' },
        { range: '45-54', percentage: 12, count: '144K' },
        { range: '55+', percentage: 6, count: '72K' },
      ],
      gender: [
        { type: 'Male', percentage: 58, count: '696K' },
        { type: 'Female', percentage: 42, count: '504K' },
      ],
      race: [
        { type: 'South Asian', percentage: 85, count: '1.02M' },
        { type: 'Other', percentage: 15, count: '180K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 35, count: '420K' },
        { level: 'Undergraduate', percentage: 45, count: '540K' },
        { level: 'High School', percentage: 20, count: '240K' },
      ],
      income: [
        { range: '₹0-2L', percentage: 25, count: '300K' },
        { range: '₹2L-5L', percentage: 40, count: '480K' },
        { range: '₹5L-10L', percentage: 25, count: '300K' },
        { range: '₹10L+', percentage: 10, count: '120K' },
      ],
    },
    industries: [
      { industry: 'Technology', percentage: 28, count: '336K', trend: 'growing' },
      { industry: 'Healthcare', percentage: 15, count: '180K', trend: 'stable' },
      { industry: 'Education', percentage: 12, count: '144K', trend: 'growing' },
      { industry: 'Retail', percentage: 10, count: '120K', trend: 'stable' },
      { industry: 'Finance', percentage: 8, count: '96K', trend: 'growing' },
      { industry: 'Manufacturing', percentage: 7, count: '84K', trend: 'declining' },
      { industry: 'Other', percentage: 20, count: '240K', trend: 'stable' },
    ],
    regions: [
      { region: 'North India', percentage: 35, count: '420K', majorCities: ['Delhi', 'Chandigarh', 'Lucknow'] },
      { region: 'South India', percentage: 25, count: '300K', majorCities: ['Bangalore', 'Chennai', 'Hyderabad'] },
      { region: 'East India', percentage: 20, count: '240K', majorCities: ['Kolkata', 'Bhubaneswar', 'Guwahati'] },
      { region: 'West India', percentage: 20, count: '240K', majorCities: ['Mumbai', 'Pune', 'Ahmedabad'] },
    ],
    engagement: {
      avgSurveysPerMonth: 8.5,
      completionRate: 78,
      satisfactionScore: 4.2,
      retentionRate: 85,
    },
  },
  'United States': {
    country: 'United States',
    flag: '🇺🇸',
    members: '800K+',
    variant: 'pink' as const,
    totalPanelists: 800000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 22, count: '176K' },
        { range: '25-34', percentage: 28, count: '224K' },
        { range: '35-44', percentage: 25, count: '200K' },
        { range: '45-54', percentage: 15, count: '120K' },
        { range: '55+', percentage: 10, count: '80K' },
      ],
      gender: [
        { type: 'Male', percentage: 48, count: '384K' },
        { type: 'Female', percentage: 52, count: '416K' },
      ],
      race: [
        { type: 'White', percentage: 60, count: '480K' },
        { type: 'Hispanic', percentage: 18, count: '144K' },
        { type: 'Black', percentage: 12, count: '96K' },
        { type: 'Asian', percentage: 8, count: '64K' },
        { type: 'Other', percentage: 2, count: '16K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 40, count: '320K' },
        { level: 'Undergraduate', percentage: 35, count: '280K' },
        { level: 'High School', percentage: 25, count: '200K' },
      ],
      income: [
        { range: '$0-35K', percentage: 30, count: '240K' },
        { range: '$35K-75K', percentage: 35, count: '280K' },
        { range: '$75K-150K', percentage: 25, count: '200K' },
        { range: '$150K+', percentage: 10, count: '80K' },
      ],
    },
    industries: [
      { industry: 'Technology', percentage: 25, count: '200K', trend: 'growing' },
      { industry: 'Healthcare', percentage: 18, count: '144K', trend: 'stable' },
      { industry: 'Finance', percentage: 15, count: '120K', trend: 'growing' },
      { industry: 'Retail', percentage: 12, count: '96K', trend: 'stable' },
      { industry: 'Education', percentage: 10, count: '80K', trend: 'stable' },
      { industry: 'Manufacturing', percentage: 8, count: '64K', trend: 'declining' },
      { industry: 'Other', percentage: 12, count: '96K', trend: 'stable' },
    ],
    regions: [
      { region: 'West Coast', percentage: 30, count: '240K', majorCities: ['Los Angeles', 'San Francisco', 'Seattle'] },
      { region: 'East Coast', percentage: 25, count: '200K', majorCities: ['New York', 'Boston', 'Washington DC'] },
      { region: 'Midwest', percentage: 20, count: '160K', majorCities: ['Chicago', 'Detroit', 'Minneapolis'] },
      { region: 'South', percentage: 15, count: '120K', majorCities: ['Atlanta', 'Dallas', 'Houston'] },
      { region: 'Mountain', percentage: 10, count: '80K', majorCities: ['Denver', 'Phoenix', 'Salt Lake City'] },
    ],
    engagement: {
      avgSurveysPerMonth: 6.2,
      completionRate: 82,
      satisfactionScore: 4.5,
      retentionRate: 88,
    },
  },
  'United Kingdom': {
    country: 'United Kingdom',
    flag: '🇬🇧',
    members: '500K+',
    variant: 'lavender' as const,
    totalPanelists: 500000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 18, count: '90K' },
        { range: '25-34', percentage: 25, count: '125K' },
        { range: '35-44', percentage: 28, count: '140K' },
        { range: '45-54', percentage: 20, count: '100K' },
        { range: '55+', percentage: 9, count: '45K' },
      ],
      gender: [
        { type: 'Male', percentage: 49, count: '245K' },
        { type: 'Female', percentage: 51, count: '255K' },
      ],
      race: [
        { type: 'White', percentage: 85, count: '425K' },
        { type: 'Asian', percentage: 8, count: '40K' },
        { type: 'Black', percentage: 4, count: '20K' },
        { type: 'Other', percentage: 3, count: '15K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 45, count: '225K' },
        { level: 'Undergraduate', percentage: 35, count: '175K' },
        { level: 'High School', percentage: 20, count: '100K' },
      ],
      income: [
        { range: '£0-25K', percentage: 20, count: '100K' },
        { range: '£25K-50K', percentage: 35, count: '175K' },
        { range: '£50K-75K', percentage: 30, count: '150K' },
        { range: '£75K+', percentage: 15, count: '75K' },
      ],
    },
    industries: [
      { industry: 'Finance', percentage: 22, count: '110K', trend: 'stable' },
      { industry: 'Technology', percentage: 18, count: '90K', trend: 'growing' },
      { industry: 'Healthcare', percentage: 15, count: '75K', trend: 'stable' },
      { industry: 'Retail', percentage: 12, count: '60K', trend: 'stable' },
      { industry: 'Education', percentage: 10, count: '50K', trend: 'stable' },
      { industry: 'Manufacturing', percentage: 8, count: '40K', trend: 'declining' },
      { industry: 'Other', percentage: 15, count: '75K', trend: 'stable' },
    ],
    regions: [
      { region: 'England', percentage: 75, count: '375K', majorCities: ['London', 'Manchester', 'Birmingham'] },
      { region: 'Scotland', percentage: 10, count: '50K', majorCities: ['Edinburgh', 'Glasgow'] },
      { region: 'Wales', percentage: 5, count: '25K', majorCities: ['Cardiff', 'Swansea'] },
      { region: 'Northern Ireland', percentage: 10, count: '50K', majorCities: ['Belfast', 'Derry'] },
    ],
    engagement: {
      avgSurveysPerMonth: 7.8,
      completionRate: 85,
      satisfactionScore: 4.3,
      retentionRate: 90,
    },
  },
  'Germany': {
    country: 'Germany',
    flag: '🇩🇪',
    members: '400K+',
    variant: 'lavender' as const,
    totalPanelists: 400000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 15, count: '60K' },
        { range: '25-34', percentage: 22, count: '88K' },
        { range: '35-44', percentage: 30, count: '120K' },
        { range: '45-54', percentage: 23, count: '92K' },
        { range: '55+', percentage: 10, count: '40K' },
      ],
      gender: [
        { type: 'Male', percentage: 51, count: '204K' },
        { type: 'Female', percentage: 49, count: '196K' },
      ],
      race: [
        { type: 'German', percentage: 88, count: '352K' },
        { type: 'Turkish', percentage: 3, count: '12K' },
        { type: 'Polish', percentage: 2, count: '8K' },
        { type: 'Other', percentage: 7, count: '28K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 42, count: '168K' },
        { level: 'Undergraduate', percentage: 38, count: '152K' },
        { level: 'High School', percentage: 20, count: '80K' },
      ],
      income: [
        { range: '€0-30K', percentage: 18, count: '72K' },
        { range: '€30K-60K', percentage: 32, count: '128K' },
        { range: '€60K-90K', percentage: 30, count: '120K' },
        { range: '€90K+', percentage: 20, count: '80K' },
      ],
    },
    industries: [
      { industry: 'Manufacturing', percentage: 25, count: '100K', trend: 'stable' },
      { industry: 'Technology', percentage: 20, count: '80K', trend: 'growing' },
      { industry: 'Automotive', percentage: 15, count: '60K', trend: 'stable' },
      { industry: 'Finance', percentage: 12, count: '48K', trend: 'growing' },
      { industry: 'Healthcare', percentage: 10, count: '40K', trend: 'stable' },
      { industry: 'Other', percentage: 18, count: '72K', trend: 'stable' },
    ],
    regions: [
      { region: 'North', percentage: 25, count: '100K', majorCities: ['Berlin', 'Hamburg', 'Bremen'] },
      { region: 'South', percentage: 20, count: '80K', majorCities: ['Munich', 'Stuttgart', 'Nuremberg'] },
      { region: 'East', percentage: 30, count: '120K', majorCities: ['Frankfurt', 'Leipzig', 'Dresden'] },
      { region: 'West', percentage: 25, count: '100K', majorCities: ['Cologne', 'Düsseldorf', 'Dortmund'] },
    ],
    engagement: {
      avgSurveysPerMonth: 8.2,
      completionRate: 88,
      satisfactionScore: 4.6,
      retentionRate: 92,
    },
  },
  'Canada': {
    country: 'Canada',
    flag: '🇨🇦',
    members: '350K+',
    variant: 'green' as const,
    totalPanelists: 350000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 20, count: '70K' },
        { range: '25-34', percentage: 26, count: '91K' },
        { range: '35-44', percentage: 28, count: '98K' },
        { range: '45-54', percentage: 18, count: '63K' },
        { range: '55+', percentage: 8, count: '28K' },
      ],
      gender: [
        { type: 'Male', percentage: 49, count: '171.5K' },
        { type: 'Female', percentage: 51, count: '178.5K' },
      ],
      race: [
        { type: 'White', percentage: 70, count: '245K' },
        { type: 'Asian', percentage: 15, count: '52.5K' },
        { type: 'Black', percentage: 5, count: '17.5K' },
        { type: 'Indigenous', percentage: 4, count: '14K' },
        { type: 'Other', percentage: 6, count: '21K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 38, count: '133K' },
        { level: 'Undergraduate', percentage: 42, count: '147K' },
        { level: 'High School', percentage: 20, count: '70K' },
      ],
      income: [
        { range: 'C$0-40K', percentage: 25, count: '87.5K' },
        { range: 'C$40K-80K', percentage: 35, count: '122.5K' },
        { range: 'C$80K-120K', percentage: 25, count: '87.5K' },
        { range: 'C$120K+', percentage: 15, count: '52.5K' },
      ],
    },
    industries: [
      { industry: 'Technology', percentage: 18, count: '63K', trend: 'growing' },
      { industry: 'Finance', percentage: 15, count: '52.5K', trend: 'stable' },
      { industry: 'Healthcare', percentage: 12, count: '42K', trend: 'stable' },
      { industry: 'Retail', percentage: 10, count: '35K', trend: 'stable' },
      { industry: 'Manufacturing', percentage: 8, count: '28K', trend: 'declining' },
      { industry: 'Other', percentage: 37, count: '129.5K', trend: 'stable' },
    ],
    regions: [
      { region: 'Ontario', percentage: 40, count: '140K', majorCities: ['Toronto', 'Ottawa', 'Hamilton'] },
      { region: 'Quebec', percentage: 25, count: '87.5K', majorCities: ['Montreal', 'Quebec City', 'Laval'] },
      { region: 'British Columbia', percentage: 20, count: '70K', majorCities: ['Vancouver', 'Victoria', 'Surrey'] },
      { region: 'Prairies', percentage: 10, count: '35K', majorCities: ['Calgary', 'Edmonton', 'Winnipeg'] },
      { region: 'Atlantic', percentage: 5, count: '17.5K', majorCities: ['Halifax', 'St. John\'s', 'Charlottetown'] },
    ],
    engagement: {
      avgSurveysPerMonth: 7.5,
      completionRate: 84,
      satisfactionScore: 4.4,
      retentionRate: 89,
    },
  },
  'Australia': {
    country: 'Australia',
    flag: '🇦🇺',
    members: '300K+',
    variant: 'violet' as const,
    totalPanelists: 300000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 18, count: '54K' },
        { range: '25-34', percentage: 25, count: '75K' },
        { range: '35-44', percentage: 30, count: '90K' },
        { range: '45-54', percentage: 20, count: '60K' },
        { range: '55+', percentage: 7, count: '21K' },
      ],
      gender: [
        { type: 'Male', percentage: 50, count: '150K' },
        { type: 'Female', percentage: 50, count: '150K' },
      ],
      race: [
        { type: 'White', percentage: 75, count: '225K' },
        { type: 'Asian', percentage: 12, count: '36K' },
        { type: 'Indigenous', percentage: 3, count: '9K' },
        { type: 'Other', percentage: 10, count: '30K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 35, count: '105K' },
        { level: 'Undergraduate', percentage: 40, count: '120K' },
        { level: 'High School', percentage: 25, count: '75K' },
      ],
      income: [
        { range: 'A$0-50K', percentage: 22, count: '66K' },
        { range: 'A$50K-100K', percentage: 35, count: '105K' },
        { range: 'A$100K-150K', percentage: 28, count: '84K' },
        { range: 'A$150K+', percentage: 15, count: '45K' },
      ],
    },
    industries: [
      { industry: 'Technology', percentage: 20, count: '60K', trend: 'growing' },
      { industry: 'Finance', percentage: 16, count: '48K', trend: 'stable' },
      { industry: 'Healthcare', percentage: 14, count: '42K', trend: 'stable' },
      { industry: 'Retail', percentage: 12, count: '36K', trend: 'stable' },
      { industry: 'Mining', percentage: 8, count: '24K', trend: 'declining' },
      { industry: 'Other', percentage: 30, count: '90K', trend: 'stable' },
    ],
    regions: [
      { region: 'New South Wales', percentage: 32, count: '96K', majorCities: ['Sydney', 'Newcastle', 'Wollongong'] },
      { region: 'Victoria', percentage: 25, count: '75K', majorCities: ['Melbourne', 'Geelong', 'Ballarat'] },
      { region: 'Queensland', percentage: 20, count: '60K', majorCities: ['Brisbane', 'Gold Coast', 'Cairns'] },
      { region: 'Western Australia', percentage: 12, count: '36K', majorCities: ['Perth', 'Fremantle', 'Bunbury'] },
      { region: 'South Australia', percentage: 7, count: '21K', majorCities: ['Adelaide', 'Mount Gambier', 'Whyalla'] },
      { region: 'Other', percentage: 4, count: '12K', majorCities: ['Canberra', 'Hobart', 'Darwin'] },
    ],
    engagement: {
      avgSurveysPerMonth: 8.8,
      completionRate: 86,
      satisfactionScore: 4.5,
      retentionRate: 91,
    },
  },
  'Singapore': {
    country: 'Singapore',
    flag: '🇸🇬',
    members: '150K+',
    variant: 'yellow' as const,
    totalPanelists: 150000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 22, count: '33K' },
        { range: '25-34', percentage: 30, count: '45K' },
        { range: '35-44', percentage: 28, count: '42K' },
        { range: '45-54', percentage: 15, count: '22.5K' },
        { range: '55+', percentage: 5, count: '7.5K' },
      ],
      gender: [
        { type: 'Male', percentage: 48, count: '72K' },
        { type: 'Female', percentage: 52, count: '78K' },
      ],
      race: [
        { type: 'Chinese', percentage: 74, count: '111K' },
        { type: 'Malay', percentage: 13, count: '19.5K' },
        { type: 'Indian', percentage: 9, count: '13.5K' },
        { type: 'Other', percentage: 4, count: '6K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 45, count: '67.5K' },
        { level: 'Undergraduate', percentage: 40, count: '60K' },
        { level: 'High School', percentage: 15, count: '22.5K' },
      ],
      income: [
        { range: 'S$0-40K', percentage: 20, count: '30K' },
        { range: 'S$40K-80K', percentage: 35, count: '52.5K' },
        { range: 'S$80K-120K', percentage: 30, count: '45K' },
        { range: 'S$120K+', percentage: 15, count: '22.5K' },
      ],
    },
    industries: [
      { industry: 'Technology', percentage: 28, count: '42K', trend: 'growing' },
      { industry: 'Finance', percentage: 22, count: '33K', trend: 'stable' },
      { industry: 'Manufacturing', percentage: 15, count: '22.5K', trend: 'stable' },
      { industry: 'Healthcare', percentage: 12, count: '18K', trend: 'stable' },
      { industry: 'Retail', percentage: 10, count: '15K', trend: 'stable' },
      { industry: 'Other', percentage: 13, count: '19.5K', trend: 'stable' },
    ],
    regions: [
      { region: 'Central', percentage: 35, count: '52.5K', majorCities: ['Singapore City'] },
      { region: 'North', percentage: 25, count: '37.5K', majorCities: ['Woodlands', 'Sembawang'] },
      { region: 'East', percentage: 20, count: '30K', majorCities: ['Tampines', 'Pasir Ris'] },
      { region: 'West', percentage: 20, count: '30K', majorCities: ['Jurong West', 'Clementi'] },
    ],
    engagement: {
      avgSurveysPerMonth: 9.2,
      completionRate: 90,
      satisfactionScore: 4.7,
      retentionRate: 93,
    },
  },
  'Japan': {
    country: 'Japan',
    flag: '🇯🇵',
    members: '200K+',
    variant: 'pink' as const,
    totalPanelists: 200000,
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 15, count: '30K' },
        { range: '25-34', percentage: 22, count: '44K' },
        { range: '35-44', percentage: 28, count: '56K' },
        { range: '45-54', percentage: 25, count: '50K' },
        { range: '55+', percentage: 10, count: '20K' },
      ],
      gender: [
        { type: 'Male', percentage: 52, count: '104K' },
        { type: 'Female', percentage: 48, count: '96K' },
      ],
      race: [
        { type: 'Japanese', percentage: 95, count: '190K' },
        { type: 'Korean', percentage: 2, count: '4K' },
        { type: 'Chinese', percentage: 2, count: '4K' },
        { type: 'Other', percentage: 1, count: '2K' },
      ],
      education: [
        { level: 'Graduate Degree', percentage: 50, count: '100K' },
        { level: 'Undergraduate', percentage: 35, count: '70K' },
        { level: 'High School', percentage: 15, count: '30K' },
      ],
      income: [
        { range: '¥0-3M', percentage: 18, count: '36K' },
        { range: '¥3M-6M', percentage: 25, count: '50K' },
        { range: '¥6M-10M', percentage: 30, count: '60K' },
        { range: '¥10M+', percentage: 27, count: '54K' },
      ],
    },
    industries: [
      { industry: 'Technology', percentage: 25, count: '50K', trend: 'growing' },
      { industry: 'Manufacturing', percentage: 20, count: '40K', trend: 'stable' },
      { industry: 'Finance', percentage: 15, count: '30K', trend: 'stable' },
      { industry: 'Retail', percentage: 12, count: '24K', trend: 'stable' },
      { industry: 'Healthcare', percentage: 10, count: '20K', trend: 'stable' },
      { industry: 'Other', percentage: 18, count: '36K', trend: 'stable' },
    ],
    regions: [
      { region: 'Kanto', percentage: 35, count: '70K', majorCities: ['Tokyo', 'Yokohama', 'Chiba'] },
      { region: 'Kansai', percentage: 25, count: '50K', majorCities: ['Osaka', 'Kyoto', 'Kobe'] },
      { region: 'Chubu', percentage: 20, count: '40K', majorCities: ['Nagoya', 'Hamamatsu', 'Toyota'] },
      { region: 'Other', percentage: 20, count: '40K', majorCities: ['Sapporo', 'Fukuoka', 'Sendai'] },
    ],
    engagement: {
      avgSurveysPerMonth: 7.8,
      completionRate: 92,
      satisfactionScore: 4.8,
      retentionRate: 95,
    },
  },
};

const CountryDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add debugging and robust key matching
  console.log('Country parameter from URL:', country);
  console.log('Available country keys:', Object.keys(countryData));

  // Try multiple key formats
  let countryInfo: CountryData | undefined = undefined;

  if (country) {
    countryInfo = countryData[country];
    if (!countryInfo) {
      // Try with spaces instead of hyphens
      const countryWithSpaces = country.replace(/-/g, ' ');
      countryInfo = countryData[countryWithSpaces];
      console.log('Trying with spaces:', countryWithSpaces);
    }
    if (!countryInfo) {
      // Try exact match with different casing
      const possibleKeys = Object.keys(countryData);
      for (const key of possibleKeys) {
        if (key.toLowerCase().replace(/[^a-z]/g, '') === country.toLowerCase().replace(/[^a-z]/g, '')) {
          countryInfo = countryData[key];
          console.log('Found match with key:', key);
          break;
        }
      }
    }
  }

  if (!countryInfo) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
        <DotGrid className="fixed inset-0" />
        <div className="flex items-center justify-center min-h-screen">
          <PlayfulCard className="p-8 text-center bg-white/90">
            <h1 className="font-outfit font-bold text-2xl text-navy mb-4">Country Not Found</h1>
            <p className="font-jakarta text-navy-light mb-6">The country you're looking for doesn't exist in our database.</p>
            <PlayfulButton onClick={() => navigate('/')}>
              Back to Home
            </PlayfulButton>
          </PlayfulCard>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="w-4 h-4 text-green" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red transform rotate-180" />;
      default: return <Target className="w-4 h-4 text-yellow" />;
    }
  };

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

      {/* Country Header */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-8 text-navy hover:text-violet transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-jakarta font-medium">Back to Home</span>
          </button>

          {/* Country Hero Section - 60/40 Layout */}
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            {/* Map Section - 50% */}
            <div className="lg:col-span-2">
              <PlayfulCard className="p-6 bg-white hover:shadow-hard transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <Map className="w-6 h-6 text-violet" />
                  <h3 className="font-outfit font-bold text-lg text-navy">
                    {countryInfo.country} Map
                  </h3>
                </div>
                <div className="w-full h-96 rounded-xl overflow-hidden relative flex items-center justify-center">
                  <img
                    src={`/Countries/${countryInfo.country}.png`}
                    alt={`${countryInfo.country} map`}
                    className="w-full h-full object-contain absolute inset-0"
                    onError={(e) => {
                      console.log('Map image failed to load:', e.currentTarget.src);
                      e.currentTarget.src = `/Countries/${countryInfo.country.toLowerCase().replace(/\s+/g, '-')}.png`;
                    }}
                  />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="font-jakarta text-lg text-white font-medium drop-shadow-lg">
                      {countryInfo.country}
                    </p>
                  </div>
                </div>
              </PlayfulCard>
            </div>

            {/* Region Stats Cards - 40% */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h3 className="font-outfit font-bold text-lg text-navy flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet" />
                  Regional Distribution
                </h3>
                {countryInfo.regions.map((region: any, index: number) => (
                  <PlayfulCard key={index} className="p-4 bg-white/90 hover:shadow-hard transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-outfit font-bold text-navy">{region.region}</h4>
                      <span className="font-jakarta text-sm text-violet font-medium bg-violet/10 px-2 py-1 rounded-full">
                        {region.percentage}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-jakarta text-sm text-navy-light">Panelists</span>
                        <span className="font-outfit font-bold text-violet">{region.count}</span>
                      </div>
                      <div className="w-full bg-navy/10 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-violet to-pink rounded-full"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                      <div className="pt-2">
                        <p className="font-jakarta text-xs text-navy-light mb-1">Major Cities:</p>
                        <div className="flex flex-wrap gap-1">
                          {region.majorCities.map((city: string, cityIndex: number) => (
                            <span key={cityIndex} className="font-jakarta text-xs bg-navy/10 text-navy px-2 py-1 rounded-full">
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PlayfulCard>
                ))}
              </div>
            </div>
          </div>

          {/* Country Info Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <span className="text-6xl">{countryInfo.flag}</span>
              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl text-navy leading-[1.1]">
                {countryInfo.country}
                <br />
                <span className="relative inline-block">
                  Panelists
                </span>
              </h1>
              <span className="font-outfit font-bold text-2xl text-violet">{countryInfo.members}</span>
            </div>
            <p className="font-jakarta text-lg text-navy-light max-w-3xl mx-auto">
              Comprehensive demographic and industry insights for our {countryInfo.country} panelist community.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PlayfulCard variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
              <div className="flex justify-center mb-4">
                <IconCircle variant={countryInfo.variant} size="lg">
                  <Users className="w-6 h-6" />
                </IconCircle>
              </div>
              <p className="font-outfit font-extrabold text-3xl text-violet mb-2">
                {countryInfo.totalPanelists.toLocaleString()}
              </p>
              <p className="font-jakarta text-sm text-navy-light font-medium">Total Panelists</p>
            </PlayfulCard>

            <PlayfulCard variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
              <div className="flex justify-center mb-4">
                <IconCircle variant="yellow" size="lg">
                  <BarChart3 className="w-6 h-6" />
                </IconCircle>
              </div>
              <p className="font-outfit font-extrabold text-3xl text-violet mb-2">
                {countryInfo.engagement.avgSurveysPerMonth}
              </p>
              <p className="font-jakarta text-sm text-navy-light font-medium">Avg Surveys/Month</p>
            </PlayfulCard>

            <PlayfulCard variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
              <div className="flex justify-center mb-4">
                <IconCircle variant="green" size="lg">
                  <Award className="w-6 h-6" />
                </IconCircle>
              </div>
              <p className="font-outfit font-extrabold text-3xl text-violet mb-2">
                {countryInfo.engagement.completionRate}%
              </p>
              <p className="font-jakarta text-sm text-navy-light font-medium">Completion Rate</p>
            </PlayfulCard>

            <PlayfulCard variant="static" className="p-6 text-center bg-white/90 hover:shadow-hard transition-all">
              <div className="flex justify-center mb-4">
                <IconCircle variant="lavender" size="lg">
                  <Heart className="w-6 h-6" />
                </IconCircle>
              </div>
              <p className="font-outfit font-extrabold text-3xl text-violet mb-2">
                {countryInfo.engagement.satisfactionScore}/5
              </p>
              <p className="font-jakarta text-sm text-navy-light font-medium">Satisfaction Score</p>
            </PlayfulCard>
          </div>

          {/* Demographics Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Age Groups */}
            <PlayfulCard className="p-6 bg-white/90 hover:shadow-hard transition-all">
              <h3 className="font-outfit font-bold text-xl text-navy mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Age Distribution
              </h3>
              <div className="space-y-3">
                {countryInfo.demographics.ageGroups.map((group: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-jakarta text-sm text-navy">{group.range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-navy/10 rounded-full h-2">
                        <div
                          className="h-2 bg-violet rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                      <span className="font-jakarta text-xs text-navy-light">{group.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </PlayfulCard>

            {/* Gender Distribution */}
            <PlayfulCard className="p-6 bg-white/90 hover:shadow-hard transition-all">
              <h3 className="font-outfit font-bold text-xl text-navy mb-4">Gender Distribution</h3>
              <div className="space-y-3">
                {countryInfo.demographics.gender.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-jakarta text-sm text-navy">{group.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-navy/10 rounded-full h-2">
                        <div
                          className="h-2 bg-violet rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                      <span className="font-jakarta text-xs text-navy-light">{group.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </PlayfulCard>
          </div>

          {/* Race/Ethnicity Section */}
          <PlayfulCard className="p-6 bg-white/90 hover:shadow-hard transition-all mb-8">
            <h3 className="font-outfit font-bold text-xl text-navy mb-4">Race & Ethnicity</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {countryInfo.demographics.race.map((group, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div className="w-16 h-16 bg-navy/10 rounded-full mx-auto flex items-center justify-center">
                      <span className="font-jakarta text-sm text-navy font-medium">{group.percentage}%</span>
                    </div>
                  </div>
                  <p className="font-jakarta text-xs text-navy">{group.type}</p>
                  <p className="font-jakarta text-sm text-violet font-medium">{group.count}</p>
                </div>
              ))}
            </div>
          </PlayfulCard>

          {/* Education Level */}
          <PlayfulCard className="p-6 bg-white/90 hover:shadow-hard transition-all mb-8">
            <h3 className="font-outfit font-bold text-xl text-navy mb-4">Education Level</h3>
            <div className="grid grid-cols-3 gap-4">
              {countryInfo.demographics.education.map((level, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div className="w-16 h-16 bg-navy/10 rounded-full mx-auto flex items-center justify-center">
                      <span className="font-jakarta text-sm text-navy font-medium">{level.percentage}%</span>
                    </div>
                  </div>
                  <p className="font-jakarta text-xs text-navy mb-1">{level.level}</p>
                  <p className="font-jakarta text-sm text-violet font-medium">{level.count}</p>
                </div>
              ))}
            </div>
          </PlayfulCard>

          {/* Income Distribution */}
          <PlayfulCard className="p-6 bg-white/90 hover:shadow-hard transition-all mb-8">
            <h3 className="font-outfit font-bold text-xl text-navy mb-4">Income Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              {countryInfo.demographics.income.map((income, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div className="w-16 h-16 bg-navy/10 rounded-full mx-auto flex items-center justify-center">
                      <span className="font-jakarta text-sm text-navy font-medium">{income.percentage}%</span>
                    </div>
                  </div>
                  <p className="font-jakarta text-xs text-navy mb-1">{income.range}</p>
                  <p className="font-jakarta text-sm text-violet font-medium">{income.count}</p>
                </div>
              ))}
            </div>
          </PlayfulCard>

          {/* Industries Section */}
          <div className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-navy mb-6 text-center">Industry Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countryInfo.industries.map((industry, index) => (
                <PlayfulCard key={index} className="p-4 bg-white/90 hover:shadow-hard transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-outfit font-bold text-lg text-navy">{industry.industry}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(industry.trend)}
                      <span className="font-jakarta text-xs text-navy-light capitalize">{industry.trend}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-sm text-navy-light">Panelists</span>
                      <span className="font-jakarta font-bold text-violet">{industry.count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-sm text-navy-light">Percentage</span>
                      <span className="font-jakarta font-bold text-violet">{industry.percentage}%</span>
                    </div>
                  </div>
                </PlayfulCard>
              ))}
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-navy mb-6 text-center">Regional Distribution</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {countryInfo.regions.map((region, index) => (
                <PlayfulCard key={index} className="p-6 bg-white/90 hover:shadow-hard transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-violet" />
                    <h4 className="font-outfit font-bold text-lg text-navy">{region.region}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-sm text-navy-light">Panelists</span>
                      <span className="font-jakarta font-bold text-violet">{region.count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-sm text-navy-light">Percentage</span>
                      <span className="font-jakarta font-bold text-violet">{region.percentage}%</span>
                    </div>
                    <div>
                      <span className="font-jakarta text-sm text-navy-light">Major Cities:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {region.majorCities.map((city, cityIndex) => (
                          <span key={cityIndex} className="px-2 py-1 bg-violet/10 text-violet text-xs rounded-full">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
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
                  <Users className="w-8 h-8" />
                </IconCircle>
              </div>
              <h2 className="font-outfit font-bold text-3xl text-navy mb-4">
                Join Our {countryInfo.country} Panel
              </h2>
              <p className="font-jakarta text-lg text-navy-light max-w-2xl mx-auto mb-8">
                Become part of our diverse and engaged panelist community in {countryInfo.country}.
                Share your opinions and earn rewards while shaping the future of products and services.
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
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CountryDetailPage;
