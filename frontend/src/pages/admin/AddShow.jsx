import React, { useState } from "react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AddShow = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    type: "movie",               // movie | tv
    backdrop_path: "",
    vote_average: "",
    genres: "",                  // "Action, Drama"
    release_date: "",            // yyyy-mm-dd
    runtime: "",                 // minutes (movies only)
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      const payload = {
        ...formData,
        vote_average: parseFloat(formData.vote_average || "0"),
      };
      const res = await fetch(`${API_BASE}/api/admin/shows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add");
      alert("Show added successfully!");
      navigate("/admin/edit-shows");
    } catch (e) {
      console.error(e);
      alert("Failed to add show.");
    } finally {
      setSubmitting(false);
    }
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
            placeholder="Inception"
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

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm text-gray-300">Poster / Backdrop URL</label>
          <input
            name="backdrop_path"
            value={formData.backdrop_path}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
            placeholder="https://image.tmdb.org/t/p/w780/....jpg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Vote Average (0–10)</label>
          <input
            name="vote_average"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.vote_average}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
            placeholder="8.7"
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

        {formData.type === "movie" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">Runtime (minutes)</label>
            <input
              name="runtime"
              type="number"
              min="0"
              value={formData.runtime}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
              placeholder="148"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm text-gray-300">Genres (comma separated)</label>
          <input
            name="genres"
            value={formData.genres}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
            placeholder="Action, Sci-Fi"
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary/20 hover:bg-primary/30 disabled:opacity-50 text-white px-6 py-2 rounded-md transition"
          >
            {submitting ? "Submitting…" : "Submit Show"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShow;
