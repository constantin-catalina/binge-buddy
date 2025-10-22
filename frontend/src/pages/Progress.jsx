import React, { useEffect, useMemo, useState } from "react"
import BlurCircle from "../components/BlurCircle"
import ProgressToolbar from "../components/ProgressToolbar"
import ProgressGridCard from "../components/ProgressGridCard"
import ProgressRowCard from "../components/ProgressRowCard"
import { CheckCircle2, Clock3, Tv } from "lucide-react"
import { useAuth } from "@clerk/clerk-react"
import { listProgress } from "../lib/progressApi"

const CONTROL_H = "h-12"

// minutes -> "1d 2h 3m"
const minutesToDHm = (mins = 0) => {
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = Math.floor(mins % 60)
  const parts = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m || parts.length === 0) parts.push(`${m}m`)
  return parts.join(" ")
}

const Progress = () => {
  const { getToken } = useAuth()
  const [kind, setKind] = useState("all")         // "all" | "movie" | "tv"
  const [status, setStatus] = useState("all")     // "all" | "inprogress" | "completed"
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("progress-desc")
  const [view, setView] = useState("grid")
  const [baseItems, setBaseItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      try {
        const { items } = await listProgress(getToken)
        if (ignore) return
        const mapped = (items || []).map(w => {
          const isMovie = w.type === "movie"
          const runtime = Number(w.runtime || 0)

          // Movies are considered completed (1/1), 100% watched, 0m left
          const totalEpisodes   = isMovie ? 1 : (w.episodesTotal || 0)
          const episodesWatched = isMovie ? 1 : (w.episodesWatched || 0)
          const minutesLeft     = isMovie ? 0 : (w.runtime ? Math.max(0, (totalEpisodes - episodesWatched) * w.runtime) : 0)
          const minutesWatched  = Number(w.minutesWatched || (isMovie ? runtime : 0))

          return {
            id: String(w.itemId),
            type: w.type,
            title: w.title,
            posterUrl: w.poster,
            totalEpisodes,
            episodesWatched,
            plays: w.plays || (isMovie ? 1 : 0),
            minutesWatched,
            minutesLeft,
            rating: w.rating,
            genres: w.genres || [],
            lastWatched: w.lastWatched || null,
          }
        })
        setBaseItems(mapped)
      } finally {
        setLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [getToken])

  // Filters / search / sort
  const filteredSorted = useMemo(() => {
    let list = [...baseItems]

    if (kind !== "all") list = list.filter(i => i.type === kind)

    if (status !== "all") {
      list = list.filter(i => {
        // for movies we set totalEpisodes=1, episodesWatched=1 so they count as completed
        const done = i.episodesWatched >= i.totalEpisodes
        if (status === "completed")   return done
        if (status === "inprogress")  return i.episodesWatched > 0 && !done
        return true
      })
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q))
    }

    list.sort((a, b) => {
      if (sort === "progress-desc") {
        const pa = (a.episodesWatched || 0) / Math.max(1, a.totalEpisodes || 1)
        const pb = (b.episodesWatched || 0) / Math.max(1, b.totalEpisodes || 1)
        return pb - pa
      }
      if (sort === "timeleft-asc") return (a.minutesLeft || 0) - (b.minutesLeft || 0)
      if (sort === "title-asc")    return a.title.localeCompare(b.title)
      if (sort === "title-desc")   return b.title.localeCompare(a.title)
      return 0
    })

    return list
  }, [baseItems, kind, status, query, sort])

  // Top stats
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
        <h1 className="text-4xl font-semibold">Progress</h1>

        <ProgressToolbar
          kind={kind} setKind={setKind}
          status={status} setStatus={setStatus}
          query={query} setQuery={setQuery}
          sort={sort} setSort={setSort}
          view={view} setView={setView}
        />

        <div className={`${CONTROL_H} px-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-8`}>
          <Stat icon={CheckCircle2} value={`${watchedPercent}%`} label="Watched" />
          <Stat icon={Clock3} value={minutesToDHm(totalMinutesLeft)} label="Time left to watch" />
          <Stat icon={Tv} value={`${totalShows} Shows`} />
        </div>

        {loading ? (
          <div className="text-gray-300 mt-4">Loading…</div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-gray-300 mt-4">Your progress items will appear here…</div>
        ) : view === "grid" ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSorted.map(item => (
              <ProgressGridCard
                key={item.id}
                item={{
                  posterUrl: item.posterUrl,
                  percent: (item.type === "movie")
                    ? 100
                    : (item.episodesWatched / Math.max(1, item.totalEpisodes)) * 100,
                  accent: "bg-primary",
                  episode: item.type === "movie" ? null : (item.lastWatched && {
                    code: item.lastWatched.code,
                    name: item.lastWatched.name,
                  }),
                  showTitle: item.title,
                  watchedLabel:
                    item.type === "movie" || item.episodesWatched >= item.totalEpisodes
                      ? "100% watched!"
                      : undefined,
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

const Stat = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-white/10 inline-flex items-center justify-center">
      <Icon className="w-4 h-4 text-white/90" />
    </div>
    <div className="inline-flex items-center gap-2 leading-none">
      <span className="text-2xl font-bold text-primary">{value}</span>
      {label && <span className="uppercase tracking-wide text-gray-300 text-sm">{label}</span>}
    </div>
  </div>
)

export default Progress
