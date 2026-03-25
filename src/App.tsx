import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { AdminRoute, UserRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage, AuthPage, DashboardPage, SurveyPage, RewardsPage, InternalSurveyPage, ServicesPage, ServiceDetailPage, BlogPage, AboutPage, BlogDetailPage, CountryDetailPage, CountryHeroSection, SuccessPage, TerminatedPage, QuotaFullPage, SecurityBlockPage, VendorSurveyPage } from '@/pages';
import VendorLitePage from '@/pages/VendorLitePage';
import VendorSurveyPublicPage from '@/pages/VendorSurveyPublicPage';
import SurveyResult from '@/pages/SurveyResult';
import SurveySuccess from '@/pages/SurveySuccess';
import SurveyTerminated from '@/pages/SurveyTerminated';
import SurveyQuota from '@/pages/SurveyQuota';
import SurveySecurity from '@/pages/SurveySecurity';
import { WhatsAppFloat } from '@/components/ui/playful';
import PreScreenerPage from '@/pages/PreScreenerPage';
import AdminPage from '@/pages/AdminPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminPanel from '@/pages/AdminPanel';
import VendorEntryPage from '@/pages/VendorEntryPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideWhatsApp = location.pathname.startsWith('/auth');

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/global" element={<CountryHeroSection />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/start" element={<VendorEntryPage />} />
        <Route path="/s/:token" element={<VendorSurveyPage />} />
        <Route path="/v/:token" element={<VendorSurveyPublicPage />} />
        <Route path="/vendor-lite" element={<VendorLitePage />} />
        <Route path="/survey-result/success" element={<SurveySuccess />} />
        <Route path="/survey-result/terminated" element={<SurveyTerminated />} />
        <Route path="/survey-result/quota-full" element={<SurveyQuota />} />
        <Route path="/survey-result/security" element={<SurveySecurity />} />
        {/* Test route */}
        <Route path="/test" element={<h1 style={{ color: "black" }}>TEST ROUTE WORKS</h1>} />
        {/* Dynamic route temporarily removed for testing */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/country/:country" element={<CountryDetailPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/terminated" element={<TerminatedPage />} />
        <Route path="/quota-full" element={<QuotaFullPage />} />
        <Route path="/security-block" element={<SecurityBlockPage />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <DashboardPage />
            </UserRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <UserRoute>
              <RewardsPage />
            </UserRoute>
          }
        />
        <Route
          path="/survey/:surveyId"
          element={
            <UserRoute>
              <SurveyPage />
            </UserRoute>
          }
        />
        <Route
          path="/survey/:surveyId/precheck"
          element={
            <UserRoute>
              <PreScreenerPage />
            </UserRoute>
          }
        />
        <Route
          path="/survey/:surveyId/take"
          element={
            <UserRoute>
              <InternalSurveyPage />
            </UserRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-panel"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideWhatsApp && <WhatsAppFloat />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
