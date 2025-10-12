import React from "react"
import { LayoutGrid, List, SortAsc, Search } from "lucide-react"

const Segmented = ({ value, onChange, options }) => (
  <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
    {options.map(opt => {
      const active = opt.value === value
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm rounded-full transition
            ${active ? "bg-primary text-white" : "text-gray-300 hover:bg-white/10"}`}
        >
          {opt.label}
        </button>
      )
    })}
  </div>
)

const WatchlistToolbar = ({
  type, setType,
  sort, setSort,
  view, setView,
  query, setQuery
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <Segmented
        value={type}
        onChange={setType}
        options={[
          { value: "all", label: "All" },
          { value: "movie", label: "Movies" },
          { value: "tv", label: "TV Shows" },
        ]}
      />

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 opacity-60" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search watchlist..."
            className="pl-8 pr-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="appearance-none pr-8 pl-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option className="text-black bg-white" value="added-desc">Recently added</option>
            <option className="text-black bg-white" value="added-asc">Oldest added</option>
            <option className="text-black bg-white" value="rating-desc">Rating (high → low)</option>
            <option className="text-black bg-white" value="rating-asc">Rating (low → high)</option>
            <option className="text-black bg-white" value="title-asc">Title (A → Z)</option>
            <option className="text-black bg-white" value="title-desc">Title (Z → A)</option>
          </select>
          <SortAsc className="w-4 h-4 absolute right-2 top-2.5 opacity-60 pointer-events-none" />
        </div>

        <div className="inline-flex rounded-lg overflow-hidden border border-white/10">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 ${view === "list" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}`}
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}`}
            title="Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WatchlistToolbar
