const VENDOR_SESSION_KEY = 'surveyrewards_vendor';

export function storeVendorSession(vendorId: string): void {
  sessionStorage.setItem(VENDOR_SESSION_KEY, vendorId);
}

export function getVendorSession(): string | null {
  return sessionStorage.getItem(VENDOR_SESSION_KEY);
}

export function clearVendorSession(): void {
  sessionStorage.removeItem(VENDOR_SESSION_KEY);
}

export function generateVendorLink(surveyId: string, vendorId: string): string {
  return `${window.location.origin}/start?survey=${surveyId}&vendor=${vendorId}`;
}
