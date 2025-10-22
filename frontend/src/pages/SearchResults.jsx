import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import BlurCircle from '../components/BlurCircle';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q')?.toLowerCase() || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Failed to fetch search results:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh] text-white">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <h1 className="text-4xl font-semibold mb-8">Search Results for "{searchTerm}"</h1>

      {loading ? (
        <p className="text-gray-400 text-lg">Loading...</p>
      ) : results.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {results.map((item) =>
            item.type === 'movie' ? (
              <MovieCard key={item._id} movie={item} />
            ) : (
              <SeriesCard key={item._id} show={item} />
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <p className="text-gray-400 text-lg">No results found.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
