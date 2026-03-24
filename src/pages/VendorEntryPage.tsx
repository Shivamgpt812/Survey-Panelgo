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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!surveyId) {
        addToast('Invalid survey link', 'error');
        navigate('/');
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

        const authData = localStorage.getItem('surveypanelgo_auth');
        if (!authData) {
          // For vendor surveys, allow proceeding without login
          if (vendorId) {
            sessionStorage.setItem('surveypanelgo_redirect', `/survey/${surveyId}/precheck`);
            sessionStorage.setItem('surveypanelgo_vendor_flow', 'true');
            addToast('You can complete this survey without logging in', 'info');
            navigate(`/survey/${surveyId}/precheck`);
            return;
          } else {
            sessionStorage.setItem('surveypanelgo_redirect', `/survey/${surveyId}/precheck`);
            addToast('Please login to continue', 'info');
            navigate('/auth');
            return;
          }
        }

        navigate(`/survey/${surveyId}/precheck`);
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
