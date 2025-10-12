import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Star as StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import { dummyShowsData } from '../lib/dummyShowsData'
import { mockDescriptions } from '../lib/mockDescriptions'

import TrailerButton from '../components/TrailerButton'
import ActionRail from '../components/ActionRail'
import AvatarRow from '../components/AvatarRow'
import CastGrid from '../components/CastGrid'
import ListCards from '../components/ListCards'
import Loading from '../components/Loading'

import { mockPeopleWatchingNow } from '../lib/mockPeopleWatchingNow'
import { mockCast } from '../lib/mockCast'
import { mockLists } from '../lib/mockLists'

const Details = () => {

  const {id} = useParams()
  const [show, setShow] = useState(null)

  const getShow = async() => {
    const show = dummyShowsData.find(show => show._id === id)
    setShow({
      movie: show
    })
  }

  useEffect(() => {
    getShow()
  }, [id])

  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
        <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
          <img 
          src={show.movie.backdrop_path} 
          alt={show.movie.title}
          className='max-md:mx-auto rounded-xl md:h-96 md:w-64 object-cover flex-none'/>

          <div className='relative flex flex-col gap-3'>
            <BlurCircle top="-100px" left="-100px"/>
            <p className='text-primary'>ENGLISH</p>
            <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
            
            <div className='flex items-center gap-2 text-gray-300'>
              <StarIcon className="w-5 h-5 text-primary fill-primary"/>
              {Number(show.movie.vote_average || 0).toFixed(1)} User Rating
            </div>

            <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
              {timeFormat(show.movie.runtime)} • {show.movie.release_date.split("-")[0]} • {show.movie.genres.map((genre) => genre.name).join(' | ')}
            </p>

            <p className="text-gray-300 mt-3 leading-relaxed">
              {mockDescriptions[show.movie._id] || 'No description available.'}
            </p>

            <TrailerButton onClick={() => {console.log('open trailer modal')}}/>
          </div>
          <ActionRail onAction={(id) => console.log('action:', id)}/>
        </div>

        <AvatarRow
          countLabel="97 watching now"
          avatars={mockPeopleWatchingNow}
          extraCount={86}
        />

        <CastGrid
          cast={mockCast}
          onAllCast={() => console.log('open cast page')}
        />

        <ListCards
          lists={mockLists(show.movie)}
          onAll={() => console.log('open lists page')}
        />

    </div>
  ) : (
    <Loading/>
  )
}

export default Details