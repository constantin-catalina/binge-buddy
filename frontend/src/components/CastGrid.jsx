import React from 'react'

const CastGrid = ({ cast = [], onAllCast }) => (
  <section className="max-w-6xl mx-auto mt-10">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-100">Actors</h2>
      <button onClick={onAllCast} className="text-sm text-gray-400 hover:text-gray-200 transition">
        All Cast &amp; Crew →
      </button>
    </div>
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cast.map((c) => (
        <div key={c.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <img src={c.img} alt={c.name} className="w-full h-40 object-cover" />
          <div className="p-3">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-xs text-gray-400 truncate">{c.role}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export default CastGrid
