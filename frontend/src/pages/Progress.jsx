import React, { useEffect, useMemo, useState } from "react"
import BlurCircle from "../components/BlurCircle"
import ProgressToolbar from "../components/ProgressToolbar"
import ProgressGridCard from "../components/ProgressGridCard"
import ProgressRowCard from "../components/ProgressRowCard"
import { CheckCircle2, Clock3, Tv } from "lucide-react"
import { useAuth } from "@clerk/clerk-react"
import { listProgress, removeProgress, addToHistory } from "../lib/progressApi"

const CONTROL_H = "h-12"
const DEFAULT_TV_RUNTIME_MIN = 45

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
  const [kind, setKind] = useState("all")        // all | movie | tv
  const [status, setStatus] = useState("all")    // all | inprogress | completed
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("progress-desc")
  const [view, setView] = useState(() => localStorage.getItem("progress:view") || "list")
  const [baseItems, setBaseItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem("progress:view", view)
  }, [view])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      try {
        const { items } = await listProgress(getToken)
        if (ignore) return
        const mapped = (items || []).map(w => {
          const isMovie = w.type === "movie"
          const runtimeRaw = Number(w.runtime || 0)
          const runtime = isMovie
            ? (runtimeRaw > 0 ? runtimeRaw : 0)
            : (runtimeRaw > 0 ? runtimeRaw : DEFAULT_TV_RUNTIME_MIN)

          const totalEpisodes   = isMovie ? 1 : Number(w.episodesTotal || 0)
          const episodesWatched = isMovie ? 1 : Number(w.episodesWatched || 0)

          const minutesWatched = isMovie
            ? (runtime || Number(w.minutesWatched || 0) || 0)
            : (episodesWatched * runtime)

          const minutesLeft = isMovie ? 0 : Math.max(0, (totalEpisodes - episodesWatched) * runtime)

          const watchedPct = isMovie
            ? 100
            : (totalEpisodes > 0 ? Math.round((episodesWatched / totalEpisodes) * 100) : 0)

          const _completed = watchedPct >= 100
          const _status = _completed ? "completed" : (episodesWatched > 0 ? "inprogress" : "all")

          return {
            id: String(w.itemId),
            type: w.type,
            title: w.title,
            posterUrl: w.poster,
            backdropUrl: w.backdrop,
            runtime: runtime,
            totalEpisodes,
            episodesWatched,
            plays: w.plays || (isMovie ? 1 : 0),
            minutesWatched,
            minutesLeft,
            rating: w.rating,
            genres: w.genres || [],
            lastWatched: w.lastWatched || null,
            watchedPct,
            status: _status,
          }
        })
        setBaseItems(mapped)
      } finally {
        setLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [getToken])

  const handleRemove = async (item) => {
    const ok = window.confirm(`Remove "${item.title}" from progress?`)
    if (!ok) return
    setBaseItems(curr => curr.filter(i => i.id !== item.id))
    try {
      await removeProgress(item.id, getToken)
    } catch (err) {
      console.error("Failed to remove:", err)
    }
  }

  const handleMarkWatched = async (item) => {
    if (item.type !== "tv") return
    setBaseItems(curr => curr.map(i => {
      if (i.id !== item.id) return i
      const total = Math.max(0, i.totalEpisodes || 0)
      const totalMinutes = (i.minutesWatched || 0) + (i.minutesLeft || 0)
      return {
        ...i,
        episodesWatched: total,
        minutesWatched: totalMinutes,
        minutesLeft: 0,
        watchedPct: 100,
        status: "completed",
      }
    }))

    try {
      await addToHistory({
        itemId: item.id,
        type: "tv",
        title: item.title,
        poster: item.posterUrl,
        backdrop: item.backdropUrl,
        runtime: item.runtime || DEFAULT_TV_RUNTIME_MIN,
        incPlays: 1,
        incMinutes: item.minutesLeft || 0,
        tv: {
          episodesTotal: item.totalEpisodes,
          setEpisodesWatched: item.totalEpisodes,
          last: {
            code: item.lastWatched?.code,
            name: item.lastWatched?.name,
            at: new Date().toISOString(),
          }
        }
      }, getToken)
    } catch (err) {
      console.error("Failed to mark watched:", err)
    }
  }

  const filteredSorted = useMemo(() => {
    let list = [...baseItems]

    if (kind !== "all") list = list.filter(i => i.type === kind)

    if (status !== "all") {
      if (status === "completed")   list = list.filter(i => i.watchedPct >= 100)
      if (status === "inprogress")  list = list.filter(i => i.watchedPct > 0 && i.watchedPct < 100)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q))
    }

    list.sort((a, b) => {
      if (sort === "progress-desc") return (b.watchedPct || 0) - (a.watchedPct || 0)
      if (sort === "timeleft-asc")  return (a.minutesLeft || 0) - (b.minutesLeft || 0)
      if (sort === "title-asc")     return a.title.localeCompare(b.title)
      if (sort === "title-desc")    return b.title.localeCompare(a.title)
      return 0
    })

    return list
  }, [baseItems, kind, status, query, sort])

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
                  id: item.id,
                  title: item.title,
                  posterUrl: item.posterUrl,
                  percent: item.watchedPct,
                  accent: "bg-primary",
                  episode: item.type === "movie" ? null : (item.lastWatched && {
                    code: item.lastWatched.code,
                    name: item.lastWatched.name,
                  }),
                  showTitle: item.title,
                  watchedLabel: item.watchedPct >= 100 ? "100% watched!" : undefined,
                }}
                onRemove={handleRemove}
                onMarkWatched={() => handleMarkWatched(item)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredSorted.map(item => (
              <ProgressRowCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onMarkWatched={handleMarkWatched}
              />
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
