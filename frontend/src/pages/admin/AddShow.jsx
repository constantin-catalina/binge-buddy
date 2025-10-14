import React, { useState } from 'react';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import { useNavigate } from 'react-router-dom';

const AddShow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    backdrop_path: '',
    vote_average: '',
    genres: '',
    release_date: '',
    runtime: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newShow = {
      _id: Date.now().toString(),
      ...formData,
      vote_average: parseFloat(formData.vote_average),
      genres: formData.genres.split(',').map(name => ({ name: name.trim() })),
    };

    console.log('Submitted show:', newShow);
    alert('Show added successfully!');

    navigate('/admin/list-shows');
  };

  return (
    <div className="relative">
      <Title text1="Add" text2="Show" />
      <BlurCircle top="-100px" left="0" />

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/10 border border-primary/20 p-6 rounded-lg"
      >
        <div>
          <label className="block mb-1 text-sm text-gray-300">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          >
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Poster URL</label>
          <input
            name="backdrop_path"
            value={formData.backdrop_path}
            onChange={handleChange}
            placeholder="/your-image.jpg"
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Vote Average</label>
          <input
            name="vote_average"
            value={formData.vote_average}
            onChange={handleChange}
            type="number"
            step="0.1"
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm text-gray-300">Genres (comma separated)</label>
          <input
            name="genres"
            value={formData.genres}
            onChange={handleChange}
            placeholder="Action, Thriller"
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Release Date</label>
          <input
            name="release_date"
            value={formData.release_date}
            onChange={handleChange}
            type="date"
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Runtime (in minutes)</label>
          <input
            name="runtime"
            value={formData.runtime}
            onChange={handleChange}
            type="number"
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-primary/20 hover:bg-primary/30 text-white px-6 py-2 rounded-md transition"
          >
            Submit Show
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShow;
