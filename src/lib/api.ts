const BASE = import.meta.env.DEV ? "http://localhost:3000" : "https://survey-panelgo.onrender.com";
console.log('API Base URL:', BASE, 'DEV mode:', import.meta.env.DEV);

async function parseError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    console.log('Raw response:', text);
    
    // Check if response is HTML (indicates routing issue)
    if (text.includes('<!doctype') || text.includes('<html')) {
      return 'Server returned HTML instead of JSON - routing issue detected';
    }
    
    // Try to parse as JSON
    try {
      const j = JSON.parse(text) as { error?: string };
      return j.error || res.statusText;
    } catch {
      return text || res.statusText;
    }
  } catch {
    return res.statusText;
  }
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  console.log("API CALL (GET):", path);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { headers });
  
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Invalid API response:", text);
    throw new Error("API did not return JSON");
  }
  
  return res.json() as Promise<T>;
}

export async function apiGetText(path: string, token: string): Promise<string> {
  console.log("API CALL (GET TEXT):", path);
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.text();
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  console.log("API CALL (POST):", path);
  
  // STEP 3: ADD DEBUG LOG INSIDE apiPost
  console.log("ACTUAL BODY SENT:", body);
  console.log("BODY TYPE:", typeof body);
  console.log("BODY STRINGIFIED:", body !== undefined ? JSON.stringify(body) : 'undefined');
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await parseError(res));

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Invalid API response:", text);
    throw new Error("API did not return JSON");
  }

  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string, token: string): Promise<T> {
  console.log("API CALL (DELETE):", path);
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Invalid API response:", text);
    throw new Error("API did not return JSON");
  }

  return res.json() as Promise<T>;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  token: string
): Promise<T> {
  console.log("API CALL (PATCH):", path);
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Invalid API response:", text);
    throw new Error("API did not return JSON");
  }

  return res.json() as Promise<T>;
}

// ---------- Survey Tracking ----------
export async function startSurveyTracking(surveyId: string, token?: string | null) {
  return apiPost<{ clickId: string; userId: string; ipAddress: string }>(
    '/api/survey-tracking/start',
    { surveyId },
    token
  );
}

export async function completeSurveyTracking(
  surveyId: string,
  userId: string,
  clickId: string,
  status: 'completed' | 'terminated' | 'quota_full',
  token?: string | null
) {
  return apiPost<{
    tracking: {
      id: string;
      surveyId: string;
      userId: string;
      clickId: string;
      ipAddress: string;
      status: string;
      timestamp: string;
    };
    redirectUrl: string;
  }>(
    '/api/survey-tracking/complete',
    { surveyId, userId, clickId, status },
    token
  );
}

export async function getSurveyTracking(clickId: string) {
  return apiGet<{
    tracking: {
      id: string;
      surveyId: string;
      userId: string;
      clickId: string;
      ipAddress: string;
      status: string;
      timestamp: string;
    };
  }>(`/api/survey-tracking/${clickId}`);
}

export async function getSurveyTrackingLogs(token: string) {
  return apiGet<{
    logs: Array<{
      id: string;
      surveyId: string;
      userId: string;
      clickId: string;
      ipAddress: string;
      status: string;
      timestamp: string;
    }>;
  }>('/api/survey-tracking', token);
}
