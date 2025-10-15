// components/ProgressCard.jsx
import React from "react"
import { Tv2, Play, Clock3, Star, Check, X } from "lucide-react"

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
  const m = Math.floor(diff / 60000), h = Math.floor(m/60), d = Math.floor(h/24), mo = Math.floor(d/30), y = Math.floor(d/365)
  if (y) return `${y}y ago`
  if (mo) return `${mo}mo ago`
  if (d) return `${d}d ago`
  if (h) return `${h}h ago`
  if (m) return `${m}m ago`
  return "just now"
}

/**
 * Expected item shape:
 * {
 *   id, title,
 *   posterUrl | poster,                    // image url
 *   totalEpisodes, episodesWatched,
 *   plays, minutesWatched, minutesLeft,
 *   rating?,                               // optional
 *   lastWatched: { code, name, at }        // e.g. { code:'1x01', name:'Pilot', at:'2025-09-11T22:56:00' }
 * }
 */
const ProgressCard = ({ item, onRemove, onMarkWatched }) => {
  const {
    title,
    posterUrl,
    poster,
    totalEpisodes = 0,
    episodesWatched = 0,
    plays = 0,
    minutesWatched = 0,
    minutesLeft = 0,
    rating,
    lastWatched = {},
  } = item || {}

  const img = posterUrl || poster
  const percent = totalEpisodes
    ? clamp(Math.round((episodesWatched / totalEpisodes) * 100), 0, 100)
    : 0

  const watchedStr = minutesToDHm(minutesWatched)
  const leftStr = minutesToDHm(minutesLeft)
  const lastWhen = lastWatched?.at ? new Date(lastWatched.at).toLocaleString() : ""
  const lastAgo = lastWatched?.at ? timeAgo(lastWatched.at) : ""

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col">
      {/* Poster */}
      <div className="aspect-[2/3] w-full bg-white/5">
        {img && <img src={img} alt={title} className="w-full h-full object-cover" />}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold line-clamp-2">{title}</h3>
          {typeof rating === "number" && (
            <span className="shrink-0 inline-flex items-center gap-1 text-sm text-gray-300">
              <Star className="w-4 h-4 text-primary fill-primary" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Progress bar + percent */}
        <div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-1 text-xs text-primary font-semibold">{percent}%</div>
        </div>

        {/* Compact stats row */}
        <div className="mt-1 flex items-center justify-between text-xs text-gray-300">
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

        {/* Long description (clamped) */}
        <p className="mt-1 text-[13px] text-gray-300 leading-relaxed line-clamp-3">
          Watched <strong>{episodesWatched}</strong> of <strong>{totalEpisodes}</strong> episodes
          for <strong>{plays}</strong> {plays === 1 ? "play" : "plays"} (<strong>{watchedStr}</strong>)
          which leaves <strong>{totalEpisodes - episodesWatched}</strong> episodes (<strong>{leftStr}</strong>) left to
          watch. {lastWatched?.code && lastWatched?.name && (
            <>Last watched <strong>{lastWatched.code} “{lastWatched.name}”</strong>{lastAgo && <> {lastAgo}</>} {lastWhen && <> on <strong>{lastWhen}</strong></>}.</>
          )}
        </p>

        {/* Actions (optional, same feel as WatchlistCard) */}
        <div className="mt-auto flex items-center justify-end gap-1">
          <button
            onClick={() => onMarkWatched?.(item)}
            className="rounded-full bg-primary hover:bg-primary/90 px-3 py-1.5 text-xs"
          >
            <span className="inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Mark watched
            </span>
          </button>
          <button
            onClick={() => onRemove?.(item)}
            className="rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs"
            title="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressCard
