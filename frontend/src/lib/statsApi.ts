const API_BASE =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

export async function getMonthlyStats(getToken: () => Promise<string|null>, year?: number, month?: number) {
  const token = await getToken?.();
  const url = new URL(`${API_BASE}/api/stats/month`);
  if (year)  url.searchParams.set("year", String(year));
  if (month) url.searchParams.set("month", String(month));

  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}
