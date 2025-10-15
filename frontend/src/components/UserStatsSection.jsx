import React from 'react';
import { FaTv, FaFilm, FaFolder } from 'react-icons/fa';

const UserStatsSection = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 bg-white/5 border border-white/10 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3">
        <FaTv className="text-white text-2xl" />
        <div>
          <p className="text-sm text-gray-300">36d 8h 20m watched</p>
          <p className="text-base font-semibold text-white">1,202 episodes (1,240 plays of 93 shows)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FaFilm className="text-white text-2xl" />
        <div>
          <p className="text-sm text-gray-300">16d 10h 49m watched</p>
          <p className="text-base font-semibold text-white">209 movies (214 plays)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FaFolder className="text-white text-2xl" />
        <div>
          <p className="text-sm text-gray-300">Library</p>
          <p className="text-base font-semibold text-white">0 episodes (0 shows), 0 movies</p>
        </div>
      </div>
    </div>
  );
};

export default UserStatsSection;
