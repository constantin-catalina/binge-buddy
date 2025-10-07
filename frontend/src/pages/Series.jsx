import React from 'react'
import { dummyShowsData } from '../lib/dummyShowsData'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import SeriesCard from '../components/SeriesCard'

const Series = () => {
  return dummyShowsData.length > 0 ? (
    <div className='relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20
        overflow-hidden min-h-[80vh]'>
        <BlurCircle top="150px" left="0px"/>
        <BlurCircle bottom="50px" right="50px"/>
        <h1 className='text-lg font-medium my-4 mb-10'>Trending Movies</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {dummyShowsData.map((show) => (
            <SeriesCard show={show} key={show._id} />
          ))}
        </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No TV shows available...</h1>
    </div>
  )
}

export default Series