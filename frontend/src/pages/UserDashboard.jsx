import React from 'react'
import BlurCircle from '../components/BlurCircle'
import { FaTv, FaFilm, FaFolder, FaPlay, FaClock, FaHeart, FaComment } from 'react-icons/fa'
import bgImage from '../assets/september-review.jpg'
import { useUser } from '@clerk/clerk-react'
import Loading from '../components/Loading'

const UserDashboard = () => {
  const { user, isLoaded } = useUser()

  // Handle loading or unauthenticated user
  if (!isLoaded) return <Loading />
  if (!user) return <p className="text-center text-gray-400 mt-20">You need to sign in to view your dashboard.</p>

  const userStats = {
    joinDate: '6 AUG 2020 22:46', // could be replaced with new Date(user.createdAt).toLocaleDateString()
    tvTime: '36d 8h 20m',
    tvEpisodes: 1202,
    tvPlays: 1240,
    tvShows: 93,
    movieTime: '16d 10h 49m',
    moviePlays: 214,
    moviesWatched: 209,
    month: 'september',
    monthStats: {
      plays: 5,
      hours: 4,
      ratings: 0,
      comments: 0,
      firstPlay: {
        show: 'Wednesday',
        episode: '2x05 "Hyde and Woe Seek"',
      },
    },
  }

  const {
    joinDate, tvTime, tvEpisodes, tvPlays, tvShows,
    movieTime, moviePlays, moviesWatched, month, monthStats
  } = userStats

  return (
    <div className="relative overflow-hidden text-white">
      <BlurCircle top="60px" left="-80px" />
      <BlurCircle bottom="0" right="-80px" />

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-20 mt-32 mb-8">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center gap-6">
          <img
            src={user.imageUrl}
            alt="User avatar"
            className="w-16 h-16 rounded-full object-cover border border-white/10"
          />
          <div>
            <h1 className="text-3xl font-semibold">Hello, {user.firstName || user.username}</h1>
            <p className="text-sm text-gray-300">MEMBER SINCE {joinDate}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-20 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TV */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex gap-4 items-start">
          <FaTv className="text-white text-2xl mt-1" />
          <div>
            <div className="text-sm text-gray-300">{tvTime} watched</div>
            <div className="font-semibold">
              {tvEpisodes.toLocaleString()} episodes ({tvShows} shows)
            </div>
          </div>
        </div>

        {/* Movies */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex gap-4 items-start">
          <FaFilm className="text-white text-2xl mt-1" />
          <div>
            <div className="text-sm text-gray-300">{movieTime} watched</div>
            <div className="font-semibold">
              {moviesWatched} movies ({moviePlays} plays)
            </div>
          </div>
        </div>

        {/* Library */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex gap-4 items-start">
          <FaFolder className="text-white text-2xl mt-1" />
          <div>
            <div className="text-sm text-gray-300">Library</div>
            <div className="font-semibold">0 episodes (0 shows), 0 movies</div>
          </div>
        </div>
      </div>

      {/* Month in Review */}
      <div className="relative">
        <div
          className="relative h-[460px] flex items-center justify-center text-white"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Month Title & Stats/First Play Grid Layout */}
          <div className="relative z-10 px-4 max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-12 text-center md:text-left">
              your <span className="text-primary lowercase">{month}</span> in review
            </h2>

            <div className="flex flex-col md:flex-row gap-10 items-stretch">
              {/* Stats 2x2 grid */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                <StatCard icon={<FaPlay />} label="Plays" value={monthStats.plays} />
                <StatCard icon={<FaClock />} label="Hours" value={monthStats.hours} />
                <StatCard icon={<FaHeart />} label="Ratings" value={monthStats.ratings} />
                <StatCard icon={<FaComment />} label="Comments" value={monthStats.comments} />
              </div>

              {/* First Play Info */}
              <div className="bg-white/10 p-6 rounded-xl border border-white/20 text-left flex-1">
                <div>
                  <p className="uppercase text-sm text-gray-300 tracking-wider mb-2">
                  First Play of <span className="text-white capitalize">{month}</span>
                  </p>
                  <h3 className="text-3xl font-bold mb-1">{monthStats.firstPlay.show}</h3>
                  <p className="text-lg">{monthStats.firstPlay.episode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable stat card component
const StatCard = ({ icon, label, value }) => (
  <div className="bg-[--color-primary-dull] p-4 rounded-xl flex flex-col items-center justify-center space-y-2">
    <div className="text-white text-2xl">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-300 uppercase">{label}</div>
  </div>
)

export default UserDashboard
