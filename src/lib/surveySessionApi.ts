// API client for survey session management
// This provides the frontend integration for the dynamic survey redirect tracking system

const API_URL = import.meta.env.PROD
  ? 'https://survey-panelgo.onrender.com'
  : 'http://localhost:3000';

export interface VendorLinkResponse {
  success: boolean;
  originalUrl: string;
  modifiedUrl: string;
  identifier: string;
  paramName: string;
  survey: {
    id: string;
    title: string;
    pid: string;
    token: string;
  };
}

/**
 * Generate a dynamic vendor link with identifier injection
 * STEP 1 & 2: Creates identifier, detects parameter, modifies URL
 * 
 * @param surveyToken - The survey token
 * @param userId - The actual user ID to store
 * @returns Promise with the modified URL and session details
 */
export async function generateVendorLink(
  surveyToken: string,
  userId: string
): Promise<VendorLinkResponse> {
  const response = await fetch(`${API_URL}/vendor-lite/generate-vendor-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      surveyToken,
      userId
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate vendor link');
  }

  return response.json();
}

/**
 * Check if a URL contains a supported user identifier parameter
 * 
 * @param url - The external survey URL to check
 * @returns The parameter name if found, null otherwise
 */
export function detectUserParamInUrl(url: string): string | null {
  const possibleParams = ['user_id', 'uid', 'user', 'participant_id'];
  
  try {
    const urlObj = new URL(url);
    
    // Check for empty parameter values (indicates where to inject identifier)
    for (const param of possibleParams) {
      if (urlObj.searchParams.has(param) && !urlObj.searchParams.get(param)) {
        return param;
      }
    }
    
    // If no empty param found, check for any of the possible params
    for (const param of possibleParams) {
      if (urlObj.searchParams.has(param)) {
        return param;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a survey link supports dynamic identifier injection
 * 
 * @param externalLink - The external survey link
 * @returns true if the link supports identifier injection
 */
export function supportsDynamicIdentifier(externalLink: string): boolean {
  return detectUserParamInUrl(externalLink) !== null;
}
