import React, { useEffect, useMemo, useState } from 'react'
import BlurCircle from '../components/BlurCircle'
import { FaTv, FaFilm, FaFolder, FaPlay, FaClock, FaHeart, FaComment } from 'react-icons/fa'
import bgImageFallback from '../assets/september-review.jpg'
import { useUser, useAuth } from '@clerk/clerk-react'
import Loading from '../components/Loading'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const DEFAULT_TV_RUNTIME_MIN = 45

// ----- helpers -----
const minutesToDHm = (mins = 0) => {
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = Math.floor(mins % 60)
  const parts = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m || parts.length === 0) parts.push(`${m}m`)
  return parts.join(' ')
}

// Parse season from "2x05" / "S02E05" / "s3e1"…
const extractSeasonFromCode = (code) => {
  if (!code) return null
  const m = String(code).match(/(?:S\s*?(\d+))|(^|\D)(\d+)\s*[xE]/i)
  const season = (m && (m[1] || m[3])) ? parseInt(m[1] || m[3], 10) : null
  return Number.isFinite(season) ? season : null
}

const UserDashboard = () => {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  // Progress-based stats (lifetime/library)
  const [progressItems, setProgressItems] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(true)

  // Monthly stats
  const [monthStats, setMonthStats] = useState({ plays: 0, minutes: 0, hours: 0, firstPlay: null })
  const [loadingMonth, setLoadingMonth] = useState(true)

  // 1) Load all progress entries
  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoadingProgress(true)
      try {
        const token = await getToken?.()
        const res = await fetch(`${API_BASE}/api/progress`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const json = res.ok ? await res.json() : { items: [] }
        if (!ignore) setProgressItems(json.items || [])
      } catch {
        if (!ignore) setProgressItems([])
      } finally {
        if (!ignore) setLoadingProgress(false)
      }
    })()
    return () => { ignore = true }
  }, [getToken])

  // 2) Load month-in-review stats
  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoadingMonth(true)
      try {
        const token = await getToken?.()
        const now = new Date()
        const url = new URL(`${API_BASE}/api/stats/month`)
        url.searchParams.set('year', String(now.getFullYear()))
        url.searchParams.set('month', String(now.getMonth() + 1))
        const res = await fetch(url.toString(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const json = res.ok ? await res.json() : {}
        if (!ignore) {
          setMonthStats({
            plays: json.plays || 0,                                  // episodes + movies this month
            minutes: json.minutes || 0,
            hours: json.hours ?? Math.round((json.minutes || 0) / 60),
            firstPlay: json.firstPlay || null,                       // {type,title,code,name,poster,backdrop}
          })
        }
      } catch {
        if (!ignore) setMonthStats({ plays: 0, minutes: 0, hours: 0, firstPlay: null })
      } finally {
        if (!ignore) setLoadingMonth(false)
      }
    })()
    return () => { ignore = true }
  }, [getToken])

  // Aggregate progress -> cards (TV/Movies/Library)
  const agg = useMemo(() => {
    const movies = progressItems.filter(i => i.type === 'movie')
    const tv = progressItems.filter(i => i.type === 'tv')

    // Movies
    const movieCount = movies.length
    const movieMinutes = movies.reduce((s, m) => {
      const runtime = Number(m.runtime || 0)
      return s + (runtime > 0 ? runtime : Number(m.minutesWatched || 0))
    }, 0)

    // TV
    const tvShows = tv.length
    const tvEpisodesWatched = tv.reduce((s, t) => s + Number(t.episodesWatched || 0), 0)
    const tvMinutes = tv.reduce((s, t) => {
      const runtime = Number(t.runtime || 0) > 0 ? Number(t.runtime) : DEFAULT_TV_RUNTIME_MIN
      return s + runtime * Number(t.episodesWatched || 0)
    }, 0)

    // Library
    const totalEpisodesInLibrary = tv.reduce((s, t) => s + Number(t.episodesTotal || 0), 0)

    return {
      tv: { minutes: tvMinutes, episodesWatched: tvEpisodesWatched, shows: tvShows },
      movies: { minutes: movieMinutes, count: movieCount },
      library: { episodes: totalEpisodesInLibrary, shows: tvShows, movies: movieCount }
    }
  }, [progressItems])

  // Hero background (first play backdrop/poster if available)
  const heroBg = monthStats.firstPlay?.backdrop || monthStats.firstPlay?.poster || bgImageFallback

  // First play headline
  const firstPlayHeadline = useMemo(() => {
    if (!monthStats.firstPlay) return 'No plays yet this month'
    const fp = monthStats.firstPlay
    if (fp.type === 'tv') {
      const s = extractSeasonFromCode(fp.code)
      return s ? `${fp.title} — Season ${s}` : fp.title
    }
    return fp.title
  }, [monthStats.firstPlay])

  // Handle loading or unauthenticated user
  if (!isLoaded) return <Loading />
  if (!user) return <p className="text-center text-gray-400 mt-20">You need to sign in to view your dashboard.</p>

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'
  const monthName = new Date().toLocaleString(undefined, { month: 'long' }).toLowerCase()

  return (
    <div className="relative overflow-hidden text-white">
      <BlurCircle top="60px" left="-80px" />
      <BlurCircle bottom="0" right="-80px" />

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-20 mt-32 mb-8">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center gap-6">
          <img
            src={user.imageUrl}
            alt="User avatar"
            className="w-16 h-16 rounded-full object-cover border border-white/10"
          />
          <div>
            <h1 className="text-3xl font-semibold">Hello, {user.firstName || user.username}</h1>
            <p className="text-sm text-gray-300">MEMBER SINCE {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Stats Row (from Progress) */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-20 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TV */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex gap-4 items-start">
          <FaTv className="text-white text-2xl mt-1" />
          <div>
            <div className="text-sm text-gray-300">{minutesToDHm(agg.tv.minutes)} watched</div>
            <div className="font-semibold">
              {agg.tv.episodesWatched.toLocaleString()} episodes ({agg.tv.shows} shows)
            </div>
          </div>
        </div>

        {/* Movies */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex gap-4 items-start">
          <FaFilm className="text-white text-2xl mt-1" />
          <div>
            <div className="text-sm text-gray-300">{minutesToDHm(agg.movies.minutes)} watched</div>
            <div className="font-semibold">
              {agg.movies.count} movies
            </div>
          </div>
        </div>

        {/* Library */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex gap-4 items-start">
          <FaFolder className="text-white text-2xl mt-1" />
          <div>
            <div className="text-sm text-gray-300">Library</div>
            <div className="font-semibold">
              {agg.library.episodes.toLocaleString()} episodes ({agg.library.shows} shows), {agg.library.movies} movies
            </div>
          </div>
        </div>
      </div>

      {/* Month in Review (uses monthly stats + first play bg if available) */}
      <div className="relative">
        <div
          className="relative h-[460px] flex items-center justify-center text-white"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Month Title & Stats/First Play Grid Layout */}
          <div className="relative z-10 px-4 max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-12 text-center">
              your <span className="text-primary lowercase">{monthName}</span> in review
            </h2>

            <div className="grid md:grid-cols-2 gap-10 items-stretch justify-items-center md:justify-items-stretch">
              {/* Stats 2x2 grid */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                <StatCard icon={<FaPlay />} label="PLAYS" value={monthStats.plays} />
                <StatCard icon={<FaClock />} label="HOURS" value={monthStats.hours} />
                <StatCard icon={<FaHeart />} label="RATINGS" value={0} />
                <StatCard icon={<FaComment />} label="COMMENTS" value={0} />
              </div>

              {/* First Play Info */}
              <div className="bg-white/10 p-6 rounded-xl border border-white/20 text-left flex-1">
                <div>
                  <p className="uppercase text-sm text-gray-300 tracking-wider mb-2">
                    First Play of <span className="text-white capitalize">{monthName}</span>
                  </p>
                  <h3 className="text-3xl font-bold mb-1">{firstPlayHeadline}</h3>
                  {!monthStats.firstPlay && (
                    <p className="text-lg text-gray-300">No plays yet this month</p>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center mt-6">
                  <Link
                    to="/progress"
                    className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-transform duration-200"
                  >
                    Check your progress
                  </Link>
                </div>
              </div>
            </div>

            {(loadingProgress || loadingMonth) && (
              <div className="mt-6 text-gray-300">Loading…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable stat card component
const StatCard = ({ icon, label, value }) => (
  <div className="bg-[--color-primary-dull] p-4 rounded-xl flex flex-col items-center justify-center space-y-2">
    <div className="text-white text-2xl">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-300 uppercase text-center">{label}</div>
  </div>
)

export default UserDashboard
