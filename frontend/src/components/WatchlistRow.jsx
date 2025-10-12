import React from "react"
import { Play, Star, Check, X } from "lucide-react"

const timeFormat = (mins) => {
  if (!mins && mins !== 0) return ""
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

const ProgressBar = ({ value }) => (
  <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
    <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
)

const WatchlistRow = ({ item, onPlay, onRemove, onMarkWatched }) => {
  const isMovie = item.type === "movie"
  const meta = isMovie
    ? `${item.year} • ${item.genres?.join(" | ")} • ${timeFormat(item.runtime)}`
    : `${item.year} • ${item.genres?.join(" | ")} • ${item.episodesWatched ?? 0}/${item.episodesTotal} eps`

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 flex gap-4">
      <img
        src={item.poster}
        alt={item.title}
        className="w-24 h-32 object-cover rounded-xl border border-white/10 flex-none"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate">{item.title}</h3>
            <p className="text-sm text-gray-300 mt-1">{meta}</p>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Star className="w-4 h-4 text-primary fill-primary" />
            {item.rating?.toFixed ? item.rating.toFixed(1) : item.rating}
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={item.progress ?? 0} />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onPlay?.(item)}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm"
          >
            <Play className="w-4 h-4" /> Play
          </button>
          <button
            onClick={() => onMarkWatched?.(item)}
            className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dull px-3 py-1.5 text-sm"
          >
            <Check className="w-4 h-4" /> Mark watched
          </button>
          <button
            onClick={() => onRemove?.(item)}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm"
            title="Remove from watchlist"
          >
            <X className="w-4 h-4" /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default WatchlistRow
