import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Survey, Vendor } from '@/types';
import { apiGet } from '@/lib/api';
import { PlayfulCard } from '@/components/ui/playful';
import { DotGrid } from '@/components/decorations';
import { useToast } from '@/hooks/useToast';
import { storeVendorSession } from '@/lib/vendorSession';
import { BrandLogo } from '@/components/brand/BrandLogo';

const VendorEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const surveyId = searchParams.get('survey');
  const vendorId = searchParams.get('vendor');
  const urlUid = searchParams.get('uid');
  const pid = searchParams.get('pid');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!surveyId) {
        addToast('Invalid survey link', 'error');
        navigate('/');
        return;
      }

      // Generate UID if not present in URL
      let uid = urlUid;
      if (!uid) {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 15);
        uid = `${timestamp}_${randomStr}`;
        
        // Create new URL with UID and redirect
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('uid', uid);
        if (!pid && surveyId) {
          currentUrl.searchParams.set('pid', surveyId);
        }
        
        window.location.href = currentUrl.toString();
        return;
      }

      try {
        const { survey } = await apiGet<{ survey: Survey }>(`/api/surveys/${surveyId}`);
        if (cancelled || !survey) {
          addToast('Invalid survey link', 'error');
          navigate('/');
          return;
        }

        if (vendorId) {
          try {
            const { vendors } = await apiGet<{ vendors: Vendor[] }>('/api/vendors');
            const vendor = vendors.find((v) => v.id === vendorId);
            if (!vendor) {
              addToast('Invalid vendor', 'error');
              navigate('/');
              return;
            }
            storeVendorSession(vendorId);
            addToast(`Redirecting via ${vendor.name}...`, 'info');
          } catch {
            addToast('Invalid vendor', 'error');
            navigate('/');
            return;
          }
        }

        // Store all required identifiers in sessionStorage for later use
        sessionStorage.setItem('surveypanelgo_uid', uid);
        sessionStorage.setItem('surveypanelgo_pid', pid || surveyId);
        if (vendorId) {
          sessionStorage.setItem('surveypanelgo_vendorId', vendorId);
        }
        
        // Allow proceeding without login for all surveys
        sessionStorage.setItem('surveypanelgo_redirect', `/survey/${surveyId}/precheck`);
        if (vendorId) {
          sessionStorage.setItem('surveypanelgo_vendor_flow', 'true');
        }
        
        // Navigate with ALL query parameters preserved
        const precheckParams = new URLSearchParams();
        precheckParams.set('survey', surveyId);
        if (uid) precheckParams.set('uid', uid);
        if (pid) precheckParams.set('pid', pid);
        if (vendorId) precheckParams.set('vendor', vendorId);
        
        navigate(`/survey/${surveyId}/precheck?${precheckParams.toString()}`);
        return;
      } catch {
        if (!cancelled) {
          addToast('Invalid survey link', 'error');
          navigate('/');
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [surveyId, vendorId, navigate, addToast]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center">
      <DotGrid className="fixed inset-0" />

      <PlayfulCard className="relative z-10 p-8 text-center max-w-md">
        <div className="flex justify-center mb-6">
          <BrandLogo size="sm" className="mx-auto max-h-10" />
        </div>
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 border-4 border-violet border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="font-outfit font-bold text-xl text-navy mb-2">Loading Survey...</h2>
        <p className="font-jakarta text-navy-light">Please wait while we prepare your survey</p>
      </PlayfulCard>
    </div>
  );
};

export default VendorEntryPage;
