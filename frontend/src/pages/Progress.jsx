import React, { useMemo, useState } from "react"
import BlurCircle from "../components/BlurCircle"
import ProgressToolbar from "../components/ProgressToolbar"
import ProgressGridCard from "../components/ProgressGridCard"
import ProgressRowCard from "../components/ProgressRowCard"
import { CheckCircle2, Clock3, Tv } from "lucide-react"
import { dummyShowsData } from "../lib/dummyShowsData"

const CONTROL_H = "h-12" // match toolbar height

// Format total minutes into 1d 2h 3m
const minutesToDHm = (mins) => {
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = Math.floor(mins % 60)
  const parts = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m || parts.length === 0) parts.push(`${m}m`)
  return parts.join(" ")
}

// Convert dummy data into mock progress entries
const mapShowToProgress = (s, idx) => {
  const totalEpisodes = 10 + idx * 2
  const episodesWatched = Math.floor(totalEpisodes * (idx % 4) / 4)
  const runtime = Number(s.runtime) || 40 // minutes per episode estimate

  return {
    id: s._id,
    type: "tv",
    title: s.title,
    posterUrl: s.backdrop_path,
    totalEpisodes,
    episodesWatched,
    percent: (episodesWatched / totalEpisodes) * 100,
    minutesWatched: episodesWatched * runtime,
    minutesLeft: (totalEpisodes - episodesWatched) * runtime,
    rating: s.vote_average,
    genres: s.genres.map(g => g.name),
    lastWatched: {
      code: `1x0${episodesWatched || 1}`,
      name: "Sample Episode",
      at: "2025-09-11T22:56:00",
    },
  }
}

// Small stat bubble at top
const Stat = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-white/10 inline-flex items-center justify-center">
      <Icon className="w-4 h-4 text-white/90" />
    </div>
    <div className="inline-flex items-center gap-2 leading-none">
      <span className="text-2xl font-bold text-primary">{value}</span>
      {label && (
        <span className="uppercase tracking-wide text-gray-300 text-sm">{label}</span>
      )}
    </div>
  </div>
)

const Progress = () => {
  const [kind, setKind] = useState("all")           // "all" | "movie" | "tv"
  const [status, setStatus] = useState("all")       // "all" | "inprogress" | "completed"
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("progress-desc")
  const [view, setView] = useState("grid")

  // Map dummy data into mock progress items
  const baseItems = useMemo(() => dummyShowsData.map(mapShowToProgress), [])

  // Apply filters / sort / search
  const filteredSorted = useMemo(() => {
    let list = [...baseItems]

    if (kind !== "all") list = list.filter(i => i.type === kind)

    if (status !== "all") {
      list = list.filter(i => {
        const done = i.totalEpisodes > 0 && i.episodesWatched >= i.totalEpisodes
        if (status === "completed") return done
        if (status === "inprogress") return i.episodesWatched > 0 && !done
        return true
      })
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q))
    }

    // Sorting
    list.sort((a, b) => {
      if (sort === "progress-desc") {
        const pa = (a.episodesWatched || 0) / Math.max(1, a.totalEpisodes || 1)
        const pb = (b.episodesWatched || 0) / Math.max(1, b.totalEpisodes || 1)
        return pb - pa
      }
      if (sort === "timeleft-asc") return (a.minutesLeft || 0) - (b.minutesLeft || 0)
      if (sort === "title-asc") return a.title.localeCompare(b.title)
      if (sort === "title-desc") return b.title.localeCompare(a.title)
      return 0
    })

    return list
  }, [baseItems, kind, status, query, sort])

  // Aggregate stats
  const totalShows = filteredSorted.length
  const totalMinutesLeft = filteredSorted.reduce((s, i) => s + (i.minutesLeft || 0), 0)
  const totalMinutesWatched = filteredSorted.reduce((s, i) => s + (i.minutesWatched || 0), 0)
  const watchedPercent =
    totalMinutesWatched + totalMinutesLeft > 0
      ? Math.round((totalMinutesWatched / (totalMinutesWatched + totalMinutesLeft)) * 100)
      : 0

  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh]">
      <BlurCircle top="120px" left="-60px" />
      <BlurCircle bottom="80px" right="-40px" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}
        <h1 className="text-4xl font-semibold">Progress</h1>

        {/* Toolbar */}
        <ProgressToolbar
          kind={kind}
          setKind={setKind}
          status={status}
          setStatus={setStatus}
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          view={view}
          setView={setView}
        />

        {/* Top Stats */}
        <div className={`${CONTROL_H} px-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-8`}>
          <Stat icon={CheckCircle2} value={`${watchedPercent}%`} label="Watched" />
          <Stat icon={Clock3} value={minutesToDHm(totalMinutesLeft)} label="Time left to watch" />
          <Stat icon={Tv} value={`${totalShows} Shows`} />
        </div>

        {/* Cards Section */}
        {filteredSorted.length === 0 ? (
          <div className="text-gray-300 mt-4">Your progress items will appear here…</div>
        ) : view === "grid" ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSorted.map(item => (
              <ProgressGridCard
                key={item.id}
                item={{
                  posterUrl: item.posterUrl,
                  percent: (item.episodesWatched / Math.max(1, item.totalEpisodes)) * 100,
                  accent: "bg-primary",
                  episode: item.lastWatched && {
                    code: item.lastWatched.code,
                    name: item.lastWatched.name,
                  },
                  showTitle: item.title,
                  watchedLabel:
                    item.episodesWatched >= item.totalEpisodes ? "100% watched!" : undefined,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredSorted.map(item => (
              <ProgressRowCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Progress
