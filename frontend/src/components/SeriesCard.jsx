import { StarIcon } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat';

const SeriesCard = ({show}) => {

    const navigate = useNavigate();

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl
    hover:-translate-y-1 transition duration-300 w-66'>
        
        <img onClick={() => {
            navigate(`/series/${show._id}`); 
            scrollTo(0,0)}
        }
        src={show.backdrop_path} 
        alt=""
        className='rounded-lg h-52 w-full object-cover
        object-right-bottom cursor-pointer'/>

        <p className='font-semibold mt-2 truncate'>{show.title}</p>

        <p className='text-sm text-gray-400 mt-2'>
            {new Date(show.release_date).getFullYear()} • {show.genres.slice(0,2).map((genre) => genre.name).join(' | ')} • {timeFormat(show.runtime)}
        </p>

        <div className='flex items-center justify-between mt-4 pb-3'>
            <button onClick={() => {navigate(`/series/${show._id}`); scrollTo(0,0)}}
            className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull
            transition rounded-full font-medium cursor-pointer'>More details</button>
            <p>
                <StarIcon className='w-4 h-4 text-primary fill-primary'/>
                {show.vote_average.toFixed(1)}
            </p>
        </div>

    </div>
  )
}

export default SeriesCard