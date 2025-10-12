import React from 'react'
import { Star } from 'lucide-react'

const ListCards = ({ lists = [], onAll }) => (
  <section className="max-w-6xl mx-auto mt-10">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-100">Lists</h2>
      <button onClick={onAll} className="text-sm text-gray-400 hover:text-gray-200 transition">
        All Lists →
      </button>
    </div>

    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {lists.map((list) => (
        <div key={list.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex gap-4">
            <div className="relative w-28 h-28 shrink-0">
              {list.posters.slice(0, 3).map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  alt=""
                  className="absolute top-0 left-0 w-20 h-28 object-cover rounded-lg border border-white/10"
                  style={{ transform: `translateX(${idx * 16}px) rotate(${idx * -2}deg)` }}
                />
              ))}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{list.title}</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{list.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" /> {list.stats.score}%</span>
                <span>{list.stats.lists}</span>
                <span>{list.stats.likes}</span>
                <span>{list.stats.comments}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export default ListCards
