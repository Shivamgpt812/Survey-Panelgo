import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Stethoscope,
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
  HeartPulse,
  Syringe,
  Pill,
  Microscope,
  Baby,
  Eye,
  Smile,
  FileCheck2,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/useToast';

const mainstreamDoctors = [
  'Allergist / Immunologist', 'Andrologist', 'Anesthesiologist', 'Bariatric Surgeon',
  'Cardiac Surgeon', 'Cardiologist', 'Colorectal Surgeon', 'Dermatologist',
  'Emergency Medicine Specialists', 'Endocrinologist', 'Family Physician',
  'Gastroenterologist', 'General Surgeon', 'Geriatric Medicine Specialists',
  'Hematologist', 'Hepatologist', 'Hospice and Palliative Medicine Specialists',
  'Infectious Disease Specialist', 'Internal Medicine Specialist / General Physician',
  'Medical Geneticist', 'Nephrologist', 'Neurologist / Neurosurgeon',
  'Nuclear Medicine Specialist', 'Obstetrician/Gynecologist', 'Occupational Medicine Specialist',
  'Oncologist', 'Ophthalmologist', 'Orthopedic Surgeon / Orthopedist', 'Osteopath',
  'Otolaryngologist (ENT Specialist)', 'Pathologist', 'Pediatric Cardiologist',
  'Pediatric General Surgeon', 'Pediatric Oncologist', 'Pediatrician',
  'Physiatrist', 'Physiotherapist', 'Plastic Surgeon', 'Podiatrist',
  'Preventive Medicine Specialist', 'Psychiatrist', 'Pulmonologist',
  'Radiologist', 'Rheumatologist', 'Sleep Medicine Specialist / Somnologist',
  'Spinal Cord Injury Specialist', 'Sports Medicine Specialist', 'Thoracic Surgeon',
  'Urologist', 'Vascular Surgeon'
];

const dentalSpecialties = [
  'Dentist Anesthesiologist', 'Endodontist', 'General Dentist',
  'Oral and Maxillofacial Surgeon', 'Orthodontist', 'Oral Implantologist',
  'Oral Pathologist', 'Oral & Maxillofacial Radiologist', 'Prosthodontist',
  'Pediatric Dentist', 'Periodontist'
];

const ayurvedicSpecialties = [
  'Ayurvedic General Physician (Kayachikitsak)',
  'Ayurvedic Pediatric (Balachikitsak)',
  'Ayurvedic Surgeon (Shalya Chikitsak)',
  'Ayurvedic Geriatrics (Rasayana Chikitsak)',
  'Ayurvedic Toxicologist (Visha Chikitsak)',
  'Ayurvedic ENT specialist (Salakya Chikitsak)'
];

const nursingSpecialties = [
  'Cardiac Nursing', 'Critical Care Nursing', 'Clinical Nurse Specialist',
  'Certified Registered Nurse Anesthetist (CRNA)', 'Dialysis Nurse', 'Emergency Nursing',
  'Gerontological Nursing', 'Health Informatics', 'Medical-Surgical Nursing',
  'Nurse Practitioner', 'Nurse Case Manager', 'Neonatal Nursing', 'Nurse Researcher',
  'Nurse Midwife', 'Nurse Educator', 'Nurse Administrator', 'Oncology Nursing',
  'Orthopaedic Nursing', 'Psychiatric Nursing', 'Pediatric Nursing',
  'Public Health Nursing', 'Registered Nurse', 'School Nurse', 'Travel Nurse'
];

const otherSpecialists = [
  'Dieticians & Clinical Nutritionists', 'Veterinarians & Animal Health Experts',
  'Clinical Pharmacologists', 'Medical Lab Technologists'
];

const partnerPillars = [
  {
    title: 'Verified Healthcare Professionals',
    desc: 'Panel includes verified practicing doctors and specialists cross-authenticated via medical council registrations.',
    icon: ShieldCheck,
    variant: 'violet' as const
  },
  {
    title: 'Secure & Confidential Execution',
    desc: 'Research is executed with strict compliance, non-disclosure protocols, and full HIPAA/GDPR alignment.',
    icon: Lock,
    variant: 'pink' as const
  },
  {
    title: 'Structured Research Management',
    desc: 'End-to-end recruitment and fieldwork management for surveys, interviews, and clinical advisory boards.',
    icon: FileCheck2,
    variant: 'yellow' as const
  },
  {
    title: 'Diverse Research Formats',
    desc: 'Support for quantitative surveys, 60-min qualitative IDIs, double-blind advisory boards, and virtual focus groups.',
    icon: Activity,
    variant: 'green' as const
  },
  {
    title: 'Transparent & Professional Engagement',
    desc: 'Respectful scheduling with fair market value (FMV) honoraria management and compliance handling.',
    icon: HeartPulse,
    variant: 'lavender' as const
  },
  {
    title: 'Industry-Driven Insights',
    desc: 'Ideal for pharmaceutical giants, medical device innovators, biotech firms, and healthcare strategy teams.',
    icon: Sparkles,
    variant: 'orange' as const
  }
];

const HealthcareProfessionalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<'mainstream' | 'dental' | 'ayurvedic' | 'nursing' | 'other'>('mainstream');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    consultationType: 'Healthcare Professionals Panel Access',
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
      addToast('Thank you! Your Healthcare Professionals consultation request has been received.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        designation: '',
        consultationType: 'Healthcare Professionals Panel Access',
        message: ''
      });
    }, 800);
  };

  const getActiveList = () => {
    switch (activeCategory) {
      case 'mainstream': return mainstreamDoctors;
      case 'dental': return dentalSpecialties;
      case 'ayurvedic': return ayurvedicSpecialties;
      case 'nursing': return nursingSpecialties;
      case 'other': return otherSpecialists;
      default: return mainstreamDoctors;
    }
  };

  const filteredList = getActiveList().filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />

      {/* Decorative Blobs */}
      <DecorativeBlob variant="green" size="lg" className="left-[8%] top-[12%] opacity-60" />
      <DecorativeBlob variant="yellow" size="md" className="right-[10%] top-[18%] opacity-60" />
      <DecorativeBlob variant="pink" size="lg" className="right-[12%] bottom-[20%] opacity-60" />
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
            <PlayfulBadge variant="green">Healthcare Professionals</PlayfulBadge>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-navy rounded-full shadow-hard-sm">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span className="font-outfit font-bold text-xs uppercase tracking-wider text-navy">
                  Verified Healthcare Experts. Trusted Research Insights.
                </span>
              </div>

              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy leading-[1.1] tracking-tight">
                Access Leading{' '}
                <span className="relative inline-block text-emerald-600 underline decoration-wavy decoration-yellow decoration-2">
                  Medical Experts
                </span>{' '}
                All In One Panel
              </h1>

              <p className="font-jakarta text-lg sm:text-xl text-navy-light max-w-2xl leading-relaxed">
                Drive your pharmaceutical and medical strategy forward with specialty-specific data, surgical insights, and frontline clinical perspectives from vetted medical practitioners.
              </p>

              {/* Key Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600">50+</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Medical Specialties</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-violet">100%</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">License Verified</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-pink-500">24h</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">Feasibility Quote</div>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border-2 border-navy shadow-hard-sm text-center">
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-amber-500">KOLs</div>
                  <div className="font-jakarta text-xs font-semibold text-navy/80 mt-0.5">& Clinical Leads</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <PlayfulButton variant="primary" size="lg" onClick={() => navigate('/panels/healthcare-professionals/signup')}>
                  Join as Medical Specialist
                  <ArrowLeft className="w-5 h-5 rotate-180 ml-1" />
                </PlayfulButton>
                <PlayfulButton variant="secondary" size="lg" onClick={() => navigate('/panels/healthcare-professionals/login')}>
                  Login to HCP Panel
                </PlayfulButton>
              </div>
            </div>

            {/* Hero Interactive Card */}
            <div className="lg:col-span-5">
              <PlayfulCard variant="white" className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b-2 border-navy/10">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={Stethoscope} variant="green" size="md" />
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-navy">HCP Panel Portal</h3>
                      <p className="font-jakarta text-xs text-navy/60">Practicing medical professionals</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 border border-emerald-500 text-emerald-800 text-xs font-bold rounded-full">
                    Active HCPs
                  </span>
                </div>

                <div className="space-y-4 font-jakarta text-sm">
                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Cross-Authenticated Registrations</strong>
                      <span className="text-navy-light text-xs">Verified against national medical registers, licensing boards & hospital affiliations.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Specialized & Sub-Specialty Surgeons</strong>
                      <span className="text-navy-light text-xs">Oncologists, cardiothoracic surgeons, neurologists, dermatologists & radiologists.</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-periwinkle/60 rounded-xl border border-navy/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy block">Fair Market Value (FMV) Honoraria</strong>
                      <span className="text-navy-light text-xs">Compliant and seamless honoraria distribution ensuring exceptional completion rates.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <PlayfulButton variant="primary" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/healthcare-professionals/login')}>
                    Login to HCP Panel
                  </PlayfulButton>
                  <PlayfulButton variant="yellow" size="md" className="flex-1 justify-center" onClick={() => navigate('/panels/healthcare-professionals/signup')}>
                    Join Our Panel
                  </PlayfulButton>
                </div>
              </PlayfulCard>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Healthcare Roles Explorer */}
      <section id="specialties-explorer" className="relative z-10 py-16 bg-white/80 border-y-2 border-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <PlayfulBadge variant="green" className="mb-3">Healthcare Roles Covered</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              Specialties & Healthcare Disciplines
            </h2>
            <p className="font-jakarta text-navy-light mt-3">
              Explore our verified clinical network spanning mainstream doctors, dental specialists, nursing staff, and allied practitioners.
            </p>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {[
              { id: 'mainstream', label: 'Mainstream Doctors (50+)', icon: Stethoscope },
              { id: 'dental', label: 'Dental Health (11)', icon: Smile },
              { id: 'nursing', label: 'Nurses & Care Teams (24+)', icon: HeartPulse },
              { id: 'ayurvedic', label: 'Ayurvedic & Holistic (6)', icon: Pill },
              { id: 'other', label: 'Allied & Nutritionists (4)', icon: Microscope },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveCategory(tab.id as any); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-outfit font-bold text-sm sm:text-base border-2 border-navy transition-all duration-200 shadow-hard-sm ${
                    isActive
                      ? 'bg-emerald-600 text-white -translate-y-1'
                      : 'bg-white text-navy hover:bg-periwinkle/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Filter */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="w-5 h-5 text-navy/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search specialty...`}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-hard-sm"
            />
          </div>

          {/* Specialties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredList.map((spec, i) => (
              <div
                key={i}
                className="p-4 bg-white hover:bg-emerald-50/50 border-2 border-navy/15 hover:border-emerald-600 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-hard-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="font-jakarta font-semibold text-xs sm:text-sm text-navy">{spec}</span>
                </div>
                <Check className="w-4 h-4 text-emerald-600 shrink-0 opacity-40 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner With Us / Pillars Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <PlayfulBadge variant="violet" className="mb-3">Our Quality Pillars</PlayfulBadge>
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-navy">
              Partner with Us for Impactful Healthcare Outcomes
            </h2>
            <p className="font-jakarta text-navy-light mt-3">
              We empower medical and pharmaceutical research through direct access to vetted medical practitioners while maintaining the highest quality and confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerPillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <PlayfulCard key={i} variant={p.variant} className="p-6 sm:p-7 space-y-4 text-left">
                  <IconCircle icon={Icon} variant={p.variant} size="md" />
                  <h3 className="font-outfit font-bold text-xl text-navy">{p.title}</h3>
                  <p className="font-jakarta text-xs sm:text-sm text-navy/80 leading-relaxed">{p.desc}</p>
                </PlayfulCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Panelist Access & Consultation Section */}
      <section id="consultation" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-white/60 border-t-2 border-navy/10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* HCP Quick Access Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-10 border-2 border-navy text-white shadow-hard relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2 max-w-lg">
                <span className="inline-block px-3.5 py-1 bg-yellow text-navy font-outfit font-extrabold text-xs uppercase tracking-wider rounded-full shadow-hard-sm">
                  Healthcare Professional Access
                </span>
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white">
                  Join or Sign In to the HCP Panel
                </h3>
                <p className="font-jakarta text-white/85 text-sm">
                  Participate in medical research, specialty advisory boards, and pharmaceutical surveys. Receive prompt, compliant honoraria for your clinical expertise.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <PlayfulButton variant="white" size="lg" onClick={() => navigate('/panels/healthcare-professionals/login')}>
                  Login to HCP Panel
                </PlayfulButton>
                <PlayfulButton variant="yellow" size="lg" onClick={() => navigate('/panels/healthcare-professionals/register')}>
                  Join HCP Panel
                </PlayfulButton>
              </div>
            </div>
          </div>

          {/* Client Feasibility Card */}
          <PlayfulCard variant="white" className="p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <PlayfulBadge variant="green" className="mb-3">For Pharma & Healthcare Organizations</PlayfulBadge>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-navy">
                Request Healthcare Data Consultation
              </h2>
              <p className="font-jakarta text-navy-light mt-2 text-sm sm:text-base">
                Share your clinical or research requirements and our medical research team will get back to you with the right dataset, feasibility, and timelines.
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
                    placeholder="Dr. Robert Chen"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
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
                    placeholder="robert@pharma.com"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Global Health Corp"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Head of Market Research"
                    className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                  What Are You Looking For? *
                </label>
                <select
                  value={formData.consultationType}
                  onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                  className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
                >
                  <option>Healthcare Professionals Panel Access</option>
                  <option>Data Collection / Quantitative Surveys</option>
                  <option>Qualitative Interviews (KOL IDIs)</option>
                  <option>Focus Group Discussions</option>
                  <option>Custom Medical Research / Consulting</option>
                  <option>Other Specialized Medical Recruitment</option>
                </select>
              </div>

              <div>
                <label className="block font-jakarta font-semibold text-xs uppercase tracking-wider text-navy mb-2">
                  Additional Details & Specialty Requirements (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details on target specialties, screener criteria, sample size, or therapeutic areas..."
                  className="w-full px-4 py-3 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all resize-none"
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
                  {isSubmitting ? 'Submitting...' : 'Request Data Consultation'}
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

export default HealthcareProfessionalsPage;
