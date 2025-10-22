const API_BASE =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

export async function listWatchlist(getToken: () => Promise<string | null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/watchlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load watchlist");
  return res.json() as Promise<{ items: any[] }>;
}

export async function watchlistStatus(itemId: string, getToken: () => Promise<string | null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/watchlist/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json(); // { exists, item }
}

export async function addToWatchlist(payload: {
  itemId: string;
  type: "movie" | "tv";
  title: string;
  poster?: string;
  year?: string;
  runtime?: number;
  genres?: string[];
  rating?: number;
}, getToken: () => Promise<string | null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add");
  return res.json();
}

export async function removeFromWatchlist(itemId: string, getToken: () => Promise<string | null>) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/watchlist/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove");
  return res.json();
}
