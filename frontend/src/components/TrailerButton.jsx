import React from 'react'
import { Play } from 'lucide-react'

const TrailerButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 transition"
  >
    <Play className="w-4 h-4" />
    Watch trailer
  </button>
)

export default TrailerButton
