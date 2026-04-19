import { SurveySession } from '../models/SurveySession.js';
import { randomUUID } from 'crypto';

// Generate unique identifier
export function generateIdentifier(): string {
  return randomUUID();
}

// Detect user identifier parameter in URL
export function detectUserIdentifierParam(url: string): string | null {
  const possibleParams = ['user_id', 'uid', 'user', 'participant_id'];
  
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    
    // Check for empty parameter values (indicates where to inject identifier)
    for (const param of possibleParams) {
      if (searchParams.has(param) && !searchParams.get(param)) {
        return param;
      }
    }
    
    // If no empty param found, check for any of the possible params
    for (const param of possibleParams) {
      if (searchParams.has(param)) {
        return param;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

// Inject identifier into external link
export function injectIdentifierIntoUrl(url: string, identifier: string, paramName: string): string {
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    
    // Set or replace the identifier parameter
    searchParams.set(paramName, identifier);
    
    // Reconstruct the URL
    urlObj.search = searchParams.toString();
    return urlObj.toString();
  } catch (error) {
    console.error('Error injecting identifier into URL:', error);
    return url;
  }
}

// Create survey session
export async function createSurveySession(data: {
  identifier: string;
  vendor_id: string;
  actual_user_id: string;
  survey_id?: string;
  base_url: string;
  identifier_param_name: string;
}) {
  try {
    const session = await SurveySession.create(data);
    return session;
  } catch (error) {
    console.error('Error creating survey session:', error);
    throw error;
  }
}

// Find survey session by identifier
export async function findSurveySessionByIdentifier(identifier: string) {
  try {
    const session = await SurveySession.findOne({ identifier }).populate('vendor_id');
    return session;
  } catch (error) {
    console.error('Error finding survey session:', error);
    return null;
  }
}

// Process external survey link
export async function processExternalSurveyLink(
  externalLink: string,
  vendor_id: string,
  actual_user_id: string,
  survey_id?: string
) {
  // Generate unique identifier
  const identifier = generateIdentifier();
  
  // Detect parameter name
  const paramName = detectUserIdentifierParam(externalLink);
  if (!paramName) {
    throw new Error('Could not detect user identifier parameter in external link');
  }
  
  // Inject identifier into URL
  const modifiedUrl = injectIdentifierIntoUrl(externalLink, identifier, paramName);
  
  // Create survey session
  await createSurveySession({
    identifier,
    vendor_id,
    actual_user_id,
    survey_id,
    base_url: externalLink,
    identifier_param_name: paramName
  });
  
  return {
    modifiedUrl,
    identifier,
    paramName
  };
}
