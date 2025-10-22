import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Star as StarIcon } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { toast } from 'sonner'

import BlurCircle from '../components/BlurCircle'
import TrailerButton from '../components/TrailerButton'
import ActionRail from '../components/ActionRail'
import AvatarRow from '../components/AvatarRow'
import CastGrid from '../components/CastGrid'
import ListCards from '../components/ListCards'
import Loading from '../components/Loading'

import timeFormat from '../lib/timeFormat'
import { mockDescriptions } from '../lib/mockDescriptions'
import { mockPeopleWatchingNow } from '../lib/mockPeopleWatchingNow'
import { mockCast } from '../lib/mockCast'
import { mockLists } from '../lib/mockLists'

// watchlist helpers
import {
  watchlistStatus,
  addToWatchlist,
  removeFromWatchlist,
} from '../lib/watchlistApi'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Normalize DB/TMDB show shapes
function normalizeShow(raw) {
  const s = raw?.show ?? raw ?? {}
  const title = s.name || s.title || 'Untitled'
  const runtime = Number(s.episode_run_time?.[0] || s.runtime || 0)
  const airDate = s.first_air_date || s.release_date || ''
  const year = airDate ? String(airDate).split('-')[0] : ''
  const genres = Array.isArray(s.genres)
    ? (typeof s.genres[0] === 'string'
        ? s.genres
        : s.genres.map(g => g?.name).filter(Boolean))
    : []
  const vote = Number(s.vote_average ?? s.rating ?? 0)
  const backdrop = s.backdrop_path || s.poster_path || s.image || ''
  const poster = s.poster_path || s.backdrop_path || s.image || ''

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
    number_of_seasons: s.number_of_seasons || 0,
    number_of_episodes: s.number_of_episodes || 0,
    original: s,
  }
}

const SeriesDetails = () => {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // watchlist UI state
  const { getToken } = useAuth()
  const { isSignedIn } = useUser()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [wlBusy, setWlBusy] = useState(false)

  // Load show
  useEffect(() => {
    let isMounted = true
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/tv/shows/${id}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`Failed to fetch show (${res.status})`)
        const json = await res.json()
        if (isMounted) setShow(normalizeShow(json))
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load show.')
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => { isMounted = false; ctrl.abort() }
  }, [id])

  // Check if in watchlist
  useEffect(() => {
    let ignore = false
    ;(async () => {
      if (!isSignedIn || !show?._id) return
      try {
        const { exists } = await watchlistStatus(String(show._id), getToken)
        if (!ignore) setInWatchlist(!!exists)
      } catch {}
    })()
    return () => { ignore = true }
  }, [isSignedIn, show?._id, getToken])

  // Build payload for add
  const watchlistPayload = useMemo(() => {
    if (!show) return null
    return {
      itemId: String(show._id || ''),
      type: 'tv',                                 // <-- important!
      title: show.title || 'Untitled',
      poster:
        show.poster ||
        show.backdrop ||
        (show.original?.poster_path ? `https://image.tmdb.org/t/p/w500${show.original.poster_path}` : ''),
      year: show.year || undefined,
      runtime: show.runtime,                      // per-episode runtime (if available)
      genres: Array.isArray(show.genres) ? show.genres : [],
      rating: typeof show.vote === 'number' ? show.vote : undefined,
      seasons: Number(show.number_of_seasons) || undefined,
    }
  }, [show])

  // Handle ActionRail click
  const handleAction = async (actionId) => {
    if (actionId !== 'watchlist') return
    if (!isSignedIn) return toast('Please sign in to use your watchlist.')
    if (!watchlistPayload?.itemId) return

    setWlBusy(true)
    const next = !inWatchlist
    setInWatchlist(next) // optimistic

    try {
      if (next) {
        await addToWatchlist(watchlistPayload, getToken)
        toast.success('Added to your watchlist')
      } else {
        await removeFromWatchlist(watchlistPayload.itemId, getToken)
        toast('Removed from your watchlist')
      }
    } catch {
      setInWatchlist(!next) // revert
      toast.error('Could not update watchlist')
    } finally {
      setWlBusy(false)
    }
  }

  const description = useMemo(() => {
    return show?.original?.overview || mockDescriptions[show?._id] || 'No description available.'
  }, [show])

  if (loading) return <Loading />
  if (error) {
    return (
      <div className="px-6 md:px-16 lg:px-40 py-20">
        <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }
  if (!show) return <Loading />

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.backdrop || show.poster}
          alt={show.title}
          className="max-md:mx-auto rounded-xl md:h-96 md:w-64 object-cover flex-none"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image' }}
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

          <TrailerButton onClick={() => console.log('open trailer modal')} />
        </div>

        {/* Watchlist hook-up */}
        <ActionRail
          onAction={handleAction}
          watchlistActive={inWatchlist}   // if you added the optional props to ActionRail
          watchlistLoading={wlBusy}
        />
      </div>

      <AvatarRow
        countLabel="97 watching now"
        avatars={mockPeopleWatchingNow}
        extraCount={86}
      />

      <CastGrid cast={mockCast} onAllCast={() => console.log('open cast page')} />

      <ListCards lists={mockLists(show.original)} onAll={() => console.log('open lists page')} />
    </div>
  )
}

export default SeriesDetails
