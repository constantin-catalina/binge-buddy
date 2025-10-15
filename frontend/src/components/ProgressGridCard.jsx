import React from "react"
import { Check, Bookmark, List, Play, Heart } from "lucide-react"

/**
 * Expected item shape:
 * {
 *   id,
 *   posterUrl,                // poster image (2:3)
 *   percent,                  // 0..100
 *   accent?: string,          // tailwind color class for the thin bar (default uses bg-primary)
 *   ribbon?: string,          // optional small ribbon text (e.g., "10" for season badge)
 *   banner?: string,          // optional banner text (e.g., "Returns next season!")
 *   episode?: { code, name }, // e.g. { code: "1x02", name: "Friendship is Magic (2)" }
 *   showTitle?: string,       // e.g. "My Little Pony: Friendship Is Magic"
 *   watchedLabel?: string,    // e.g. "100% watched!"
 * }
 */

const ProgressGridCard = ({ item }) => {
  const {
    posterUrl,
    percent = 0,
    accent,
    ribbon,
    banner,
    episode,
    showTitle,
    watchedLabel,
  } = item || {}

  const pct = Math.max(0, Math.min(100, Math.round(percent)))
  const accentClass = accent || "bg-primary"

  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      {/* Poster + overlays */}
      <div className="relative">
        {/* Poster */}
        <div className="aspect-[2/3] w-full bg-white/5">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={episode?.name || showTitle || "Poster"}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Corner ribbon (top-right) */}
        {ribbon && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {ribbon}
            </div>
          </div>
        )}

        {/* Optional center-left banner (like “Returns next season!”) */}
        {banner && (
          <div className="absolute left-4 bottom-16">
            <span className="bg-violet-700/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
              {banner}
            </span>
          </div>
        )}

        {/* Bottom action strip */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Icons row */}
          <div className="px-3 py-2 bg-black/70 backdrop-blur-sm flex items-center gap-3">
            <button title="Mark watched" className="p-1 rounded text-white/90 hover:text-white">
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

            {/* % at the right */}
            <div className="ml-auto inline-flex items-center gap-1 text-white font-semibold">
              <Heart className="w-5 h-5" />
              {pct}%
            </div>
          </div>

          {/* Thin progress bar (accent color) */}
          <div className={`h-1 ${accentClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Title block */}
      <div className="px-3 pt-3 pb-4">
        {/* First line: episode code bold + episode name (truncate like screenshot) */}
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

        {/* Second line: show title OR “100% watched!” */}
        <div className="mt-2 text-sm text-gray-300 truncate">
          {watchedLabel
            ? <span className="text-gray-300">{watchedLabel}</span>
            : showTitle
              ? <span className="inline-flex items-center gap-2">
                  {/* small “from show” icon space if you want */}
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
