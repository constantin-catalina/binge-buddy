import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EditShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    type: "movie",
    backdrop_path: "",
    vote_average: "",
    genres: "",
    release_date: "",
    runtime: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/admin/shows/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Not found");
        const { show } = await res.json();
        setFormData({
          title: show.title,
          type: show.type,
          backdrop_path: show.backdrop_path || "",
          vote_average: show.vote_average,
          genres: show.genres.map(g => g.name).join(", "),
          release_date: show.release_date || "",
          runtime: show.type === "movie" ? (show.runtime || "") : "",
        });
      } catch (e) {
        alert("Show not found");
        navigate("/admin/edit-shows");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        ...formData,
        vote_average: parseFloat(formData.vote_average),
        // backend accepts "Action, Drama" too; sending string is fine
      };
      const res = await fetch(`${API_BASE}/api/admin/shows/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      alert("Show updated!");
      navigate("/admin/edit-shows");
    } catch (e) {
      console.error(e);
      alert("Failed to update show.");
    }
  };

  if (loading) return <p className="text-gray-400 mt-10">Loading show...</p>;

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
          <input name="title" value={formData.title} onChange={handleChange} required
                 className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white" />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Type</label>
          <select name="type" value={formData.type} onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white">
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Poster URL</label>
          <input name="backdrop_path" value={formData.backdrop_path} onChange={handleChange} required
                 className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white" />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Vote Average</label>
          <input name="vote_average" type="number" step="0.1" value={formData.vote_average}
                 onChange={handleChange} required
                 className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white" />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm text-gray-300">Genres (comma separated)</label>
          <input name="genres" value={formData.genres} onChange={handleChange} required
                 className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white" />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Release Date</label>
          <input name="release_date" type="date" value={formData.release_date}
                 onChange={handleChange} required
                 className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white" />
        </div>

        {formData.type === "movie" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">Runtime (minutes)</label>
            <input name="runtime" type="number" value={formData.runtime} onChange={handleChange}
                   className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white" />
          </div>
        )}

        <div className="md:col-span-2 text-right">
          <button type="submit" className="bg-primary/20 hover:bg-primary/30 text-white px-6 py-2 rounded-md transition">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditShow;
