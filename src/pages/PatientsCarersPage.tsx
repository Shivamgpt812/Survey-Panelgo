import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Activity,
  Users,
  Globe,
  Sparkles,
  Search,
  CheckCircle2,
  Download,
  Send,
  Check,
  Lock,
  Stethoscope,
  HeartHandshake,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/useToast';

const illnessesList = [
  {
    name: 'Arthritis & Musculoskeletal',
    icon: Activity,
    variant: 'violet' as const,
    desc: 'Patients living with Osteoarthritis, Rheumatoid Arthritis, Psoriatic Arthritis, and chronic joint inflammation.',
    criteria: 'Diagnosed by rheumatologists, active therapy or biologic users.'
  },
  {
    name: 'Cancer & Oncology Care',
    icon: Heart,
    variant: 'pink' as const,
    desc: 'Breast, lung, prostate, colorectal, hematologic, and solid tumor cancer patients along with remission survivors.',
    criteria: 'Staged diagnoses, chemotherapy, immunotherapy, and clinical trial participants.'
  },
  {
    name: 'Diabetes & Metabolic Conditions',
    icon: Stethoscope,
    variant: 'yellow' as const,
    desc: 'Type 1 and Type 2 diabetes patients, continuous glucose monitor (CGM) users, and insulin pump users.',
    criteria: 'Blood glucose monitoring regimens, dietary & pharmaceutical adherence.'
  },
  {
    name: 'Hepatitis & Liver Diseases',
    icon: ShieldCheck,
    variant: 'green' as const,
    desc: 'Individuals diagnosed with Hepatitis B, Hepatitis C, NASH, NAFLD, and chronic hepatic disorders.',
    criteria: 'Antiviral therapy cohorts, hepatologist care monitoring.'
  },
  {
    name: 'Stroke & Cardiovascular Recovery',
    icon: Activity,
    variant: 'lavender' as const,
    desc: 'Post-stroke survivors, cardiovascular patients with hypertension, arrhythmias, and cardiac stent implants.',
    criteria: 'Rehabilitation therapy, cardiology follow-up, lifestyle tracking.'
  },
  {
    name: 'Brain Injury & Neurological Health',
    icon: Sparkles,
    variant: 'orange' as const,
    desc: 'Patients suffering from Traumatic Brain Injury (TBI), Parkinson’s, Alzheimer’s, Multiple Sclerosis, and Epilepsy.',
    criteria: 'Neurologist validated, assistive care & cognitive tracking.'
  },
  {
    name: 'Kidneys & Renal Conditions',
    icon: FileCheck,
    variant: 'violet' as const,
    desc: 'Chronic Kidney Disease (CKD Stages 1-5), hemodialysis, peritoneal dialysis, and post-transplant patients.',
    criteria: 'Nephrology treatments, renal diet & dialysis tracking.'
  },
  {
    name: 'Waterborne & Infectious Diseases',
    icon: AlertCircle,
    variant: 'pink' as const,
    desc: 'Patients recovered or undergoing treatment for endemic, waterborne, or tropical infectious illnesses.',
    criteria: 'Post-treatment recovery assessments, regional epidemiological studies.'
  },
  {
    name: 'Respiratory Conditions (Asthma / COPD)',
    icon: Activity,
    variant: 'green' as const,
    desc: 'Severe persistent asthma, Chronic Obstructive Pulmonary Disease, bronchiectasis, and inhaler therapy users.',
    criteria: 'Pulmonary function tests, daily inhaler adherence, oxygen support cohorts.'
  },
  {
    name: 'Rare & Chronic Medical Conditions',
    icon: HeartHandshake,
    variant: 'yellow' as const,
    desc: 'Orphan diseases, autoimmune conditions (Lupus, Crohn’s, Ulcerative Colitis), and complex multi-morbidities.',
    criteria: 'Specialist confirmation, niche medication & caregiver involvement.'
  }
];

const caregiverCohorts = [
  {
    title: 'Primary Family Caregivers',
    desc: 'Spouses, adult children, and parents providing day-to-day nursing, medication administration, and emotional support.',
    points: ['Medication adherence monitoring', 'Doctor appointment accompanying', 'Home medical equipment management']
  },
  {
    title: 'Pediatric Caregivers',
    desc: 'Parents and guardians managing specialized healthcare journeys for children with rare, chronic, or metabolic conditions.',
    points: ['Pediatric specialist coordination', 'School health plans', 'Therapy & emotional development']
  },
  {
    title: 'Geriatric & Palliative Carers',
    desc: 'Dedicated carers assisting seniors with dementia, mobility constraints, multiple chronic illnesses, and palliative care.',
    points: ['Daily living assistance (ADL)', 'Hospice coordination', 'Pharmacy refills & dosage oversight']
  },
  {
    title: 'Professional Home Health Aides',
    desc: 'Certified nursing assistants and home care workers providing clinical and physical support in domestic settings.',
    points: ['Post-surgery recovery', 'Vital signs monitoring', 'Direct medical observation']
  }
];

const compliancePillars = [
  {
    title: 'HIPAA & GDPR Compliance',
    desc: 'Complete pseudonymization and strict adherence to international health data privacy regulations.'
  },
  {
    title: 'Informed Consent & Ethics',
    desc: 'Transparent opt-in protocols ensuring participants understand the clinical and academic impact of their contribution.'
  },
  {
    title: 'Empathy-First Engagement',
    desc: 'Sensitive, accessible survey designs that respect cognitive and physical fatigue in chronically ill respondents.'
  },
  {
    title: 'Verified Medical Validation',
    desc: 'Robust screening protocols that ensure authentic diagnosis status through verified medication and physician touchpoints.'
  }
];

const globalMarkets = [
  { region: 'Asia Pacific', countries: ['India', 'Hong Kong', 'Taiwan', 'Vietnam', 'Philippines', 'Malaysia', 'Australia', 'Thailand', 'Singapore', 'Indonesia', 'South Korea', 'Japan'] },
  { region: 'Europe', countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Switzerland', 'Netherlands', 'Portugal', 'Poland'] },
  { region: 'Americas', countries: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'] },
  { region: 'Middle East & Africa', countries: ['South Africa', 'Nigeria', 'UAE', 'Saudi Arabia'] }
];

const PatientsCarersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    therapeuticArea: 'All Therapeutic Areas',
    respondentType: 'Patients & Caregivers',
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
      addToast('Thank you! Your healthcare research inquiry has been received. Our health research leads will be in touch.', 'success');
      setFormData({ name: '', email: '', organization: '', therapeuticArea: 'All Therapeutic Areas', respondentType: 'Patients & Caregivers', message: '' });
    }, 800);
  };

  const filteredIllnesses = illnessesList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="lavender" size="lg" className="left-[8%] top-[12%] opacity-60" />
      <DecorativeBlob variant="pink" size="md" className="right-[10%] top-[18%] opacity-60" />
      <DecorativeBlob variant="green" size="lg" className="right-[12%] bottom-[20%] opacity-60" />
      <DecorativeBlob variant="yellow" size="md" className="left-[12%] bottom-[15%] opacity-60" />

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
            <PlayfulBadge variant="lavender">Patients & Caregivers</PlayfulBadge>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-navy rounded-full shadow-hard-sm">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                <span className="font-outfit font-bold text-xs uppercase tracking-wider text-navy">
                  Covering Chronic Ailments, Illnesses & Caregivers
                </span>
              </div>

              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy leading-[1.1] tracking-tight">
                Authentic Patient Journeys &{' '}
                <span className="relative inline-block text-violet underline decoration-wavy decoration-pink-400 decoration-2">
                  Caregiver Voices
                </span>
              </h1>

              <p className="font-jakarta text-lg sm:text-xl text-navy-light max-w-2xl leading-relaxed">
                Empowering pharmaceutical, biotech, and healthcare researchers with verified patient and caregiver communities across chronic, acute, and rare therapeutic conditions worldwide.
              </p>

              {/* Key Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-violet">40+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Therapeutic Areas</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-pink-500">100%</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Verified Diagnoses</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600">HIPAA</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">& GDPR Compliant</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-amber-500">28+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Global Markets</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <PlayfulButton variant="primary" size="lg" onClick={() => navigate('/panels/patients-carers/signup')}>
                  Join Patient & Carer Panel
                  <ArrowLeft className="w-5 h-5 rotate-180 ml-1" />
                </PlayfulButton>
                <PlayfulButton variant="secondary" size="lg" onClick={() => navigate('/panels/patients-carers/login')}>
                  Login to Patient Portal
                </PlayfulButton>
              </div>
            </div>

            {/* Hero Interactive Card */}
            <div className="lg:col-span-5">
              <PlayfulCard variant="white" className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b-2 border-navy/10">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={HeartHandshake} variant="lavender" size="md" />
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-navy">Patient Insights Portal</h3>
                      <p className="font-jakarta text-xs text-navy/60">Ethics & empathy centered</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-pink-100 border border-pink-400 text-pink-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Secure & Private
                  </span>
                </div>

                <div className="space-y-4 font-jakarta text-sm">
                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Real-World Patient Experience</strong>
                      <span className="text-navy-light text-xs">First-hand narratives on treatment adherence, side-effects, and quality of life.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Dedicated Caregiver Cohorts</strong>
                      <span className="text-navy-light text-xs">Unmatched access to family carers who make or guide critical healthcare decisions.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Multi-Methodology Support</strong>
                      <span className="text-navy-light text-xs">Online quantitative surveys, 60-min qualitative IDIs, digital diaries & bulletin boards.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <PlayfulButton variant="primary" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/patients-carers/login')}>
                    Login to Patient Portal
                  </PlayfulButton>
                  <PlayfulButton variant="yellow" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/patients-carers/signup')}>
                    Join Our Panel
                  </PlayfulButton>
                </div>
              </PlayfulCard>
            </div>
          </div>
        </div>
      </section>

      {/* Illnesses & Therapeutic Areas Section */}
      <section id="therapeutic-areas" className="relative z-10 py-16 bg-white/80 border-y-2 border-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <PlayfulBadge variant="violet" className="mb-3">Health Conditions Profiled</PlayfulBadge>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
                Therapeutic Areas & Chronic Illnesses
              </h2>
              <p className="font-jakarta text-navy-light mt-2 max-w-xl">
                Profiled patient communities segmented by disease stage, line of therapy, and medication regimen.
              </p>
            </div>

            <div className="w-full md:w-72 relative">
              <Search className="w-4 h-4 text-navy/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search condition..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-navy rounded-xl font-jakarta text-xs sm:text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-violet shadow-hard-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIllnesses.map((item, i) => {
              const Icon = item.icon;
              return (
                <PlayfulCard key={i} variant={item.variant} className="p-6 sm:p-7 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <IconCircle icon={Icon} variant={item.variant} size="md" />
                    <span className="font-outfit font-bold text-xs px-2.5 py-1 bg-white/80 border border-navy rounded-full text-navy shadow-hard-sm">
                      Profiled Condition
                    </span>
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-xl text-navy">{item.name}</h3>
                    <p className="font-jakarta text-xs sm:text-sm text-navy/80 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-navy/10">
                    <p className="font-jakarta text-[11px] font-semibold text-navy/70">
                      <span className="text-violet font-bold">Criteria:</span> {item.criteria}
                    </p>
                  </div>
                </PlayfulCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Caregivers Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <PlayfulBadge variant="pink" className="mb-3">Caregiver Cohorts</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              The Critical Role of Caregivers
            </h2>
            <p className="font-jakarta text-navy-light mt-3">
              Caregivers provide crucial perspectives on treatment decisions, patient compliance, and holistic family wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caregiverCohorts.map((cohort, i) => (
              <div key={i} className="bg-white p-7 rounded-2xl border-2 border-navy shadow-hard space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-navy/10">
                  <IconCircle icon={Users} variant={i % 2 === 0 ? 'violet' : 'pink'} size="md" />
                  <h3 className="font-outfit font-bold text-xl text-navy">{cohort.title}</h3>
                </div>
                <p className="font-jakarta text-sm text-navy-light leading-relaxed">{cohort.desc}</p>
                <div className="space-y-2 pt-2">
                  {cohort.points.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-jakarta text-xs sm:text-sm text-navy/90">
                      <Check className="w-4 h-4 text-violet shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ethics & Compliance Section */}
      <section className="relative z-10 py-16 bg-navy text-white border-y-2 border-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 bg-yellow text-navy font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full mb-3">
              Data Protection & Privacy
            </span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white">
              Ethical Standards & Privacy Safeguards
            </h2>
            <p className="font-jakarta text-white/70 mt-3">
              We uphold the highest ethical protocols to safeguard vulnerable patient populations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {compliancePillars.map((p, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md space-y-3">
                <ShieldCheck className="w-8 h-8 text-yellow mb-2" />
                <h3 className="font-outfit font-bold text-lg text-white">{p.title}</h3>
                <p className="font-jakarta text-xs sm:text-sm text-white/70 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <PlayfulBadge variant="green" className="mb-3">Worldwide Fieldwork</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              Global Patient & Carer Reach
            </h2>
            <p className="font-jakarta text-navy-light mt-2">
              Recruiting across 28+ countries with localized translation and patient advocacy alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalMarkets.map((m, i) => (
              <div key={i} className="bg-white border-2 border-navy rounded-2xl p-6 shadow-hard-sm">
                <h3 className="font-outfit font-bold text-base text-violet mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{m.region}</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {m.countries.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-periwinkle/50 text-navy font-jakarta text-xs font-medium rounded-md"
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
          <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-3xl p-8 sm:p-10 border-2 border-navy text-white shadow-hard relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2 max-w-lg">
                <span className="inline-block px-3.5 py-1 bg-yellow text-navy font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full shadow-hard-sm">
                  Patient & Carer Access
                </span>
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">
                  Join or Sign In to the Patient Portal
                </h3>
                <p className="font-jakarta text-white/85 text-sm">
                  Share your healthcare journey in confidential, ethical studies to guide future medical breakthroughs and earn compliant honoraria.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <PlayfulButton variant="white" size="lg" onClick={() => navigate('/panels/patients-carers/login')}>
                  Login to Patient Portal
                </PlayfulButton>
                <PlayfulButton variant="yellow" size="lg" onClick={() => navigate('/panels/patients-carers/register')}>
                  Join Patient Panel
                </PlayfulButton>
              </div>
            </div>
          </div>

          {/* Client Feasibility Card */}
          <PlayfulCard variant="white" className="p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <PlayfulBadge variant="lavender" className="mb-3">For Healthcare Researchers</PlayfulBadge>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-navy">
                Request Patient & Caregiver Feasibility
              </h2>
              <p className="font-jakarta text-navy-light mt-2 text-sm sm:text-base">
                Share your protocol and inclusion/exclusion criteria. Our healthcare research team will evaluate incidence rates, feasibility, and deliver custom quotes.
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
                    placeholder="Dr. Sarah Jenkins"
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
                    placeholder="sarah@pharma-research.com"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Pharma / Biotech / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="BioHealth Therapeutics"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Therapeutic Area
                  </label>
                  <select
                    value={formData.therapeuticArea}
                    onChange={(e) => setFormData({ ...formData, therapeuticArea: e.target.value })}
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet transition-all"
                  >
                    <option>All Therapeutic Areas</option>
                    <option>Oncology / Cancer</option>
                    <option>Diabetes / Endocrinology</option>
                    <option>Rheumatology / Arthritis</option>
                    <option>Neurology & Brain Injury</option>
                    <option>Renal & Kidney Diseases</option>
                    <option>Respiratory (Asthma / COPD)</option>
                    <option>Rare & Orphan Diseases</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                  Protocol Summary & Inclusion/Exclusion Criteria (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Seeking N=50 Stage III/IV Non-Small Cell Lung Cancer patients and N=30 primary caregivers for 45-minute web-assisted interviews..."
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
                  {isSubmitting ? 'Submitting Inquiry...' : 'Request Feasibility & Consultation'}
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

export default PatientsCarersPage;
