import React from "react"
import { Star, Check, X } from "lucide-react"

const timeFormat = (mins) => {
  if (!mins && mins !== 0) return ""
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

const WatchlistCard = ({ item, onRemove, onMarkWatched }) => {
  const isMovie = item.type === "movie"
  const meta = isMovie
    ? `${item.year} • ${item.genres?.[0] ?? ""} • ${timeFormat(item.runtime)}`
    : `${item.year} • ${item.genres?.[0] ?? ""} • ${item.episodesWatched ?? 0}/${item.episodesTotal} eps`

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col">
      <img src={item.poster} alt={item.title} className="h-60 w-full object-cover" />
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-1">{item.title}</h3>
        <p className="text-sm text-gray-300 line-clamp-1 mt-1">{meta}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-sm text-gray-300">
            <Star className="w-4 h-4 text-primary fill-primary" />
            {item.rating?.toFixed ? item.rating.toFixed(1) : item.rating}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onMarkWatched?.(item)}
              className="rounded-full bg-primary hover:bg-primary-dull px-3 py-1.5 text-xs"
            >
              <span className="inline-flex items-center gap-1"><Check className="w-3 h-3" /> Watched</span>
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
    </div>
  )
}

export default WatchlistCard
