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

// 🔗 Watchlist API helpers
import {
  watchlistStatus,
  addToWatchlist,
  removeFromWatchlist,
} from '../lib/watchlistApi'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Normalize DB/TMDB movie shapes to what the page needs
function normalizeMovie(raw) {
  const m = raw?.movie ?? raw ?? {}
  const title = m.title || m.name || 'Untitled'
  const runtime = Number(m.runtime || m.episode_run_time?.[0] || 0)
  const releaseDate = m.release_date || m.first_air_date || ''
  const year = releaseDate ? String(releaseDate).split('-')[0] : ''
  const genres = Array.isArray(m.genres)
    ? (typeof m.genres[0] === 'string' ? m.genres : m.genres.map(g => g?.name).filter(Boolean))
    : []
  const vote = Number(m.vote_average ?? m.rating ?? 0)
  const backdrop = m.backdrop_path || m.poster_path || m.image || ''
  const poster = m.poster_path || m.backdrop_path || m.image || ''

  return {
    _id: m._id || m.id || '',
    title,
    runtime,
    releaseDate,
    year,
    genres,
    vote,
    backdrop,
    poster,
    original: m,
  }
}

const Details = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 👇 watchlist state
  const { getToken } = useAuth()
  const { isSignedIn } = useUser()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [wlBusy, setWlBusy] = useState(false)

  // Load the movie
  useEffect(() => {
    let isMounted = true
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/show/movies/${id}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`Failed to fetch movie (${res.status})`)
        const json = await res.json()
        if (isMounted) setMovie(normalizeMovie(json))
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load movie.')
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => { isMounted = false; ctrl.abort() }
  }, [id])

  // When we have a movie, check if it's already in the user's watchlist
  useEffect(() => {
    let ignore = false
    ;(async () => {
      if (!isSignedIn || !movie?._id) return
      try {
        const { exists } = await watchlistStatus(String(movie._id), getToken)
        if (!ignore) setInWatchlist(!!exists)
      } catch {
        // ignore
      }
    })()
    return () => { ignore = true }
  }, [isSignedIn, movie?._id, getToken])

  // Build the payload for addToWatchlist()
  const watchlistPayload = useMemo(() => {
    if (!movie) return null
    return {
      itemId: String(movie._id || ''),
      type: 'movie',
      title: movie.title || 'Untitled',
      poster:
        movie.poster ||
        movie.backdrop ||
        (movie.original?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.original.poster_path}` : ''),
      year: movie.year || undefined,
      runtime: movie.runtime,
      genres: Array.isArray(movie.genres) ? movie.genres : [],
      rating: typeof movie.vote === 'number' ? movie.vote : undefined,
    }
  }, [movie])

  // Handle ActionRail clicks
  const handleAction = async (actionId) => {
    if (actionId !== 'watchlist') {
      // other actions like check-in/favorite can go here
      return
    }
    if (!isSignedIn) {
      toast('Please sign in to use your watchlist.')
      return
    }
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
    } catch (e) {
      setInWatchlist(!next) // revert
      toast.error('Could not update watchlist')
    } finally {
      setWlBusy(false)
    }
  }

  // Description
  const description = useMemo(() => {
    return movie?.original?.overview || mockDescriptions[movie?._id] || 'No description available.'
  }, [movie])

  if (loading) return <Loading/>
  if (error) {
    return (
      <div className='px-6 md:px-16 lg:px-40 py-20'>
        <h1 className='text-2xl font-semibold mb-3'>Something went wrong</h1>
        <p className='text-gray-400'>{error}</p>
      </div>
    )
  }
  if (!movie) return <Loading/>

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className='max-md:mx-auto rounded-xl md:h-96 md:w-64 object-cover flex-none'
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image' }}
        />

        <div className='relative flex flex-col gap-3'>
          <BlurCircle top='-100px' left='-100px'/>

          {movie.original?.original_language && (
            <p className='text-primary uppercase tracking-wide'>
              {movie.original.original_language}
            </p>
          )}

          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{movie.title}</h1>

          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary' />
            {Number(movie.vote || 0).toFixed(1)} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
            {timeFormat(movie.runtime)}{movie.runtime ? ' • ' : ''}
            {movie.year ? `${movie.year} • ` : ''}
            {movie.genres?.length ? movie.genres.join(' | ') : 'Unknown Genre'}
          </p>

          <p className='text-gray-300 mt-3 leading-relaxed'>
            {description}
          </p>

          <TrailerButton onClick={() => { console.log('open trailer modal') }} />
        </div>

        {/* 👉 This is where the Add to Watchlist click is handled */}
        <ActionRail
          onAction={handleAction}
          // If you applied the optional styling props in ActionRail,
          // these will make the "Add to Watchlist" row show active/loading:
          watchlistActive={inWatchlist}
          watchlistLoading={wlBusy}
        />
      </div>

      <AvatarRow
        countLabel='97 watching now'
        avatars={mockPeopleWatchingNow}
        extraCount={86}
      />

      <CastGrid
        cast={mockCast}
        onAllCast={() => console.log('open cast page')}
      />

      <ListCards
        lists={mockLists(movie.original)}
        onAll={() => console.log('open lists page')}
      />
    </div>
  )
}

export default Details
