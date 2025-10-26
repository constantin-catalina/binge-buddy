import React, { useEffect, useMemo, useState } from "react";
import { PencilIcon, Trash2Icon, PlusIcon, SearchIcon, StarIcon } from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EditShows = () => {
  const [shows, setShows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url = new URL(`${API_BASE}/api/admin/shows`);
      if (searchTerm) url.searchParams.set("q", searchTerm);
      if (typeFilter !== "all") url.searchParams.set("type", typeFilter);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setShows(json.shows || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();}, []);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [searchTerm, typeFilter]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this show?");
    if (!ok) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/admin/shows/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setShows((arr) => arr.filter((s) => s._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete show.");
    }
  };

  const handleEdit = (id) => navigate(`/admin/edit-shows/${id}`);
  const handleAdd  = () => navigate("/admin/add-show");

  const filteredShows = useMemo(() => shows, [shows]);

  return (
    <div className="relative">
      <Title text1="Edit" text2="Shows" />
      <BlurCircle top="-100px" left="0" />

      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-md border border-primary/20">
          <SearchIcon className="w-4 h-4 text-primary" />
          <input
            type="text"
            placeholder="Search title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none text-sm text-white placeholder:text-gray-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-md text-sm text-white appearance-none"
        >
          <option className="text-black" value="all">All Types</option>
          <option className="text-black" value="movie">Movies</option>
          <option className="text-black" value="tv">TV Shows</option>
        </select>

        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 text-sm rounded-md transition"
        >
          <PlusIcon className="w-4 h-4" />
          Add Show
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-6">Loading…</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
          {filteredShows.length ? filteredShows.map((show) => (
            <div key={show._id} className="bg-primary/10 border border-primary/20 rounded-lg overflow-hidden">
              <img src={show.backdrop_path} alt={show.title} className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="font-medium truncate">{show.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {show.genres.map(g => g.name).join(", ")}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-1 text-sm text-primary font-semibold">
                    <StarIcon className="w-4 h-4 fill-primary" />
                    {show.vote_average.toFixed(1)}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(show._id)} className="text-primary hover:text-white transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(show._id)} className="text-red-500 hover:text-white transition">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 mt-6">No shows found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EditShows;
