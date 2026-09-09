import { SurveySession } from '../models/SurveySession.js';
import { randomUUID } from 'crypto';

// Generate unique identifier
export function generateIdentifier(): string {
  return randomUUID();
}

export function detectUserIdentifierParam(url: string): string | null {
  const possibleParams = ['uid', 'user_id', 'userid', 'rid', 'respid', 'id', 'user', 'participant_id'];
  
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    
    // Check for empty parameter values or bracketed placeholders (indicates where to inject identifier)
    for (const param of possibleParams) {
      if (searchParams.has(param)) {
        const val = searchParams.get(param) || '';
        if (!val || /^(\[.*\]|\{.*\}|###.*###|%%.*%%|XXXXX?)$/i.test(val)) {
          return param;
        }
      }
    }
    
    // If no placeholder param found, check for any of the possible params
    for (const param of possibleParams) {
      if (searchParams.has(param)) {
        return param;
      }
    }
    
    return 'uid';
  } catch (error) {
    console.error('Error parsing URL:', error);
    return 'uid';
  }
}

// Inject identifier into external link
export function injectIdentifierIntoUrl(url: string, identifier: string, paramName: string): string {
  try {
    let processed = url.trim();
    const placeholderRegex = /\[(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|pid|respondent_id|value)\]|\{(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|pid|respondent_id|value)\}|###(UID|USER_ID|IDENTIFIER|RID)###|%%(UID|USER_ID|IDENTIFIER|RID)%%/gi;
    
    if (placeholderRegex.test(processed)) {
      processed = processed.replace(placeholderRegex, encodeURIComponent(identifier));
    }

    const urlObj = new URL(processed);
    const searchParams = urlObj.searchParams;
    
    // Set or replace the identifier parameter
    if (paramName) {
      searchParams.set(paramName, identifier);
    }
    
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
