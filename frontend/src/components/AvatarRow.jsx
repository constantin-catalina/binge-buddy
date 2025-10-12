import React from 'react'

const AvatarRow = ({ title = 'People You Follow', countLabel, avatars = [], extraCount }) => (
  <section className="max-w-6xl mx-auto mt-12">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
      {countLabel && <span className="text-sm text-gray-400">{countLabel}</span>}
    </div>
    <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2">
      {avatars.map((p) => (
        <img
          key={p.id}
          src={p.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full border border-white/10 shrink-0"
        />
      ))}
      {extraCount ? (
        <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-xs text-gray-300 shrink-0">
          +{extraCount}
        </div>
      ) : null}
    </div>
  </section>
)

export default AvatarRow
