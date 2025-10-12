import React from 'react'
import { Check, Clock, Library, ListPlus, Heart, MessageCircle } from 'lucide-react'

const actions = [
  { id: 'checkin', label: 'Check In', icon: Check, primary: true },
  { id: 'history', label: 'Add to History', icon: Clock },
  { id: 'library', label: 'Add to Library', icon: Library },
  { id: 'watchlist', label: 'Add to Watchlist', icon: ListPlus },
  { id: 'favorites', label: 'Add to Favorites', icon: Heart },
  { id: 'comment', label: 'Add Comment', icon: MessageCircle },
]

const ActionRail = ({ onAction, className = '' }) => (
  <aside className={`w-full ${className}`}>
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {actions.map((a) => {
        const Icon = a.icon
        const base =
          'w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition ' +
          'border-b border-white/10 last:border-b-0'
        const palette = a.primary
          ? 'bg-primary hover:bg-primary-dull text-white'
          : 'hover:bg-white/5'

        return (
          <button
            key={a.id}
            className={`${base} ${palette}`}
            onClick={() => onAction?.(a.id)}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Icon className="w-4 h-4" />
              {a.label}
            </span>
            <span className="opacity-50 select-none">+</span>
          </button>
        )
      })}
    </div>
  </aside>
)

export default ActionRail
