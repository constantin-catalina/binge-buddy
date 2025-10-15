import React, { useState } from "react"
import BlurCircle from "../components/BlurCircle"
import ProgressToolbar from "../components/ProgressToolbar"
import { CheckCircle2, Clock3, Tv } from "lucide-react"

const CONTROL_H = "h-12" // match toolbar

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

const Progress = () => {
  const [kind, setKind] = useState("all")
  const [status, setStatus] = useState("all")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("progress-desc")
  const [view, setView] = useState("grid")

  // demo values
  const watchedPercent = 23
  const timeLeft = "40d 9h 9m"
  const showsCount = 48

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

        {/* Stats pill — same height as controls */}
        <div className={`${CONTROL_H} px-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-8`}>
          <Stat icon={CheckCircle2} value={`${watchedPercent}%`} label="Watched" />
          <Stat icon={Clock3} value={timeLeft} label="Time left to watch" />
          <Stat icon={Tv} value={`${showsCount} Shows`} />
        </div>

        <div className="mt-4">
          <div className="text-gray-300">Your progress items will appear here…</div>
        </div>
      </div>
    </div>
  )
}

export default Progress
