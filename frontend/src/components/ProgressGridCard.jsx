import React from "react"
import { Check, Bookmark, List, Play, Heart, X } from "lucide-react"

/**
 * Expected item shape:
 * {
 *   id, posterUrl, percent, accent?, ribbon?, banner?,
 *   episode?: { code, name }, showTitle?, watchedLabel?, title?
 * }
 */
const ProgressGridCard = ({ item, onRemove, onMarkWatched }) => {
  const {
    id,
    posterUrl,
    percent = 0,
    accent,
    ribbon,
    banner,
    episode,
    showTitle,
    watchedLabel,
    title,
  } = item || {}

  const pct = Math.max(0, Math.min(100, Math.round(percent)))
  const accentClass = accent || "bg-primary"

  const handleRemove = () => onRemove?.({ id, title })
  const handleMark = () => onMarkWatched?.(item)

  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <div className="relative">
        <div className="aspect-[2/3] w-full bg-white/5">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={episode?.name || showTitle || "Poster"}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {ribbon && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {ribbon}
            </div>
          </div>
        )}

        {banner && (
          <div className="absolute left-4 bottom-16">
            <span className="bg-violet-700/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
              {banner}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-3 py-2 bg-black/70 backdrop-blur-sm flex items-center gap-3">
            <button title="Mark watched" onClick={handleMark} className="p-1 rounded text-white/90 hover:text-white">
              <Check className="w-5 h-5" />
            </button>
            <button title="Collection" className="p-1 rounded text-white/90 hover:text-white">
              <Bookmark className="w-5 h-5" />
            </button>
            <button title="Progress" className="p-1 rounded text-white/90 hover:text-white">
              <List className="w-5 h-5" />
            </button>
            <button title="Play" className="p-1 rounded text-white/90 hover:text-white">
              <Play className="w-5 h-5" />
            </button>

            <div className="ml-auto inline-flex items-center gap-2">
              <button title="Remove" onClick={handleRemove} className="p-1 rounded text-white/90 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <span className="inline-flex items-center gap-1 text-white font-semibold">
                <Heart className="w-5 h-5" />
                {pct}%
              </span>
            </div>
          </div>

          <div className={`h-1 ${accentClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="px-3 pt-3 pb-4">
        {episode ? (
          <div className="text-[1.05rem] font-semibold truncate">
            <span className="font-extrabold">{episode.code}</span>{" "}
            <span className="text-white/90">{episode.name}</span>
          </div>
        ) : (
          <div className="text-[1.05rem] font-semibold truncate">
            {showTitle || "Untitled"}
          </div>
        )}

        <div className="mt-2 text-sm text-gray-300 truncate">
          {watchedLabel
            ? <span className="text-gray-300">{watchedLabel}</span>
            : showTitle
              ? <span className="inline-flex items-center gap-2">
                  <span className="text-gray-400"> </span>
                  {showTitle}
                </span>
              : null}
        </div>
      </div>
    </div>
  )
}

export default ProgressGridCard
