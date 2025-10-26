import fetch from "node-fetch";

const TMDB_API = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.warn("[TMDB] Missing TMDB_API_KEY in environment.");
}

const j = (r) => r.json();

export async function tmdbFindMovieIdByTitleYear(title, year) {
  const q = new URLSearchParams({ query: title, include_adult: "false", year: year || "" });
  const res = await fetch(`${TMDB_API}/search/movie?${q}`, {
    headers: { Authorization: `Bearer ${API_KEY}`, accept: "application/json" },
  });
  const data = await j(res);
  const list = Array.isArray(data?.results) ? data.results : [];
  const exact = list.find(m => String(m.release_date || "").startsWith(String(year || "")));
  return (exact || list[0])?.id || null;
}

export async function tmdbMovieVideos(movieId) {
  const res = await fetch(`${TMDB_API}/movie/${movieId}/videos`, {
    headers: { Authorization: `Bearer ${API_KEY}`, accept: "application/json" },
  });
  const data = await j(res);
  const vids = Array.isArray(data?.results) ? data.results : [];
  const best =
    vids.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    vids.find(v => v.site === "YouTube" && v.type === "Trailer") ||
    vids.find(v => v.site === "YouTube");

  return best ? `https://www.youtube.com/watch?v=${best.key}` : null;
}

export async function tmdbMovieCredits(movieId) {
  const res = await fetch(`${TMDB_API}/movie/${movieId}/credits`, {
    headers: { Authorization: `Bearer ${API_KEY}`, accept: "application/json" },
  });
  const data = await j(res);
  const cast = Array.isArray(data?.cast) ? data.cast : [];
  return cast.slice(0, 12).map(c => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile: c.profile_path
      ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
      : "https://via.placeholder.com/185x278?text=No+Image",
  }));
}
