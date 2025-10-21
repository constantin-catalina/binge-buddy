import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Star as StarIcon } from 'lucide-react'

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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function normalizeMovie(raw) {
  // Accept either { movie: {...} } or {...}
  const m = raw?.movie ?? raw ?? {}

  // Support both DB and TMDB field names
  const title = m.title || m.name || 'Untitled'
  const runtime = Number(m.runtime || m.episode_run_time?.[0] || 0)
  const releaseDate = m.release_date || m.first_air_date || ''
  const year = releaseDate ? String(releaseDate).split('-')[0] : ''
  // genres can be [{id,name}] or ["Action","Drama"]
  const genres =
    Array.isArray(m.genres)
      ? (typeof m.genres[0] === 'string'
          ? m.genres
          : m.genres.map(g => g?.name).filter(Boolean))
      : []
  const vote = Number(m.vote_average ?? m.rating ?? 0)

  // Images (prefer backdrop, fallback to poster, then placeholder)
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

  useEffect(() => {
    let isMounted = true
    const ctrl = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/show/movies/${id}`, { signal: ctrl.signal })
        if (!res.ok) {
          // If you also exposed a TMDB passthrough like /api/show/tmdb/movies/:id,
          // you can optionally fall back to it here.
          throw new Error(`Failed to fetch movie (${res.status})`)
        }
        const json = await res.json()
        if (isMounted) setMovie(normalizeMovie(json))
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load movie.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
      ctrl.abort()
    }
  }, [id])

  const description = useMemo(() => {
    // If you have descriptions in DB, prefer movie.original.overview
    return (
      movie?.original?.overview ||
      mockDescriptions[movie?._id] ||
      'No description available.'
    )
  }, [movie])

  if (loading) return <Loading/>
  if (error) return (
    <div className='px-6 md:px-16 lg:px-40 py-20'>
      <h1 className='text-2xl font-semibold mb-3'>Something went wrong</h1>
      <p className='text-gray-400'>{error}</p>
    </div>
  )
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
          {/* Language tag if you store it: movie.original_language */}
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

        <ActionRail onAction={(aid) => console.log('action:', aid)} />
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
