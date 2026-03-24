import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Plus,
  Store,
  ClipboardList,
  Activity,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { PlayfulButton } from '@/components/ui/playful';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { DecorativeBlob, DotGrid } from '@/components/decorations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = "Admin Panel", 
  subtitle = "Manage your survey system" 
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully!', 'info');
    navigate('/auth');
  };

  const handleNavigation = (path: string, tab?: string) => {
    if (tab) {
      // For admin tabs, navigate to /admin with tab parameter
      navigate(`${path}?tab=${tab}`);
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', tab: 'dashboard' },
    { id: 'surveys', label: 'All Surveys', icon: FileText, path: '/admin', tab: 'surveys' },
    { id: 'create', label: 'Create Survey', icon: Plus, path: '/admin', tab: 'create' },
    { id: 'vendors', label: 'Vendors', icon: Store, path: '/admin', tab: 'vendors' },
    { id: 'logs', label: 'Activity Logs', icon: ClipboardList, path: '/admin', tab: 'logs' },
    { id: 'survey-logs', label: 'Survey Logs', icon: Activity, path: '/admin', tab: 'survey-logs' },
    { id: 'redirect-analytics', label: 'Redirect Analytics', icon: BarChart3, path: '/admin', tab: 'redirect-analytics' },
    { id: 'admin-panel', label: 'Admin Panel', icon: LayoutDashboard, path: '/admin-panel' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      {/* Background */}
      <DotGrid className="fixed inset-0" />
      <DecorativeBlob variant="violet" size="md" className="right-[5%] top-[10%] opacity-30" />
      <DecorativeBlob variant="pink" size="md" className="left-[5%] bottom-[10%] opacity-30" />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar + Main Content */}
      <div className="hidden lg:flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="flex flex-col w-72 shrink-0 bg-white border-r-2 border-navy/10 px-5 py-6">
          {/* Logo */}
          <div className="mb-10 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex justify-center mb-3 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded-xl px-1"
              aria-label="Survey Panel Go home"
            >
              <BrandLogo
                size="nav"
                className="mx-auto object-center max-h-[5.25rem] w-full max-w-[248px]"
              />
            </button>
            <span className="font-outfit font-bold text-lg text-navy block">Admin</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${
                  item.id === 'admin-panel' 
                    ? 'bg-violet text-white shadow-hard'
                    : 'text-navy hover:bg-periwinkle'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop User Info */}
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
        <main className="flex-1 flex flex-col min-h-0">
          {/* Page Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="font-outfit font-bold text-3xl text-navy mb-2">{title}</h1>
              <p className="font-jakarta text-navy-light">{subtitle}</p>
            </div>

            {/* Children Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between p-5 border-b border-navy/10">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" className="max-h-9 max-w-[150px]" />
                <span className="font-outfit font-bold text-lg text-navy">Admin</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
              >
                <X className="w-4 h-4 text-navy" />
              </button>
            </div>

            {/* Mobile Sidebar Navigation */}
            <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path, item.tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-jakarta font-medium transition-all ${
                    item.id === 'admin-panel' 
                      ? 'bg-violet text-white shadow-hard'
                      : 'text-navy hover:bg-periwinkle'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Sidebar Footer */}
            <div className="p-5 border-t border-navy/10">
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
          </div>
        </div>

        {/* Mobile Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Mobile Header */}
          <header className="flex items-center justify-between p-4 bg-white border-b border-navy/10">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-navy" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <BrandLogo size="sm" className="max-h-9 max-w-[150px]" />
                <span className="font-outfit font-bold text-lg text-navy shrink-0">Admin</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white border-2 border-navy rounded-full">
              <LogOut className="w-5 h-5 text-navy" />
            </button>
          </header>

          {/* Page Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="font-outfit font-bold text-3xl text-navy mb-2">{title}</h1>
              <p className="font-jakarta text-navy-light">{subtitle}</p>
            </div>

            {/* Children Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
