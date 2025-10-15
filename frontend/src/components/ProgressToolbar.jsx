import React from "react"
import { LayoutGrid, List, SortAsc, Search, Gauge, PlayCircle, CheckCircle2 } from "lucide-react"

const CONTROL_H = "h-12" // single source of truth for control height

const Segmented = ({ value, onChange, options, className = "" }) => (
  <div className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 ${className}`}>
    {options.map(opt => {
      const active = opt.value === value
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`${CONTROL_H} px-5 rounded-full text-sm leading-none
                      inline-flex items-center justify-center gap-2 transition
                      ${active ? "bg-primary text-white" : "text-gray-300 hover:bg-white/10"}`}
        >
          {opt.icon && <opt.icon className="w-4 h-4" />}
          <span className="whitespace-nowrap">{opt.label}</span>
        </button>
      )
    })}
  </div>
)

const ProgressToolbar = ({
  kind, setKind,
  status, setStatus,
  query, setQuery,
  sort, setSort,
  view, setView,
}) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Left controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            { value: "all",   label: "All" },
            { value: "movie", label: "Movies" },
            { value: "tv",    label: "TV Shows" },
          ]}
        />
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "all",         label: "Any",         icon: Gauge },
            { value: "inprogress",  label: "In progress", icon: PlayCircle },
            { value: "completed",   label: "Completed",   icon: CheckCircle2 },
          ]}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search progress…"
            className={`${CONTROL_H} pl-10 pr-3 text-sm rounded-lg bg-white/5 border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-primary leading-none`}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className={`${CONTROL_H} appearance-none pr-10 pl-3 text-sm rounded-lg bg-white/5 border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-primary leading-none`}
          >
            <option className="text-black bg-white" value="progress-desc">Watched % (high → low)</option>
            <option className="text-black bg-white" value="timeleft-asc">Time left (low → high)</option>
            <option className="text-black bg-white" value="added-desc">Recently added</option>
            <option className="text-black bg-white" value="title-asc">Title (A → Z)</option>
            <option className="text-black bg-white" value="title-desc">Title (Z → A)</option>
          </select>
          <SortAsc className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="inline-flex rounded-lg overflow-hidden border border-white/10">
          <button
            onClick={() => setView("list")}
            className={`${CONTROL_H} px-4 inline-flex items-center justify-center ${
              view === "list" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
            }`}
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`${CONTROL_H} px-4 inline-flex items-center justify-center ${
              view === "grid" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressToolbar
