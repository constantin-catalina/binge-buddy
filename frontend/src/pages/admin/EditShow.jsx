import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import { dummyShowsData } from '../../lib/dummyShowsData';

const EditShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    backdrop_path: '',
    vote_average: '',
    genres: '',
    release_date: '',
    runtime: '',
  });

  useEffect(() => {
    const existing = dummyShowsData.find(s => s._id === id);
    if (existing) {
      setShow(existing);
      setFormData({
        ...existing,
        type: existing.runtime ? 'movie' : 'tv',
        genres: existing.genres.map(g => g.name).join(', '),
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...formData,
      vote_average: parseFloat(formData.vote_average),
      genres: formData.genres.split(',').map(name => ({ name: name.trim() })),
    };
    console.log('Updated Show:', updated);
    alert('Show updated!');
    navigate('/admin/edit-shows');
  };

  if (!show) return <p className="text-gray-400 mt-10">Loading show...</p>;

  return (
    <div className="relative">
      <Title text1="Edit" text2="Show" />
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
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Vote Average</label>
          <input
            name="vote_average"
            type="number"
            step="0.1"
            value={formData.vote_average}
            onChange={handleChange}
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
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Release Date</label>
          <input
            name="release_date"
            type="date"
            value={formData.release_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        {formData.type === 'movie' && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">Runtime (minutes)</label>
            <input
              name="runtime"
              type="number"
              value={formData.runtime}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
            />
          </div>
        )}

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-primary/20 hover:bg-primary/30 text-white px-6 py-2 rounded-md transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditShow;
