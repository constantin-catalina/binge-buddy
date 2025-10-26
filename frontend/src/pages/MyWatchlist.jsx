import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import WatchlistToolbar from "../components/WatchlistToolbar";
import WatchlistRow from "../components/WatchlistRow";
import WatchlistCard from "../components/WatchlistCard";
import BlurCircle from "../components/BlurCircle";
import { listWatchlist, removeFromWatchlist } from "../lib/watchlistApi";
import { addToHistory } from "../lib/progressApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const mapDbToItem = (w) => ({
  id: String(w.itemId),
  type: w.type,            // 'movie' | 'tv'
  title: w.title,
  year: w.year,
  poster: w.poster,
  runtime: Number(w.runtime || 0), // minutes (per episode if tv)
  genres: w.genres || [],
  rating: w.rating,
  seasons: Number(w.seasons || 0), // how many seasons (if tv)
  progress: w.progress || 0,
  addedAt: w.addedAt,
});

export default function MyWatchlist() {
  const { getToken } = useAuth();

  const [baseItems, setBaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("added-desc");
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [removed, setRemoved] = useState(new Set());

  // modal state for TV "Play"
  const [tvModalOpen, setTvModalOpen] = useState(false);
  const [tvModalShow, setTvModalShow] = useState(null); // { id, title, poster, seasonsTotal, episodesTotal, runtime }
  const [seasonsWatched, setSeasonsWatched] = useState(0);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const { items } = await listWatchlist(getToken);
        if (!ignore) setBaseItems((items || []).map(mapDbToItem));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [getToken]);

  const items = useMemo(() => {
    let list = baseItems.filter((i) => !removed.has(i.id));

    if (type !== "all") list = list.filter((i) => i.type === type);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q));
    }

    switch (sort) {
      case "added-asc":
        list.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
        break;
      case "rating-desc":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "rating-asc":
        list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        list.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }
    return list;
  }, [baseItems, type, sort, query, removed]);

  // ---- shared helpers ----

  // fetch full TV details so we know total episodes + runtime
  async function fetchShowDetails(itemId) {
    const res = await fetch(`${API_BASE}/api/tv/shows/${itemId}`);
    if (!res.ok) throw new Error("Failed to fetch TV details");
    const raw = await res.json();
    const s = raw?.show ?? raw ?? {};
    const runtime = Number(s.episode_run_time?.[0] || s.runtime || 0);
    return {
      id: s._id || s.id || itemId,
      title: s.name || s.title || "Untitled",
      poster:
        s.poster_path
          ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
          : "",
      seasonsTotal: Number(s.number_of_seasons || 0),
      episodesTotal: Number(s.number_of_episodes || 0),
      runtime, // minutes per episode
      year: (s.first_air_date || s.release_date || "").split("-")[0] || "",
      genres: Array.isArray(s.genres)
        ? (typeof s.genres[0] === "string"
            ? s.genres
            : s.genres.map((g) => g?.name).filter(Boolean))
        : [],
      rating: Number(s.vote_average ?? s.rating ?? 0),
    };
  }

  // remove from local list + backend
  async function removeFromWatchlistEverywhere(id) {
    setRemoved((prev) => new Set(prev).add(id)); // optimistic hide
    try {
      await removeFromWatchlist(id, getToken);
    } catch (e) {
      // if backend fails, you can revert UI. Keeping it simple:
      console.error("Failed to remove from watchlist:", e);
    }
  }

  // add to progress as completed (movie or tv), then remove from watchlist
  async function addAsCompletedAndRemove(item) {
    try {
      if (item.type === "movie") {
        await addToHistory(
          {
            itemId: item.id,
            type: "movie",
            title: item.title,
            poster: item.poster,
            year: item.year,
            runtime: item.runtime,
            genres: item.genres,
            rating: item.rating,
            incPlays: 1, // movies read as 100% in Progress
            at: new Date().toISOString(),
          },
          getToken
        );
      } else {
        const s = await fetchShowDetails(item.id);
        await addToHistory(
          {
            itemId: String(s.id),
            type: "tv",
            title: s.title,
            poster: s.poster || item.poster,
            year: s.year || item.year,
            runtime: s.runtime, // minutes per episode
            genres: s.genres?.length ? s.genres : item.genres,
            rating: s.rating || item.rating,
            incPlays: 1,
            at: new Date().toISOString(),
            tv: {
              episodesTotal: s.episodesTotal,
              setEpisodesWatched: s.episodesTotal, // 100%
            },
          },
          getToken
        );
      }
      await removeFromWatchlistEverywhere(item.id);
      toast.success("Moved to Progress");
    } catch {
      toast.error("Could not move to Progress");
    }
  }

  // --- “Mark watched” => always 100% then remove from watchlist ---
  const handleWatched = (item) => {
    addAsCompletedAndRemove(item);
  };

  // --- “Play” ---
  const handlePlay = async (item) => {
    if (item.type === "movie") {
      // movie: complete + remove immediately
      await addAsCompletedAndRemove(item);
      return;
    }
    // TV: open seasons modal. We remove only after successful Save.
    try {
      const s = await fetchShowDetails(item.id);
      setTvModalShow(s);
      setSeasonsWatched(0);
      setTvModalOpen(true);
    } catch {
      toast.error("Could not open progress modal");
    }
  };

  // --- submit modal (TV only) -> add to progress then remove from watchlist ---
  const submitTvModal = async () => {
    if (!tvModalShow) return;
    const T = Math.max(0, tvModalShow.seasonsTotal);
    const E = Math.max(0, tvModalShow.episodesTotal);
    const S = Math.max(0, Math.min(seasonsWatched, T));
    const episodesWatched = T && E ? Math.round((E * S) / T) : 0;

    try {
      await addToHistory(
        {
          itemId: String(tvModalShow.id),
          type: "tv",
          title: tvModalShow.title,
          poster: tvModalShow.poster,
          year: tvModalShow.year,
          runtime: tvModalShow.runtime, // minutes per episode
          genres: tvModalShow.genres || [],
          rating: tvModalShow.rating,
          incPlays: 1,
          tv: {
            episodesTotal: tvModalShow.episodesTotal,
            setEpisodesWatched: episodesWatched,
          },
        },
        getToken
      );
      await removeFromWatchlistEverywhere(String(tvModalShow.id));
      toast.success("Progress updated");
      setTvModalOpen(false);
    } catch {
      toast.error("Could not add to Progress");
    }
  };

  const handleRemove = async (item) => {
    await removeFromWatchlistEverywhere(item.id);
  };

  const totalMovies = baseItems.filter((i) => i.type === "movie").length;
  const totalTv = baseItems.filter((i) => i.type === "tv").length;

  if (loading) {
    return <div className="px-6 md:px-16 lg:px-40 py-20">Loading…</div>;
  }

  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh]">
      <BlurCircle top="120px" left="-60px" />
      <BlurCircle bottom="80px" right="-40px" />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold">My Watchlist</h1>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-gray-400">Items</p>
            <p className="text-lg font-semibold">{baseItems.length - removed.size}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-gray-400">Movies</p>
            <p className="text-lg font-semibold">{totalMovies}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-gray-400">TV Shows</p>
            <p className="text-lg font-semibold">{totalTv}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-gray-400">Avg. rating</p>
            <p className="text-lg font-semibold">
              {(
                baseItems.reduce((s, i) => s + (i.rating || 0), 0) /
                Math.max(1, baseItems.length)
              ).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <WatchlistToolbar
            type={type}
            setType={setType}
            sort={sort}
            setSort={setSort}
            view={view}
            setView={setView}
            query={query}
            setQuery={setQuery}
          />
        </div>

        {view === "list" ? (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <WatchlistRow
                key={item.id}
                item={item}
                onPlay={handlePlay}
                onRemove={handleRemove}
                onMarkWatched={handleWatched}
              />
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-gray-300">
                Nothing here yet.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onMarkWatched={handleWatched}
              />
            ))}
            {items.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-gray-300">
                Nothing here yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* TV seasons modal */}
      {tvModalOpen && tvModalShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Add to History</h3>
            <p className="text-gray-300 mb-4">
              How many <strong>seasons</strong> of <strong>{tvModalShow.title}</strong> have you watched?
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Number(tvModalShow.seasonsTotal) || 0}
                value={seasonsWatched}
                onChange={(e) => setSeasonsWatched(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                min={0}
                max={Number(tvModalShow.seasonsTotal) || 0}
                value={seasonsWatched}
                onChange={(e) => setSeasonsWatched(Number(e.target.value))}
                className="w-20 rounded-lg bg-white/10 border border-white/10 px-2 py-1"
              />
            </div>

            <p className="mt-2 text-sm text-gray-400">
              {seasonsWatched} / {Number(tvModalShow.seasonsTotal) || 0} seasons
              {!!tvModalShow.episodesTotal && !!tvModalShow.seasonsTotal && (
                <>
                  {" "}
                  • ≈{" "}
                  <strong>
                    {Math.round(
                      (tvModalShow.episodesTotal * seasonsWatched) /
                        Math.max(1, tvModalShow.seasonsTotal)
                    )}
                  </strong>{" "}
                  of {tvModalShow.episodesTotal} episodes
                </>
              )}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setTvModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={submitTvModal}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
