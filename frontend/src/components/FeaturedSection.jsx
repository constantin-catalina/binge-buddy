import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import SeriesCard from './SeriesCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FeaturedSection = () => {
  const navigate = useNavigate();

  const [topMovies, setTopMovies] = useState([]);
  const [topShows, setTopShows] = useState([]);

  useEffect(() => {
  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/show/movies?limit=4`);
      const json = await res.json();
      setTopMovies(json.movies || []);
    } catch (err) {
      console.error('Failed to fetch top movies:', err);
    }
  };

  const fetchShows = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tv/shows?limit=4`);
      const json = await res.json();
      setTopShows(json.shows || []);
    } catch (err) {
      console.error('Failed to fetch top TV shows:', err);
    }
  };

  fetchMovies();
  fetchShows();
}, []);


  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' right='-80px' />
        <p className='text-gray-300 font-medium text-lg'>Top Movies</p>
        <button
          onClick={() => navigate('/movies')}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'
        >
          Show more
          <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
        {topMovies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' right='-80px' />
        <p className='text-gray-300 font-medium text-lg'>Top TV Shows</p>
        <button
          onClick={() => navigate('/series')}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'
        >
          Show more
          <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
        {topShows.map((tv) => (
          <SeriesCard key={tv._id} show={tv} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedSection;
