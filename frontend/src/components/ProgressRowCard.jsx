// components/ProgressRowCard.jsx
import React from "react"
import { Play, Clock3, Tv2, Check, X, Star } from "lucide-react"

/* helpers */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

const minutesToDHm = (mins = 0) => {
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = Math.floor(mins % 60)
  const parts = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m || parts.length === 0) parts.push(`${m}m`)
  return parts.join(" ")
}

const timeAgo = (iso) => {
  if (!iso) return ""
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  const mo = Math.floor(d / 30)
  const y = Math.floor(d / 365)
  if (y) return `${y}y ago`
  if (mo) return `${mo}mo ago`
  if (d) return `${d}d ago`
  if (h) return `${h}h ago`
  if (m) return `${m}m ago`
  return "just now"
}

const ProgressBar = ({ value }) => (
  <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
    <div
      className="h-full bg-primary"
      style={{ width: `${clamp(value, 0, 100)}%` }}
    />
  </div>
)

/**
 * Expected item shape:
 * {
 *   id, title, posterUrl,
 *   totalEpisodes, episodesWatched,
 *   plays, minutesWatched, minutesLeft,
 *   rating?,                           // optional number
 *   lastWatched?: { code, name, at }   // ISO datetime
 * }
 */
const ProgressRowCard = ({ item, onMarkWatched, onRemove }) => {
  const {
    title,
    posterUrl,
    totalEpisodes = 0,
    episodesWatched = 0,
    plays = 0,
    minutesWatched = 0,
    minutesLeft = 0,
    rating,
    lastWatched,
  } = item || {}

  const percent = totalEpisodes
    ? clamp(Math.round((episodesWatched / totalEpisodes) * 100), 0, 100)
    : 0

  const watchedStr = minutesToDHm(minutesWatched)
  const leftStr = minutesToDHm(minutesLeft)
  const lastWhen = lastWatched?.at ? new Date(lastWatched.at).toLocaleString() : ""
  const lastAgo = lastWatched?.at ? timeAgo(lastWatched.at) : ""

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 flex gap-4 items-start">
      {/* Poster */}
      <img
        src={posterUrl}
        alt={title}
        className="w-24 h-32 object-cover rounded-xl border border-white/10 flex-none"
        onError={(e) => (e.target.src = "/fallback.jpg")} // optional fallback
      />

      {/* Middle content */}
      <div className="flex-1 min-w-0">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-xl truncate">{title}</h3>
          {typeof rating === "number" && (
            <span className="shrink-0 inline-flex items-center gap-1 text-sm text-gray-300">
              <Star className="w-4 h-4 text-primary fill-primary" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Progress bar + % */}
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={percent} />
          <span className="text-primary font-bold">{percent}%</span>
        </div>

        {/* Long stats sentence */}
        <p className="mt-3 text-gray-300 text-sm md:text-base leading-relaxed">
          Watched <strong>{episodesWatched}</strong> of <strong>{totalEpisodes}</strong> episodes
          for <strong>{plays}</strong> {plays === 1 ? "play" : "plays"} (<strong>{watchedStr}</strong>)
          which leaves <strong>{totalEpisodes - episodesWatched}</strong> episodes (<strong>{leftStr}</strong>) left to watch.
          {lastWatched?.code && lastWatched?.name && (
            <> Last watched <strong>{lastWatched.code} “{lastWatched.name}”</strong>
              {lastAgo && <> {lastAgo}</>}
              {lastWhen && <> on <strong>{lastWhen}</strong></>}.
            </>
          )}
        </p>

        {/* Compact facts row */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-300">
          <span className="inline-flex items-center gap-1">
            <Tv2 className="w-3 h-3" /> {episodesWatched}/{totalEpisodes}
          </span>
          <span className="inline-flex items-center gap-1">
            <Play className="w-3 h-3" /> {plays}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> {leftStr} left
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onMarkWatched?.(item)}
            className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-3 py-1.5 text-sm"
          >
            <Check className="w-4 h-4" /> Mark watched
          </button>
          <button
            onClick={() => onRemove?.(item)}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm"
            title="Remove"
          >
            <X className="w-4 h-4" /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressRowCard
