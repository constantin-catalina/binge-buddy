import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Star as StarIcon } from 'lucide-react';

import BlurCircle from '../components/BlurCircle';
import TrailerButton from '../components/TrailerButton';
import ActionRail from '../components/ActionRail';
import AvatarRow from '../components/AvatarRow';
import CastGrid from '../components/CastGrid';
import ListCards from '../components/ListCards';
import Loading from '../components/Loading';

import timeFormat from '../lib/timeFormat';
import { mockDescriptions } from '../lib/mockDescriptions';
import { mockPeopleWatchingNow } from '../lib/mockPeopleWatchingNow';
import { mockCast } from '../lib/mockCast';
import { mockLists } from '../lib/mockLists';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 🔧 Normalize both DB + TMDB‑style show objects
function normalizeShow(raw) {
  const s = raw?.show ?? raw ?? {};

  const title = s.name || s.title || 'Untitled';
  const runtime = Number(s.episode_run_time?.[0] || s.runtime || 0);
  const airDate = s.first_air_date || s.release_date || '';
  const year = airDate ? String(airDate).split('-')[0] : '';

  const genres =
    Array.isArray(s.genres)
      ? typeof s.genres[0] === 'string'
        ? s.genres
        : s.genres.map((g) => g?.name).filter(Boolean)
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
    original: s,
  };
}

const SeriesDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/tv/shows/${id}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch show (${res.status})`);
        const json = await res.json();
        if (isMounted) setShow(normalizeShow(json));
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load show.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
      ctrl.abort();
    };
  }, [id]);

  const description = useMemo(() => {
    return (
      show?.original?.overview ||
      mockDescriptions[show?._id] ||
      'No description available.'
    );
  }, [show]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="px-6 md:px-16 lg:px-40 py-20">
        <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  if (!show) return <Loading />;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.backdrop || show.poster}
          alt={show.title}
          className="max-md:mx-auto rounded-xl md:h-96 md:w-64 object-cover flex-none"
          onError={(e) => {
            e.currentTarget.src =
              'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          {show.original?.original_language && (
            <p className="text-primary uppercase tracking-wide">
              {show.original.original_language}
            </p>
          )}

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {Number(show.vote || 0).toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.number_of_seasons
              ? `${show.original.number_of_seasons} Season${
                  show.original.number_of_seasons > 1 ? 's' : ''
                } • `
              : ''}
            {timeFormat(show.runtime)}
            {show.runtime ? ' • ' : ''}
            {show.year ? `${show.year} • ` : ''}
            {show.genres?.length ? show.genres.join(' | ') : 'Unknown Genre'}
          </p>

          <p className="text-gray-300 mt-3 leading-relaxed">{description}</p>

          <TrailerButton onClick={() => console.log('open trailer modal')} />
        </div>

        <ActionRail onAction={(aid) => console.log('action:', aid)} />
      </div>

      <AvatarRow
        countLabel="97 watching now"
        avatars={mockPeopleWatchingNow}
        extraCount={86}
      />

      <CastGrid
        cast={mockCast}
        onAllCast={() => console.log('open cast page')}
      />

      <ListCards
        lists={mockLists(show.original)}
        onAll={() => console.log('open lists page')}
      />
    </div>
  );
};

export default SeriesDetails;
