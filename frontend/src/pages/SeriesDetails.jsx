import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star as StarIcon } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

import BlurCircle from '../components/BlurCircle';
import TrailerButton from '../components/TrailerButton';
import ActionRail from '../components/ActionRail';
import CastGrid from '../components/CastGrid';
import Loading from '../components/Loading';

// watchlist helpers
import {
  watchlistStatus,
  addToWatchlist,
  removeFromWatchlist,
} from '../lib/watchlistApi';

// progress helpers
import { addToHistory } from '../lib/progressApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Normalize DB/TMDB show shapes
function normalizeShow(raw) {
  const s = raw?.show ?? raw ?? {};
  const title = s.name || s.title || 'Untitled';
  const runtime = Number(s.episode_run_time?.[0] || s.runtime || 0);
  const airDate = s.first_air_date || s.release_date || '';
  const year = airDate ? String(airDate).split('-')[0] : '';
  const genres = Array.isArray(s.genres)
    ? (typeof s.genres[0] === 'string'
        ? s.genres
        : s.genres.map((g) => g?.name).filter(Boolean))
    : [];
  const vote = Number(s.vote_average ?? s.rating ?? 0);
  const backdrop = s.backdrop_path || s.poster_path || s.image || '';
  const poster = s.poster_path || s.backdrop_path || s.image || '';

  return {
    _id: s._id || s.id || '',
    title,
    runtime,
    airDate,
    year,
    genres,
    vote,
    backdrop,
    poster,
    number_of_seasons: Number(s.number_of_seasons || 0),
    number_of_episodes: Number(s.number_of_episodes || 0),
    original: s,
  };
}

const SeriesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();             

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // extras
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [cast, setCast] = useState([]);

  // watchlist UI state
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [wlBusy, setWlBusy] = useState(false);

  // seasons -> history modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [seasonsWatched, setSeasonsWatched] = useState(0);

  // Load show
  useEffect(() => {
    let isMounted = true;
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/tv/shows/${id}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`Failed to fetch show (${res.status})`);
        const json = await res.json();
        if (isMounted) setShow(normalizeShow(json));
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load show.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; ctrl.abort(); };
  }, [id]);

  // Fetch trailer + cast once we know the show id
  useEffect(() => {
    let ignore = false;
    if (!show?._id) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tv/shows/${show._id}/extras`);
        if (!res.ok) throw new Error('Failed to load extras');
        const { trailerUrl, cast } = await res.json();
        if (!ignore) {
          setTrailerUrl(trailerUrl || null);
          setCast(Array.isArray(cast) ? cast : []);
        }
      } catch {
        if (!ignore) {
          setTrailerUrl(null);
          setCast([]);
        }
      }
    })();
    return () => { ignore = true; };
  }, [show?._id]);

  // Check if in watchlist
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isSignedIn || !show?._id) return;
      try {
        const { exists } = await watchlistStatus(String(show._id), getToken);
        if (!ignore) setInWatchlist(!!exists);
      } catch {}
    })();
    return () => { ignore = true; };
  }, [isSignedIn, show?._id, getToken]);

  const commonPoster =
    show?.poster ||
    show?.backdrop ||
    (show?.original?.poster_path ? `https://image.tmdb.org/t/p/w500${show.original.poster_path}` : '');

  const watchlistPayload = useMemo(() => {
    if (!show) return null;
    return {
      itemId: String(show._id || ''),
      type: 'tv',
      title: show.title || 'Untitled',
      poster: commonPoster,
      year: show.year || undefined,
      runtime: show.runtime,
      genres: Array.isArray(show.genres) ? show.genres : [],
      rating: typeof show.vote === 'number' ? show.vote : undefined,
      seasons: Number(show.number_of_seasons) || undefined,
    };
  }, [show]);

  // Handle ActionRail click
  const handleAction = async (actionId) => {
    if (actionId === 'watchlist') {
      if (!isSignedIn) return toast('Please sign in to use your watchlist.');
      if (!watchlistPayload?.itemId) return;
      setWlBusy(true);
      const next = !inWatchlist;
      setInWatchlist(next);
      try {
        if (next) {
          await addToWatchlist(watchlistPayload, getToken);
          toast.success('Added to your watchlist');
        } else {
          await removeFromWatchlist(watchlistPayload.itemId, getToken);
          toast('Removed from your watchlist');
        }
      } catch {
        setInWatchlist(!next);
        toast.error('Could not update watchlist');
      } finally {
        setWlBusy(false);
      }
      return;
    }

    if (actionId === 'history') {
      if (!isSignedIn) return toast('Please sign in to use your history.');
      setSeasonsWatched(0);
      setHistoryOpen(true);
      return;
    }
  };

  // Convert seasons watched -> episodes watched
  const derivedEpisodesWatched = useMemo(() => {
    if (!show) return 0;
    const T = Math.max(0, show.number_of_seasons);
    const E = Math.max(0, show.number_of_episodes);
    const S = Math.max(0, Math.min(seasonsWatched, T));
    if (!T || !E) return 0;
    return Math.round((E * S) / T);
  }, [show, seasonsWatched]);

  const submitHistory = async () => {
    if (!show?._id) return;
    try {
      await addToHistory({
        itemId: String(show._id),
        type: 'tv',
        title: show.title,
        poster: commonPoster,
        year: show.year,
        runtime: show.runtime,
        genres: show.genres,
        rating: show.vote,
        incPlays: 1,
        at: new Date().toISOString(),
        tv: {
          episodesTotal: Number(show.number_of_episodes) || 0,
          setEpisodesWatched: derivedEpisodesWatched,
        }
      }, getToken);
      toast.success('Added to history');
      setHistoryOpen(false);
    } catch {
      toast.error('Could not add to history');
    }
  };

  // Map cast and cap to one row (8)
  const castForUi = useMemo(() => {
    const fallback = 'https://via.placeholder.com/185x278?text=No+Image';
    return (cast || []).map((c) => {
      const src =
        c.img ??
        c.image ??
        c.profile ??
        (c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : undefined);
      return {
        id: c.id,
        name: c.name,
        role: c.role ?? c.character ?? '',
        img: src || fallback,
      };
    }).slice(0, 8);
  }, [cast]);

  const description = useMemo(() => {
    return show?.original?.overview || 'No description available.';
  }, [show]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="px-6 md:px-16 lg:px-40 py-20">
        <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }
  if (!show) return <Loading />;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.backdrop || show.poster}
          alt={show.title}
          className="max-md:mx-auto rounded-xl md:h-96 md:w-64 object-cover flex-none"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          {show.original?.original_language && (
            <p className="text-primary uppercase tracking-wide">
              {show.original.original_language}
            </p>
          )}

          <h1 className="text-4xl font-semibold max-w-96 text-balance">{show.title}</h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {Number(show.vote || 0).toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.number_of_seasons ? `${show.number_of_seasons} season${show.number_of_seasons > 1 ? 's' : ''} • ` : ''}
            {show.year ? `${show.year} • ` : ''}
            {show.genres?.length ? show.genres.join(' | ') : 'Unknown Genre'}
          </p>

          <p className="text-gray-300 mt-3 leading-relaxed">{description}</p>

          <TrailerButton
            onClick={() => {
              if (trailerUrl) {
                window.open(trailerUrl, '_blank', 'noopener,noreferrer');
              } else {
                toast('No trailer available for this title.');
              }
            }}
          />
        </div>

        <ActionRail
          onAction={handleAction}
          watchlistActive={inWatchlist}
          watchlistLoading={wlBusy}
        />
      </div>

      {/* History modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Add to History</h3>
            <p className="text-gray-300 mb-4">
              How many <strong>seasons</strong> have you watched?
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Number(show.number_of_seasons) || 0}
                value={seasonsWatched}
                onChange={(e) => setSeasonsWatched(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                min={0}
                max={Number(show.number_of_seasons) || 0}
                value={seasonsWatched}
                onChange={(e) => setSeasonsWatched(Number(e.target.value))}
                className="w-20 rounded-lg bg-white/10 border border-white/10 px-2 py-1"
              />
            </div>

            <p className="mt-2 text-sm text-gray-400">
              {seasonsWatched} / {Number(show.number_of_seasons) || 0} seasons
              {!!show.number_of_episodes && !!show.number_of_seasons && (
                <> • ≈ <strong>{derivedEpisodesWatched}</strong> of {show.number_of_episodes} episodes</>
              )}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setHistoryOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Cancel</button>
              <button onClick={submitHistory} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90">Save</button>
            </div>
          </div>
        </div>
      )}

      <CastGrid
        cast={castForUi}
        onAllCast={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          navigate(`/series/${show._id}/cast`)
        }}
      />
    </div>
  );
};

export default SeriesDetails;
