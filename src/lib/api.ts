const BASE =
  import.meta.env.VITE_API_URL ||
  "https://survey-panelgo.onrender.com";

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    return j.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiGetText(path: string, token: string): Promise<string> {
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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  token: string
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
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
