import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const FallbackIMG = "https://via.placeholder.com/185x278?text=No+Image";

export default function AllCast() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isMovie = pathname.startsWith("/movies/");
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const url = isMovie
          ? `${API_BASE}/api/show/movies/${id}/cast`
          : `${API_BASE}/api/tv/shows/${id}/cast`;
        const res = await fetch(url);
        const json = await res.json();
        if (!ignore) setCast(Array.isArray(json.cast) ? json.cast : []);
      } catch {
        if (!ignore) setCast([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id, isMovie]);

  const items = useMemo(
    () =>
      (cast || []).map((c) => ({
        id: c.id,
        name: c.name,
        role: c.character || c.role || "",
        img:
          c.img ||
          c.image ||
          (c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "") ||
          FallbackIMG,
      })),
    [cast]
  );

  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-semibold">Cast &amp; Crew</h1>
        <button
          onClick={() => navigate(isMovie ? `/movies/${id}` : `/series/${id}`)}
          className="text-sm text-gray-300 hover:text-white"
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items.length ? (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {items.map((c) => (
            <div
              key={c.id ?? c.name}
              className="rounded-2xl overflow-hidden bg-white/5 border border-white/10"
            >
              <img
                src={c.img}
                alt={c.name}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.currentTarget.src = FallbackIMG;
                }}
              />
              <div className="p-3">
                <p className="font-medium leading-tight">{c.name}</p>
                {c.role && <p className="text-xs text-gray-400 mt-1">{c.role}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No cast found.</p>
      )}
    </div>
  );
}
