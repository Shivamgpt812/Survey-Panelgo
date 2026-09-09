/**
 * Injects or replaces the respondent UID / identifier in an external survey link or vendor redirect link.
 * 
 * Handles:
 * 1. Template placeholders: [identifier], [uid], [UID], [user_id], [userid], [id], [rid], [respid], [click_id], [clickid], [pid], {uid}, ###UID###, %%UID%%, etc.
 * 2. Pre-existing query parameters like ?uid=[identifier], ?uid=, ?user_id=, ?rid=, etc. ensuring no duplicate query parameters are created.
 * 3. Appending ?uid=<cleanUid> or &uid=<cleanUid> cleanly if no placeholder/param exists.
 */
export function resolveExternalSurveyLink(rawLink: string, respondentUid?: string | null): string {
  if (!rawLink || typeof rawLink !== 'string') return '';
  const cleanUid = (respondentUid || '').trim();
  if (!cleanUid) return rawLink;

  let processed = rawLink.trim();

  // 1. Replace bracketed/template placeholders across the entire URL string (case-insensitive)
  const placeholderRegex = /\[(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|pid|respondent_id|value)\]|\{(identifier|uid|user_id|userid|id|rid|respid|click_id|clickid|pid|respondent_id|value)\}|###(UID|USER_ID|IDENTIFIER|RID)###|%%(UID|USER_ID|IDENTIFIER|RID)%%/gi;
  
  let hadPlaceholderMatch = false;
  if (placeholderRegex.test(processed)) {
    hadPlaceholderMatch = true;
    processed = processed.replace(placeholderRegex, encodeURIComponent(cleanUid));
  }

  // 2. Parse URL and ensure query parameters are properly sanitized and set without duplicates
  try {
    const isAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(processed);
    const parsed = new URL(processed, isAbsolute ? undefined : 'https://placeholder.local');
    const params = parsed.searchParams;

    // List of standard respondent parameter names in order of priority
    const targetParamKeys = ['uid', 'user_id', 'userid', 'rid', 'respid', 'id', 'user', 'participant_id'];

    let foundExistingParam = false;
    for (const key of targetParamKeys) {
      if (params.has(key)) {
        foundExistingParam = true;
        const currentVal = params.get(key) || '';
        // If it was already replaced by placeholder regex, ensure all duplicate keys of this name are collapsed to one
        if (
          !currentVal ||
          currentVal === cleanUid ||
          /^(XXXXX?|\[.*\]|\{.*\}|###.*###|%%.*%%)$/i.test(currentVal) ||
          !hadPlaceholderMatch
        ) {
          params.set(key, cleanUid);
        } else {
          // Clean duplicate parameters of the same key
          params.set(key, currentVal);
        }
      }
    }

    // If no specific respondent parameter was found in query params and no placeholder was replaced,
    // inject 'uid' as a query parameter
    if (!foundExistingParam && !hadPlaceholderMatch) {
      params.set('uid', cleanUid);
    }

    if (isAbsolute) {
      return parsed.toString();
    } else {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch (err) {
    console.warn('URL parsing fallback in resolveExternalSurveyLink:', err);
    if (!hadPlaceholderMatch) {
      if (/[?&]uid=(?:\[[^\]]*\]|[^&]*)?/i.test(processed)) {
        processed = processed.replace(/([?&]uid=)(?:\[[^\]]*\]|[^&]*)?/i, `$1${encodeURIComponent(cleanUid)}`);
      } else {
        const sep = processed.includes('?') ? '&' : '?';
        processed = `${processed}${sep}uid=${encodeURIComponent(cleanUid)}`;
      }
    }
    return processed;
  }
}
