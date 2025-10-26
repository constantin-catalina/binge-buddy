import React from 'react';

const FallbackIMG = 'https://via.placeholder.com/185x278?text=No+Image';

const CastGrid = ({ cast = [], onAllCast }) => {
  // Normalize shape + cap to one row (8 items)
  const items = (cast || [])
    .map(c => ({
      id: c.id,
      name: c.name,
      role: c.role ?? c.character ?? '',
      img: c.img ?? c.image ?? c.profile ?? c.profile_path ?? '',
    }))
    .slice(0, 8);

  return (
    <section className="max-w-6xl mx-auto mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Actors</h2>
        <button onClick={onAllCast} className="text-sm text-gray-400 hover:text-gray-200 transition">
          All Cast &amp; Crew →
        </button>
      </div>

      {/* one-row grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {items.map((c) => (
          <div key={c.id ?? c.name} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <img
              src={c.img || FallbackIMG}
              alt={c.name}
              className="w-full h-40 object-cover"
              onError={(e) => { e.currentTarget.src = FallbackIMG; }}
            />
            <div className="p-3">
              <p className="text-sm font-medium">{c.name}</p>
              {c.role ? <p className="text-xs text-gray-400 truncate">{c.role}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CastGrid;
