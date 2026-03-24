import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Star,
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  Check,
  X,
  ExternalLink,
  Clock,
  Coins,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Store,
  Link,
  Copy,
  QrCode,
  Download,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pencil,
  Pause,
  Play,
  ClipboardList,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiGet, apiPost, apiDelete, apiGetText, apiPatch } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { downloadCSV } from '@/lib/csv';
import { generateVendorLink } from '@/lib/vendorSession';
import type {
  Survey,
  PreScreenerQuestion,
  Vendor,
  SurveyResponseRecord,
  ActivityLogEntry,
} from '@/types';
import { downloadExcel } from '@/lib/excel';
import SurveyLogs from '@/components/admin/SurveyLogs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const emptyAnalytics = {
  totalSurveys: 0,
  activeSurveys: 0,
  inactiveSurveys: 0,
  totalUsers: 0,
  totalAdmins: 0,
  totalPointsDistributed: 0,
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { addToast } = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [vendorAnalytics, setVendorAnalytics] = useState<
    Record<string, { completes: number; terminates: number; quotaFull: number }>
  >({});
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [responses, setResponses] = useState<SurveyResponseRecord[]>([]);
  const [templateList, setTemplateList] = useState<PreScreenerQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'surveys' | 'create' | 'vendors' | 'edit' | 'logs' | 'survey-logs'>('dashboard');
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      const [sRes, vRes, aRes, rRes, logsRes, tRes] = await Promise.all([
        apiGet<{ surveys: Survey[] }>('/api/surveys', token),
        apiGet<{ vendors: Vendor[] }>('/api/vendors'),
        apiGet<{
          analytics: typeof emptyAnalytics;
          vendorAnalytics: Record<string, { completes: number; terminates: number; quotaFull: number }>;
        }>('/api/analytics', token),
        apiGet<{ responses: SurveyResponseRecord[] }>('/api/responses', token),
        apiGet<{ logs: ActivityLogEntry[] }>('/api/activity-logs?limit=50', token),
        apiGet<{ templates: PreScreenerQuestion[] }>('/api/pre-screener-templates', token),
      ]);
      setSurveys(sRes.surveys);
      setVendors(vRes.vendors);
      setAnalytics(aRes.analytics);
      setVendorAnalytics(aRes.vendorAnalytics);
      setResponses(rRes.responses);
      setActivityLogs(logsRes.logs);
      setTemplateList(tRes.templates);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load', 'error');
    }
  }, [token, addToast]);

  useEffect(() => {
    if (token && user?.role === 'admin') {
      void loadDashboardData();
    }
  }, [token, user?.role, loadDashboardData]);

  // Form state for creating survey
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    isExternal: true,
    pointsReward: 50,
    timeEstimate: 5,
    status: 'active' as 'active' | 'inactive',
    category: 'Technology',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
  });

  const [internalQuestions, setInternalQuestions] = useState<any[]>([]);

  const [selectedPreScreeners, setSelectedPreScreeners] = useState<PreScreenerQuestion[]>([]);
  const [showPreScreenerForm, setShowPreScreenerForm] = useState(false);

  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    name: '',
    completeUrl: '',
    terminateUrl: '',
    quotaUrl: '',
  });
  const [selectedSurveyForVendor, setSelectedSurveyForVendor] = useState('');
  const [selectedVendorForLink, setSelectedVendorForLink] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully!', 'info');
    navigate('/auth');
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiPost(
        '/api/surveys',
        {
          ...formData,
          isNew: true,
          preScreener: selectedPreScreeners,
          questions: formData.isExternal ? undefined : internalQuestions,
        },
        token
      );
      await loadDashboardData();
      setFormData({
        title: '',
        description: '',
        link: '',
        isExternal: true,
        pointsReward: 50,
        timeEstimate: 5,
        status: 'active',
        category: 'Technology',
        difficulty: 'easy',
      });
      setSelectedPreScreeners([]);
      setInternalQuestions([]);
      addToast('🎉 Survey created successfully!', 'success');
      setActiveTab('surveys');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create survey', 'error');
    }
  };

  // Internal Question Handlers
  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      type: 'mcq' as const,
      question: '',
      options: ['', ''], // Default 2 options for MCQ
      required: true,
    };
    setInternalQuestions([...internalQuestions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setInternalQuestions(internalQuestions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: any) => {
    setInternalQuestions(internalQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId: string) => {
    setInternalQuestions(
      internalQuestions.map((q) => {
        if (q.id === questionId) {
          return { ...q, options: [...(q.options || []), ''] };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setInternalQuestions(
      internalQuestions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])];
          newOptions[index] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, index: number) => {
    setInternalQuestions(
      internalQuestions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])];
          newOptions.splice(index, 1);
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this survey?') || !token) return;
    try {
      await apiDelete<{ ok: boolean }>(`/api/surveys/${id}`, token);
      await loadDashboardData();
      addToast('Survey deleted successfully', 'info');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const handleToggleSurveyStatus = async (survey: Survey) => {
    if (!token) return;
    const newStatus = survey.status === 'active' ? 'inactive' : 'active';
    try {
      await apiPatch(`/api/surveys/${survey.id}`, { status: newStatus }, token);
      await loadDashboardData();
      addToast(`Survey ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`, 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to toggle status', 'error');
    }
  };

  const handleStartEdit = (survey: Survey) => {
    setEditingSurveyId(survey.id);
    setFormData({
      title: survey.title,
      description: survey.description,
      link: survey.link || '',
      isExternal: survey.isExternal,
      pointsReward: survey.pointsReward,
      timeEstimate: survey.timeEstimate,
      status: survey.status,
      category: survey.category || 'Technology',
      difficulty: survey.difficulty || 'easy',
    });
    setSelectedPreScreeners(survey.preScreener || []);
    setInternalQuestions(survey.questions || []);
    setActiveTab('edit');
  };

  const handleUpdateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingSurveyId) return;
    try {
      await apiPatch(
        `/api/surveys/${editingSurveyId}`,
        {
          ...formData,
          preScreener: selectedPreScreeners,
          questions: formData.isExternal ? undefined : internalQuestions,
        },
        token
      );
      await loadDashboardData();
      setEditingSurveyId(null);
      setActiveTab('surveys');
      addToast('Survey updated successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update survey', 'error');
    }
  };

  const togglePreScreener = (ps: PreScreenerQuestion) => {
    setSelectedPreScreeners((prev) => {
      const exists = prev.find((p) => p.id === ps.id);
      if (exists) {
        return prev.filter((p) => p.id !== ps.id);
      }
      return [...prev, ps];
    });
  };

  // Vendor handlers
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiPost(
        '/api/vendors',
        {
          name: vendorForm.name,
          redirectLinks: {
            complete: vendorForm.completeUrl,
            terminate: vendorForm.terminateUrl,
            quotaFull: vendorForm.quotaUrl,
          },
        },
        token
      );
      await loadDashboardData();
      setVendorForm({
        name: '',
        completeUrl: '',
        terminateUrl: '',
        quotaUrl: '',
      });
      addToast('🎉 Vendor added successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to add vendor', 'error');
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?') || !token) return;
    try {
      await apiDelete<{ ok: boolean }>(`/api/vendors/${id}`, token);
      await loadDashboardData();
      addToast('Vendor deleted successfully', 'info');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const handleGenerateLink = () => {
    if (!selectedSurveyForVendor || !selectedVendorForLink) {
      addToast('Please select both survey and vendor', 'error');
      return;
    }
    const link = generateVendorLink(selectedSurveyForVendor, selectedVendorForLink);
    setGeneratedLink(link);
    addToast('Link generated!', 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    addToast('Link copied to clipboard!', 'success');
  };

  const handleExportCSV = async () => {
    if (!token) return;
    try {
      const csv = await apiGetText('/api/export/responses.csv', token);
      downloadCSV(csv, `responses_${new Date().toISOString().split('T')[0]}.csv`);
      addToast('CSV exported successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Export failed', 'error');
    }
  };

  const handleExportExcel = async () => {
    if (!token) return;
    try {
      // We can use the responses state directly or fetch from API
      // Converting responses to a clean format for Excel
      const excelData = responses.map(r => ({
        ID: r.id,
        'Survey ID': r.surveyId,
        'Vendor ID': r.vendorId || 'N/A',
        'User ID': r.userId || 'N/A',
        Status: r.status,
        Timestamp: new Date(r.timestamp).toLocaleString()
      }));
      downloadExcel(excelData, `responses_${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast('Excel exported successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Export failed', 'error');
    }
  };

  const statCards = [
    {
      label: 'Total Surveys',
      value: analytics.totalSurveys,
      icon: FileText,
      variant: 'violet' as const,
    },
    {
      label: 'Active Surveys',
      value: analytics.activeSurveys,
      icon: Check,
      variant: 'green' as const,
    },
    {
      label: 'Inactive Surveys',
      value: analytics.inactiveSurveys,
      icon: X,
      variant: 'pink' as const,
    },
    {
      label: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      variant: 'yellow' as const,
      href: '/admin/users' as const,
    },
  ];

  // Calculate completes vs terminates for chart
  const completes = responses.filter((r) => r.status === 'complete').length;
  const terminates = responses.filter((r) => r.status === 'terminate').length;
  const quotaFull = responses.filter((r) => r.status === 'quota_full').length;
  const totalResponses = responses.length;

  // Survey filled over time (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const timelineData = last7Days.map(date => {
    const count = responses.filter(r => r.status === 'complete' && r.timestamp.startsWith(date)).length;
    return { date: date.split('-').slice(1).join('/'), count };
  });

  const pieData = [
    { name: 'Completes', value: completes, color: '#4ADE80' },
    { name: 'Terminates', value: terminates, color: '#F472B6' },
    { name: 'Quota Full', value: quotaFull, color: '#FACC15' },
  ].filter(d => d.value > 0);

  const vendorStatsData = vendors.map(vendor => {
    const vStats = vendorAnalytics[vendor.id] || { completes: 0, terminates: 0, quotaFull: 0 };
    return {
      name: vendor.name,
      completes: vStats.completes,
      terminates: vStats.terminates,
      quotaFull: vStats.quotaFull,
    };
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      {/* Background */}
      <DotGrid className="fixed inset-0" />
      <DecorativeBlob variant="violet" size="md" className="right-[5%] top-[10%] opacity-30" />
      <DecorativeBlob variant="pink" size="md" className="left-[5%] bottom-[10%] opacity-30" />

      {/* Sidebar + Main Content */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-r-2 border-navy/10 px-5 py-6">
          {/* Logo — centered, larger */}
          <div className="mb-10 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex justify-center mb-3 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded-xl px-1"
              aria-label="Survey Panel Go home"
            >
              <BrandLogo
                size="nav"
                className="mx-auto object-center max-h-[5.25rem] sm:max-h-24 w-full max-w-[248px]"
              />
            </button>
            <span className="font-outfit font-bold text-lg text-navy block">Admin</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${activeTab === 'dashboard'
                ? 'bg-violet text-white shadow-hard'
                : 'text-navy hover:bg-periwinkle'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('surveys')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${activeTab === 'surveys'
                ? 'bg-violet text-white shadow-hard'
                : 'text-navy hover:bg-periwinkle'
                }`}
            >
              <FileText className="w-5 h-5" />
              All Surveys
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${activeTab === 'create'
                ? 'bg-violet text-white shadow-hard'
                : 'text-navy hover:bg-periwinkle'
                }`}
            >
              <Plus className="w-5 h-5" />
              Create Survey
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${activeTab === 'vendors'
                ? 'bg-violet text-white shadow-hard'
                : 'text-navy hover:bg-periwinkle'
                }`}
            >
              <Store className="w-5 h-5" />
              Vendors
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${activeTab === 'logs'
                ? 'bg-violet text-white shadow-hard'
                : 'text-navy hover:bg-periwinkle'
                }`}
            >
              <ClipboardList className="w-5 h-5" />
              Activity Logs
            </button>
            <button
              onClick={() => setActiveTab('survey-logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${activeTab === 'survey-logs'
                ? 'bg-violet text-white shadow-hard'
                : 'text-navy hover:bg-periwinkle'
                }`}
            >
              <Activity className="w-5 h-5" />
              Survey Logs
            </button>
          </nav>

          {/* User Info */}
          <div className="pt-6 border-t-2 border-navy/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet border-2 border-navy rounded-full flex items-center justify-center">
                <span className="font-outfit font-bold text-white">{user?.name?.[0]}</span>
              </div>
              <div>
                <p className="font-jakarta font-medium text-sm text-navy">{user?.name}</p>
                <p className="font-mono text-xs text-navy-light">Administrator</p>
              </div>
            </div>
            <PlayfulButton variant="secondary" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </PlayfulButton>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="min-w-0 shrink"
                aria-label="Survey Panel Go home"
              >
                <BrandLogo size="sm" className="max-h-9 max-w-[150px] sm:max-w-[180px]" />
              </button>
              <span className="font-outfit font-bold text-lg text-navy shrink-0">Admin</span>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white border-2 border-navy rounded-full">
              <LogOut className="w-5 h-5 text-navy" />
            </button>
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden grid grid-cols-3 gap-2 mb-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'surveys', label: 'Surveys', icon: FileText },
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'vendors', label: 'Vendors', icon: Store },
              { id: 'logs', label: 'Logs', icon: ClipboardList },
              { id: 'survey-logs', label: 'Survey', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 px-2 py-3 border-2 border-navy rounded-xl font-jakarta font-medium text-xs transition-all ${activeTab === tab.id ? 'bg-violet text-white shadow-hard' : 'bg-white text-navy'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-center">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Dashboard Overview</h1>
                  <p className="font-jakarta text-navy-light">Welcome back, {user?.name?.split(' ')[0]}!</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <PlayfulButton variant="secondary" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
                    Export CSV
                  </PlayfulButton>
                  <PlayfulButton variant="primary" size="sm" onClick={handleExportExcel} leftIcon={<FileText className="w-4 h-4" />}>
                    Export Excel
                  </PlayfulButton>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {statCards.map((stat, index) => (
                  <PlayfulCard
                    key={index}
                    variant={stat.href ? 'static' : 'default'}
                    className={`p-2.5 sm:p-3 md:p-4 lg:p-5 ${stat.href ? 'cursor-pointer hover:shadow-hard-lg hover:-translate-y-0.5 transition-all' : ''}`}
                    onClick={stat.href ? () => navigate(stat.href) : undefined}
                    role={stat.href ? 'button' : undefined}
                    tabIndex={stat.href ? 0 : undefined}
                    onKeyDown={
                      stat.href
                        ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(stat.href);
                          }
                        }
                        : undefined
                    }
                    aria-label={stat.href ? `${stat.label}: open user list` : undefined}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-jakarta text-xs text-navy-light mb-1 truncate leading-tight">{stat.label}</p>
                        <p className="font-outfit font-bold text-xl sm:text-2xl md:text-3xl text-navy leading-tight">{stat.value}</p>
                        {stat.href && (
                          <p className="font-jakarta text-xs text-violet mt-1 font-medium">View →</p>
                        )}
                      </div>
                      <IconCircle variant={stat.variant} size="sm" className="shrink-0 ml-0.5 sm:ml-1 md:ml-2">
                        <stat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      </IconCircle>
                    </div>
                  </PlayfulCard>
                ))}
              </div>

              {/* Analytics Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-time Survey Timeline */}
                <PlayfulCard className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <h2 className="font-outfit font-bold text-base sm:text-lg md:text-xl text-navy mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="truncate">Survey Completions (Last 7 Days)</span>
                  </h2>
                  <div className="h-[120px] sm:h-[150px] md:h-[200px] lg:h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748B', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748B', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '2px solid #000',
                            boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#7B61FF"
                          strokeWidth={3}
                          dot={{ fill: '#7B61FF', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </PlayfulCard>

                {/* Response Mix */}
                <PlayfulCard className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <h2 className="font-outfit font-bold text-base sm:text-lg md:text-xl text-navy mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="truncate">Response Distribution</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-3">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between p-2 bg-periwinkle/30 border-2 border-navy/5 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="font-jakarta text-sm font-medium text-navy">{d.name}</span>
                          </div>
                          <span className="font-outfit font-bold text-navy">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PlayfulCard>

                {/* Vendor Performance Chart */}
                <PlayfulCard className="p-3 sm:p-4 md:p-5 lg:p-6 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2">
                    <h2 className="font-outfit font-bold text-base sm:text-lg md:text-xl text-navy flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      <span className="truncate">Vendor Real-time Analytics</span>
                    </h2>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green rounded-full" />
                        <span className="text-xs font-jakarta font-medium text-navy-light hidden sm:inline">Completes</span>
                        <span className="text-xs font-jakarta font-medium text-navy-light sm:hidden">C</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-pink rounded-full" />
                        <span className="text-xs font-jakarta font-medium text-navy-light hidden sm:inline">Terminates</span>
                        <span className="text-xs font-jakarta font-medium text-navy-light sm:hidden">T</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[120px] sm:h-[150px] md:h-[200px] lg:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vendorStatsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748B', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748B', fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: '#F1F5F9' }}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '2px solid #000',
                          }}
                        />
                        <Bar dataKey="completes" fill="#4ADE80" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="terminates" fill="#F472B6" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="quotaFull" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </PlayfulCard>
              </div>

              {/* Recent Activity */}
              <PlayfulCard className="p-6">
                <h2 className="font-outfit font-bold text-xl text-navy mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {activityLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-periwinkle/30 border-2 border-navy/10 rounded-xl">
                      <div className={`w-2 h-2 mt-2 rounded-full ${log.type === 'success' ? 'bg-green' :
                        log.type === 'error' ? 'bg-pink' :
                          log.type === 'warning' ? 'bg-yellow' : 'bg-violet'
                        }`} />
                      <div className="flex-1">
                        <p className="font-jakarta text-sm text-navy">{log.message}</p>
                        <p className="font-mono text-xs text-navy-light">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </PlayfulCard>

              {/* System Overview */}
              <PlayfulCard className="p-6">
                <h2 className="font-outfit font-bold text-xl text-navy mb-4">System Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-navy/10">
                    <span className="font-jakarta text-navy">Total Points Distributed</span>
                    <span className="font-outfit font-bold text-violet">
                      {analytics.totalPointsDistributed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-navy/10">
                    <span className="font-jakarta text-navy">Administrators</span>
                    <span className="font-outfit font-bold text-navy">{analytics.totalAdmins}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-jakarta text-navy">Survey Success Rate</span>
                    <span className="font-outfit font-bold text-green-600">
                      {totalResponses > 0 ? ((completes / totalResponses) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </PlayfulCard>
            </div>
          )}

          {/* SURVEYS LIST TAB */}
          {activeTab === 'surveys' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-outfit font-bold text-3xl text-navy mb-2">All Surveys</h1>
                  <p className="font-jakarta text-navy-light">Manage your surveys</p>
                </div>
                <PlayfulButton variant="primary" onClick={() => setActiveTab('create')} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </PlayfulButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {surveys.map((survey) => (
                  <PlayfulCard key={survey.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <PlayfulBadge variant={survey.status === 'active' ? 'green' : 'pink'} size="sm">
                        {survey.status}
                      </PlayfulBadge>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleSurveyStatus(survey)}
                          className="p-2 hover:bg-yellow/30 rounded-xl transition-colors"
                          title={survey.status === 'active' ? 'Pause Survey' : 'Resume Survey'}
                        >
                          {survey.status === 'active' ? (
                            <Pause className="w-4 h-4 text-navy" />
                          ) : (
                            <Play className="w-4 h-4 text-navy" />
                          )}
                        </button>
                        <button
                          onClick={() => handleStartEdit(survey)}
                          className="p-2 hover:bg-violet/30 rounded-xl transition-colors"
                          title="Edit Survey"
                        >
                          <Pencil className="w-4 h-4 text-navy" />
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="p-2 hover:bg-pink/30 rounded-xl transition-colors"
                          title="Delete Survey"
                        >
                          <Trash2 className="w-4 h-4 text-navy" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-outfit font-bold text-lg text-navy mb-2">{survey.title}</h3>
                    <p className="font-jakarta text-sm text-navy-light mb-4 line-clamp-2">
                      {survey.description}
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-navy-light" />
                        <span className="font-mono text-xs text-navy-light">{survey.timeEstimate}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-violet" />
                        <span className="font-mono text-xs font-bold text-violet">{survey.pointsReward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-navy-light" />
                        <span className="font-mono text-xs text-navy-light">{survey.isExternal ? 'External' : 'Internal'}</span>
                      </div>
                    </div>

                    {survey.isExternal ? (
                      <a
                        href={survey.link ? (survey.link.startsWith('http') ? survey.link : `https://${survey.link}`) : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-periwinkle border-2 border-navy rounded-pill font-jakarta font-medium text-sm text-navy hover:bg-violet hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View External Link
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(`/survey/${survey.id}?preview=true`)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-lavender/30 border-2 border-navy rounded-pill font-jakarta font-medium text-sm text-navy hover:bg-violet hover:text-white transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Preview Internal Survey
                      </button>
                    )}
                  </PlayfulCard>
                ))}
              </div>
            </div>
          )}

          {/* CREATE SURVEY TAB */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Create New Survey</h1>
                <p className="font-jakarta text-navy-light">Fill in the details below</p>
              </div>

              <form onSubmit={handleCreateSurvey} className="space-y-6">
                <PlayfulCard className="p-6">
                  <h2 className="font-outfit font-bold text-xl text-navy mb-6">Basic Information</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isExternal: true })}
                        className={`flex items-center justify-center gap-2 p-4 border-2 border-navy rounded-2xl font-jakarta font-bold transition-all ${formData.isExternal
                          ? 'bg-violet text-white shadow-hard scale-105'
                          : 'bg-white text-navy hover:bg-periwinkle'
                          }`}
                      >
                        <ExternalLink className="w-5 h-5" />
                        External Survey
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isExternal: false })}
                        className={`flex items-center justify-center gap-2 p-4 border-2 border-navy rounded-2xl font-jakarta font-bold transition-all ${!formData.isExternal
                          ? 'bg-violet text-white shadow-hard scale-105'
                          : 'bg-white text-navy hover:bg-periwinkle'
                          }`}
                      >
                        <FileText className="w-5 h-5" />
                        Internal Survey
                      </button>
                    </div>

                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                        Survey Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Tech Gadgets Survey"
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the survey..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all resize-none"
                        required
                      />
                    </div>

                    {formData.isExternal && (
                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          External Survey Link *
                        </label>
                        <input
                          type="url"
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          placeholder="https://example.com/survey"
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                          required={formData.isExternal}
                        />
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Points Reward *
                        </label>
                        <input
                          type="number"
                          value={formData.pointsReward}
                          onChange={(e) =>
                            setFormData({ ...formData, pointsReward: Number(e.target.value) })
                          }
                          min={1}
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Time Estimate (minutes) *
                        </label>
                        <input
                          type="number"
                          value={formData.timeEstimate}
                          onChange={(e) =>
                            setFormData({ ...formData, timeEstimate: Number(e.target.value) })
                          }
                          min={1}
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                          }
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        >
                          <option value="Technology">Technology</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Health & Fitness">Health & Fitness</option>
                          <option value="Travel">Travel</option>
                          <option value="Finance">Finance</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Difficulty
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) =>
                            setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
                          }
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </PlayfulCard>

                {/* Internal Questions Section */}
                {!formData.isExternal && (
                  <PlayfulCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-outfit font-bold text-xl text-navy">Survey Questions</h2>
                        <p className="font-jakarta text-sm text-navy-light">
                          Add the questions for your internal survey
                        </p>
                      </div>
                      <PlayfulButton type="button" size="sm" onClick={addQuestion} leftIcon={<Plus className="w-4 h-4" />}>
                        Add Question
                      </PlayfulButton>
                    </div>

                    <div className="space-y-6">
                      {internalQuestions.length === 0 ? (
                        <div className="text-center py-10 bg-periwinkle/30 border-2 border-dashed border-navy/20 rounded-2xl">
                          <p className="font-jakarta text-navy-light">No questions added yet. Click "Add Question" to start.</p>
                        </div>
                      ) : (
                        internalQuestions.map((q, qIndex) => (
                          <div key={q.id} className="p-5 bg-white border-2 border-navy rounded-2xl shadow-hard transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <span className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center font-outfit font-bold text-sm">
                                {qIndex + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                className="p-2 hover:bg-pink/20 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-pink-600" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="font-outfit font-semibold text-xs text-navy-light mb-1 block uppercase tracking-wider">
                                    Question Type
                                  </label>
                                  <select
                                    value={q.type}
                                    onChange={(e) => updateQuestion(q.id, { type: e.target.value })}
                                    className="w-full px-4 py-2 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none transition-all"
                                  >
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="text">Short Answer</option>
                                    <option value="rating">Rating (1-5)</option>
                                  </select>
                                </div>
                                <div className="flex items-end pb-2">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 border-2 border-navy rounded flex items-center justify-center transition-all ${q.required ? 'bg-violet' : 'bg-white'}`}>
                                      {q.required && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={q.required}
                                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                      className="hidden"
                                    />
                                    <span className="font-jakarta text-sm text-navy font-medium group-hover:text-violet">Required Question</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="font-outfit font-semibold text-xs text-navy-light mb-1 block uppercase tracking-wider">
                                  Question Text
                                </label>
                                <input
                                  type="text"
                                  value={q.question}
                                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                                  placeholder="e.g., How often do you use our service?"
                                  className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:border-violet transition-all"
                                />
                              </div>

                              {q.type === 'mcq' && (
                                <div className="space-y-3 pt-2">
                                  <label className="font-outfit font-semibold text-xs text-navy-light mb-1 block uppercase tracking-wider">
                                    Options
                                  </label>
                                  <div className="grid gap-2">
                                    {q.options?.map((option: string, oIndex: number) => (
                                      <div key={oIndex} className="flex gap-2">
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                                          placeholder={`Option ${oIndex + 1}`}
                                          className="flex-1 px-4 py-2 bg-periwinkle/20 border-2 border-navy/20 rounded-xl font-jakarta text-sm text-navy focus:border-violet focus:outline-none transition-all"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeOption(q.id, oIndex)}
                                          disabled={q.options.length <= 1}
                                          className="p-2 hover:bg-pink/10 text-navy-light hover:text-pink-600 disabled:opacity-30 transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addOption(q.id)}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-navy/20 rounded-xl font-jakarta text-xs text-navy-light hover:border-violet hover:text-violet transition-all"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Option
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PlayfulCard>
                )}

                {/* Pre-Screener Section */}
                <PlayfulCard className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowPreScreenerForm(!showPreScreenerForm)}
                  >
                    <div>
                      <h2 className="font-outfit font-bold text-xl text-navy">Pre-Screener Questions</h2>
                      <p className="font-jakarta text-sm text-navy-light">
                        Filter participants based on criteria
                      </p>
                    </div>
                    <button type="button" className="p-2 hover:bg-periwinkle rounded-xl transition-colors">
                      {showPreScreenerForm ? (
                        <ChevronUp className="w-5 h-5 text-navy" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy" />
                      )}
                    </button>
                  </div>

                  {showPreScreenerForm && (
                    <div className="mt-6 space-y-3">
                      <p className="font-jakarta text-sm text-navy-light mb-4">
                        Select questions to filter participants:
                      </p>
                      {templateList.map((ps) => (
                        <button
                          key={ps.id}
                          type="button"
                          onClick={() => togglePreScreener(ps)}
                          className={`w-full flex items-center gap-4 p-4 border-2 border-navy rounded-2xl transition-all text-left ${selectedPreScreeners.find((p) => p.id === ps.id)
                            ? 'bg-violet text-white shadow-hard'
                            : 'bg-white hover:bg-periwinkle'
                            }`}
                        >
                          <div
                            className={`w-6 h-6 border-2 border-navy rounded flex items-center justify-center ${selectedPreScreeners.find((p) => p.id === ps.id) ? 'bg-white' : 'bg-white'
                              }`}
                          >
                            {selectedPreScreeners.find((p) => p.id === ps.id) && (
                              <Check className="w-4 h-4 text-violet" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-jakarta font-medium ${selectedPreScreeners.find((p) => p.id === ps.id) ? 'text-white' : 'text-navy'
                                }`}
                            >
                              {ps.question}
                            </p>
                            <p
                              className={`font-mono text-xs ${selectedPreScreeners.find((p) => p.id === ps.id)
                                ? 'text-white/70'
                                : 'text-navy-light'
                                }`}
                            >
                              {ps.condition} {String(ps.value)}
                            </p>
                          </div>
                        </button>
                      ))}

                      {selectedPreScreeners.length > 0 && (
                        <div className="mt-4 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
                          <p className="font-jakarta text-sm text-navy">
                            <span className="font-semibold">{selectedPreScreeners.length}</span> pre-screener
                            question(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </PlayfulCard>

                {/* Submit */}
                <div className="flex gap-4">
                  <PlayfulButton type="submit" variant="primary" size="lg" leftIcon={<Save className="w-5 h-5" />}>
                    Create Survey
                  </PlayfulButton>
                  <PlayfulButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setActiveTab('surveys')}
                  >
                    Cancel
                  </PlayfulButton>
                </div>
              </form>
            </div>
          )}

          {/* EDIT SURVEY TAB */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Edit Survey</h1>
                  <p className="font-jakarta text-navy-light">Modify your survey details</p>
                </div>
                <PlayfulButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingSurveyId(null);
                    setActiveTab('surveys');
                  }}
                  leftIcon={<X className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Cancel Edit
                </PlayfulButton>
              </div>

              <form onSubmit={handleUpdateSurvey} className="space-y-6">
                <PlayfulCard className="p-6">
                  <h2 className="font-outfit font-bold text-xl text-navy mb-6">Basic Information</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <button
                        type="button"
                        disabled
                        className={`flex items-center justify-center gap-2 p-4 border-2 border-navy rounded-2xl font-jakarta font-bold opacity-50 cursor-not-allowed ${formData.isExternal
                          ? 'bg-violet text-white shadow-hard'
                          : 'bg-white text-navy'
                          }`}
                      >
                        {formData.isExternal ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        {formData.isExternal ? 'External Survey' : 'Internal Survey'} (Locked Type)
                      </button>
                    </div>

                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                        Survey Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF]"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] resize-none"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Points Reward *
                        </label>
                        <input
                          type="number"
                          value={formData.pointsReward}
                          onChange={(e) => setFormData({ ...formData, pointsReward: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl focus:outline-none focus:shadow-[4px_4px_0_#7B61FF]"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-outfit font-semibold text-sm text-navy mb-2 block">
                          Time Estimate (min) *
                        </label>
                        <input
                          type="number"
                          value={formData.timeEstimate}
                          onChange={(e) => setFormData({ ...formData, timeEstimate: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl focus:outline-none focus:shadow-[4px_4px_0_#7B61FF]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </PlayfulCard>

                {/* Internal Questions Section */}
                {!formData.isExternal && (
                  <PlayfulCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-outfit font-bold text-xl text-navy">Survey Questions</h2>
                        <p className="font-jakarta text-sm text-navy-light">
                          Add the questions for your internal survey
                        </p>
                      </div>
                      <PlayfulButton type="button" size="sm" onClick={addQuestion} leftIcon={<Plus className="w-4 h-4" />}>
                        Add Question
                      </PlayfulButton>
                    </div>

                    <div className="space-y-6">
                      {internalQuestions.length === 0 ? (
                        <div className="text-center py-10 bg-periwinkle/30 border-2 border-dashed border-navy/20 rounded-2xl">
                          <p className="font-jakarta text-navy-light">No questions added yet. Click "Add Question" to start.</p>
                        </div>
                      ) : (
                        internalQuestions.map((q, qIndex) => (
                          <div key={q.id} className="p-5 bg-white border-2 border-navy rounded-2xl shadow-hard transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <span className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center font-outfit font-bold text-sm">
                                {qIndex + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                className="p-2 hover:bg-pink/20 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-pink-600" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="font-outfit font-semibold text-xs text-navy-light mb-1 block uppercase tracking-wider">
                                    Question Type
                                  </label>
                                  <select
                                    value={q.type}
                                    onChange={(e) => updateQuestion(q.id, { type: e.target.value })}
                                    className="w-full px-4 py-2 bg-periwinkle/30 border-2 border-navy rounded-xl font-jakarta text-sm text-navy focus:outline-none transition-all"
                                  >
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="text">Short Answer</option>
                                    <option value="rating">Rating (1-5)</option>
                                  </select>
                                </div>
                                <div className="flex items-end pb-2">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 border-2 border-navy rounded flex items-center justify-center transition-all ${q.required ? 'bg-violet' : 'bg-white'}`}>
                                      {q.required && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={q.required}
                                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                      className="hidden"
                                    />
                                    <span className="font-jakarta text-sm text-navy font-medium group-hover:text-violet">Required Question</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="font-outfit font-semibold text-xs text-navy-light mb-1 block uppercase tracking-wider">
                                  Question Text
                                </label>
                                <input
                                  type="text"
                                  value={q.question}
                                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                                  placeholder="e.g., How often do you use our service?"
                                  className="w-full px-4 py-3 bg-white border-2 border-navy rounded-xl font-jakarta text-base text-navy placeholder:text-navy/30 focus:outline-none focus:border-violet transition-all"
                                />
                              </div>

                              {q.type === 'mcq' && (
                                <div className="space-y-3 pt-2">
                                  <label className="font-outfit font-semibold text-xs text-navy-light mb-1 block uppercase tracking-wider">
                                    Options
                                  </label>
                                  <div className="grid gap-2">
                                    {q.options?.map((option: string, oIndex: number) => (
                                      <div key={oIndex} className="flex gap-2">
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                                          placeholder={`Option ${oIndex + 1}`}
                                          className="flex-1 px-4 py-2 bg-periwinkle/20 border-2 border-navy/20 rounded-xl font-jakarta text-sm text-navy focus:border-violet focus:outline-none transition-all"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeOption(q.id, oIndex)}
                                          disabled={q.options.length <= 1}
                                          className="p-2 hover:bg-pink/10 text-navy-light hover:text-pink-600 disabled:opacity-30 transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addOption(q.id)}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-navy/20 rounded-xl font-jakarta text-xs text-navy-light hover:border-violet hover:text-violet transition-all"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Option
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PlayfulCard>
                )}

                {/* Pre-Screener Section */}
                <PlayfulCard className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowPreScreenerForm(!showPreScreenerForm)}
                  >
                    <div>
                      <h2 className="font-outfit font-bold text-xl text-navy">Pre-Screener Questions</h2>
                      <p className="font-jakarta text-sm text-navy-light">
                        Filter participants based on criteria
                      </p>
                    </div>
                    <button type="button" className="p-2 hover:bg-periwinkle rounded-xl transition-colors">
                      {showPreScreenerForm ? (
                        <ChevronUp className="w-5 h-5 text-navy" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy" />
                      )}
                    </button>
                  </div>

                  {showPreScreenerForm && (
                    <div className="mt-6 space-y-3">
                      <p className="font-jakarta text-sm text-navy-light mb-4">
                        Select questions to filter participants:
                      </p>
                      {templateList.map((ps) => (
                        <button
                          key={ps.id}
                          type="button"
                          onClick={() => togglePreScreener(ps)}
                          className={`w-full flex items-center gap-4 p-4 border-2 border-navy rounded-2xl transition-all text-left ${selectedPreScreeners.find((p) => p.id === ps.id)
                            ? 'bg-violet text-white shadow-hard'
                            : 'bg-white hover:bg-periwinkle'
                            }`}
                        >
                          <div
                            className={`w-6 h-6 border-2 border-navy rounded flex items-center justify-center ${selectedPreScreeners.find((p) => p.id === ps.id) ? 'bg-white' : 'bg-white'
                              }`}
                          >
                            {selectedPreScreeners.find((p) => p.id === ps.id) && (
                              <Check className="w-4 h-4 text-violet" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-jakarta font-medium ${selectedPreScreeners.find((p) => p.id === ps.id) ? 'text-white' : 'text-navy'
                                }`}
                            >
                              {ps.question}
                            </p>
                            <p
                              className={`font-mono text-xs ${selectedPreScreeners.find((p) => p.id === ps.id)
                                ? 'text-white/70'
                                : 'text-navy-light'
                                }`}
                            >
                              {ps.condition} {String(ps.value)}
                            </p>
                          </div>
                        </button>
                      ))}

                      {selectedPreScreeners.length > 0 && (
                        <div className="mt-4 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
                          <p className="font-jakarta text-sm text-navy">
                            <span className="font-semibold">{selectedPreScreeners.length}</span> pre-screener
                            question(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </PlayfulCard>

                <div className="flex gap-4">
                  <PlayfulButton type="submit" variant="primary" size="lg" leftIcon={<Save className="w-5 h-5" />}>
                    Update Survey
                  </PlayfulButton>
                  <PlayfulButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setEditingSurveyId(null);
                      setActiveTab('surveys');
                    }}
                  >
                    Cancel
                  </PlayfulButton>
                </div>
              </form>
            </div>
          )}

          {/* VENDORS TAB */}
          {activeTab === 'vendors' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Vendor Management</h1>
                <p className="font-jakarta text-navy-light">Manage vendors and generate tracking links</p>
              </div>

              {/* Generate Vendor Link */}
              <PlayfulCard className="p-6">
                <h2 className="font-outfit font-bold text-xl text-navy mb-4 flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Generate Vendor Link
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-outfit font-semibold text-sm text-navy mb-2 block">Select Survey</label>
                    <select
                      value={selectedSurveyForVendor}
                      onChange={(e) => setSelectedSurveyForVendor(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                    >
                      <option value="">Choose a survey...</option>
                      {surveys.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-outfit font-semibold text-sm text-navy mb-2 block">Select Vendor</label>
                    <select
                      value={selectedVendorForLink}
                      onChange={(e) => setSelectedVendorForLink(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                    >
                      <option value="">Choose a vendor...</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <PlayfulButton variant="primary" onClick={handleGenerateLink} className="mb-4">
                  Generate Link
                </PlayfulButton>

                {generatedLink && (
                  <div className="p-4 bg-lavender/50 border-2 border-navy rounded-2xl">
                    <p className="font-mono text-sm text-navy break-all mb-3">{generatedLink}</p>
                    <div className="flex gap-2">
                      <PlayfulButton variant="secondary" size="sm" onClick={handleCopyLink} leftIcon={<Copy className="w-4 h-4" />}>
                        Copy Link
                      </PlayfulButton>
                      <PlayfulButton variant="accent" size="sm" leftIcon={<QrCode className="w-4 h-4" />}>
                        QR Code
                      </PlayfulButton>
                    </div>
                  </div>
                )}
              </PlayfulCard>

              {/* Add Vendor Form */}
              <PlayfulCard className="p-6">
                <h2 className="font-outfit font-bold text-xl text-navy mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Vendor
                </h2>
                <form onSubmit={handleCreateVendor} className="space-y-4">
                  <div>
                    <label className="font-outfit font-semibold text-sm text-navy mb-2 block">Vendor Name *</label>
                    <input
                      type="text"
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      placeholder="e.g., Vendor A"
                      className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">Complete URL *</label>
                      <input
                        type="url"
                        value={vendorForm.completeUrl}
                        onChange={(e) => setVendorForm({ ...vendorForm, completeUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">Terminate URL *</label>
                      <input
                        type="url"
                        value={vendorForm.terminateUrl}
                        onChange={(e) => setVendorForm({ ...vendorForm, terminateUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-outfit font-semibold text-sm text-navy mb-2 block">Quota Full URL *</label>
                      <input
                        type="url"
                        value={vendorForm.quotaUrl}
                        onChange={(e) => setVendorForm({ ...vendorForm, quotaUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl font-jakarta text-base text-navy placeholder:text-navy/50 focus:outline-none focus:shadow-[4px_4px_0_#7B61FF] transition-all"
                        required
                      />
                    </div>
                  </div>
                  <PlayfulButton type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Add Vendor
                  </PlayfulButton>
                </form>
              </PlayfulCard>

              {/* Vendor List */}
              <div>
                <h2 className="font-outfit font-bold text-xl text-navy mb-4">All Vendors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendors.map((vendor) => {
                    const stats = vendorAnalytics[vendor.id] || { completes: 0, terminates: 0, quotaFull: 0 };
                    return (
                      <PlayfulCard key={vendor.id} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconCircle variant="violet" size="md">
                              <Store className="w-5 h-5" />
                            </IconCircle>
                            <h3 className="font-outfit font-bold text-lg text-navy">{vendor.name}</h3>
                          </div>
                          <button
                            onClick={() => handleDeleteVendor(vendor.id)}
                            className="p-2 hover:bg-pink/30 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-navy" />
                          </button>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                            <div className="flex items-center gap-2 shrink-0">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-jakarta text-navy-light">Complete:</span>
                            </div>
                            <span className="font-mono text-xs text-navy break-all">{vendor.redirectLinks.complete}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                            <div className="flex items-center gap-2 shrink-0">
                              <XCircle className="w-4 h-4 text-pink-600" />
                              <span className="font-jakarta text-navy-light">Terminate:</span>
                            </div>
                            <span className="font-mono text-xs text-navy break-all">{vendor.redirectLinks.terminate}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                            <div className="flex items-center gap-2 shrink-0">
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              <span className="font-jakarta text-navy-light">Quota Full:</span>
                            </div>
                            <span className="font-mono text-xs text-navy break-all">{vendor.redirectLinks.quotaFull}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-3 border-t border-navy/10">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green rounded-full" />
                            <span className="font-mono text-xs text-navy">{stats.completes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-pink rounded-full" />
                            <span className="font-mono text-xs text-navy">{stats.terminates}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow rounded-full" />
                            <span className="font-mono text-xs text-navy">{stats.quotaFull}</span>
                          </div>
                        </div>
                      </PlayfulCard>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-outfit font-bold text-3xl text-navy mb-2">Activity Logs</h1>
                  <p className="font-jakarta text-navy-light">Real-time system activities and user interactions</p>
                </div>
                <PlayfulButton variant="secondary" size="sm" onClick={loadDashboardData} leftIcon={<Activity className="w-4 h-4" />} className="w-full sm:w-auto">
                  Refresh Logs
                </PlayfulButton>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {activityLogs.length === 0 ? (
                  <PlayfulCard className="p-6 text-center">
                    <p className="font-jakarta text-navy-light italic">No logs found in the last batch.</p>
                  </PlayfulCard>
                ) : (
                  activityLogs.map((log) => (
                    <PlayfulCard key={log.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 mt-1.5 rounded-full shrink-0 ${log.type === 'success' ? 'bg-green' :
                          log.type === 'error' ? 'bg-pink' :
                            log.type === 'warning' ? 'bg-yellow' : 'bg-violet'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-jakarta text-sm text-navy font-medium mb-2">{log.message}</p>
                          <div className="flex items-center justify-between">
                            <PlayfulBadge
                              variant={
                                log.type === 'success' ? 'green' :
                                  log.type === 'error' ? 'pink' :
                                    log.type === 'warning' ? 'yellow' : 'violet'
                              }
                              size="sm"
                            >
                              {log.type}
                            </PlayfulBadge>
                            <span className="font-mono text-xs text-navy-light">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </PlayfulCard>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <PlayfulCard className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead>
                        <tr className="bg-periwinkle/30 border-b-2 border-navy/10">
                          <th className="px-6 py-4 font-outfit font-bold text-navy uppercase tracking-wider text-xs">Event</th>
                          <th className="px-6 py-4 font-outfit font-bold text-navy uppercase tracking-wider text-xs">Type</th>
                          <th className="px-6 py-4 font-outfit font-bold text-navy uppercase tracking-wider text-xs">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy/5">
                        {activityLogs.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-10 text-center text-navy-light font-jakarta italic">
                              No logs found in the last batch.
                            </td>
                          </tr>
                        ) : (
                          activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-periwinkle/10 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-jakarta text-sm text-navy font-medium">{log.message}</p>
                              </td>
                              <td className="px-6 py-4">
                                <PlayfulBadge
                                  variant={
                                    log.type === 'success' ? 'green' :
                                      log.type === 'error' ? 'pink' :
                                        log.type === 'warning' ? 'yellow' : 'violet'
                                  }
                                  size="sm"
                                >
                                  {log.type}
                                </PlayfulBadge>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs text-navy-light">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </PlayfulCard>
              </div>
            </div>
          )}

          {/* SURVEY LOGS TAB */}
          {activeTab === 'survey-logs' && (
            <SurveyLogs />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
