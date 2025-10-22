const API_BASE =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

export async function listProgress(getToken: () => Promise<string|null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/progress`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to load progress");
  return res.json() as Promise<{ items: any[] }>;
}

// Generic “add to history”. You can pass different payloads for movie/tv.
export async function addToHistory(payload: any, getToken: () => Promise<string|null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add to history");
  return res.json();
}

export async function removeProgress(itemId: string, getToken: () => Promise<string|null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/progress/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove");
  return res.json();
}
