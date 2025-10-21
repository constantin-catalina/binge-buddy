import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/show/movies?page=${page}&limit=32`);
        const json = await res.json();
        setMovies(json.movies || []);
        setTotalPages(json.pageCount || 1);
      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [page, API_BASE]);

  if (loading && movies.length === 0) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loading />
      </div>
    );
  }

  return movies.length > 0 ? (
    <div className='relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className="text-4xl font-semibold mb-8 sm:mb-10 md:mb-12 lg:mb-14">Trending Movies</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white text-lg">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No movies available...</h1>
    </div>
  );
};

export default Movies;
