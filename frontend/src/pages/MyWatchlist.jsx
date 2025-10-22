import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import WatchlistToolbar from "../components/WatchlistToolbar";
import WatchlistRow from "../components/WatchlistRow";
import WatchlistCard from "../components/WatchlistCard";
import BlurCircle from "../components/BlurCircle";
import { listWatchlist, removeFromWatchlist } from "../lib/watchlistApi";

const mapDbToItem = (w) => ({
  id: String(w.itemId),
  type: w.type,
  title: w.title,
  year: w.year,
  poster: w.poster,
  runtime: w.runtime,
  genres: w.genres || [],
  rating: w.rating,
  progress: w.progress || 0,
  addedAt: w.addedAt,
});

const MyWatchlist = () => {
  const { getToken } = useAuth();

  const [baseItems, setBaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("added-desc");
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [removed, setRemoved] = useState(new Set());

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
    return () => { ignore = true; };
  }, [getToken]);

  const items = useMemo(() => {
    let list = baseItems.filter((i) => !removed.has(i.id));

    if (type !== "all") list = list.filter((i) => i.type === type);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q));
    }

    switch (sort) {
      case "added-asc":   list.sort((a,b)=> new Date(a.addedAt)-new Date(b.addedAt)); break;
      case "rating-desc": list.sort((a,b)=> (b.rating||0)-(a.rating||0)); break;
      case "rating-asc":  list.sort((a,b)=> (a.rating||0)-(b.rating||0)); break;
      case "title-asc":   list.sort((a,b)=> a.title.localeCompare(b.title)); break;
      case "title-desc":  list.sort((a,b)=> b.title.localeCompare(a.title)); break;
      default:            list.sort((a,b)=> new Date(b.addedAt)-new Date(a.addedAt));
    }
    return list;
  }, [baseItems, type, sort, query, removed]);

  const handlePlay = (item) => console.log("play", item);
  const handleRemove = async (item) => {
    const next = new Set(removed); next.add(item.id); setRemoved(next); // optimistic
    try { await removeFromWatchlist(item.id, getToken); } catch {}
  };
  const handleWatched = (item) => console.log("mark watched", item);

  const totalMovies = baseItems.filter((i) => i.type === "movie").length;
  const totalTv = baseItems.filter((i) => i.type === "tv").length;

  if (loading) {
    return <div className="px-6 md:px-16 lg:px-40 py-20">Loading…</div>;
  }

  return (
    <div className='relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh]'>
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
              {(baseItems.reduce((s,i)=>s+(i.rating||0),0) / Math.max(1, baseItems.length)).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <WatchlistToolbar
            type={type} setType={setType}
            sort={sort} setSort={setSort}
            view={view} setView={setView}
            query={query} setQuery={setQuery}
          />
        </div>

        {view === "list" ? (
          <div className="mt-6 space-y-4">
            {items.map(item => (
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
            {items.map(item => (
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
    </div>
  );
};

export default MyWatchlist;
