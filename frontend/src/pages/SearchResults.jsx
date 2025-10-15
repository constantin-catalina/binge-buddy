import React from 'react';
import { useLocation } from 'react-router-dom';
import { dummyShowsData } from '../lib/dummyShowsData';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q')?.toLowerCase() || '';

  const filteredResults = dummyShowsData.filter(show =>
    show.title.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh] text-white">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      
      <h1 className="text-4xl font-semibold mb-8 sm:mb-10 md:mb-12 lg:mb-14">
        Search Results for "{searchTerm}"
      </h1>

      {filteredResults.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filteredResults.map((show) => (
            <MovieCard key={show._id} movie={show} />
          ))}
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
