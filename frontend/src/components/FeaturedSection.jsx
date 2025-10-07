import { ArrowRight } from 'lucide-react'
import React, { use } from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import { dummyShowsData } from '../lib/dummyShowsData';
import SeriesCard from './SeriesCard';

const FeaturedSection = () => {

    const navigate = useNavigate();

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top='0' right='-80px'/>
            <p className='text-gray-300 font-medium text-lg'>Top Movies</p>
            <button onClick={() => navigate('/movies')} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>
                Show more
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
            </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
            {dummyShowsData.slice(0,4).map((show) =>(
                <MovieCard key={show._id} movie={show}/>
            ))}
        </div>
        
        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top='0' right='-80px'/>
            <p className='text-gray-300 font-medium text-lg'>Top TV Shows</p>
            <button onClick={() => navigate('/series')} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>
                Show more
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
            </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
            {dummyShowsData.slice(0,4).map((tv) =>(
                <SeriesCard key={tv._id} show={tv}/>
            ))}
        </div>
    </div>
  )
}

export default FeaturedSection