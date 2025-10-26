// src/pages/admin/EditUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { PencilIcon, Trash2Icon, PlusIcon, SearchIcon } from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EditUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const load = async (q = "") => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_BASE}/api/admin/users?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setUsers(json.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = (id) => navigate(`/admin/edit-users/${id}`);
  const handleAdd = () => navigate("/admin/add-user");

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((u) => {
      const full = `${u.firstName} ${u.lastName}`.toLowerCase();
      return full.includes(q) || (u.email || "").toLowerCase().includes(q);
    });
  }, [users, searchTerm]);

  return (
    <div className="relative">
      <Title text1="Edit" text2="Users" />
      <BlurCircle top="-100px" left="0" />

      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-md border border-primary/20">
          <SearchIcon className="w-4 h-4 text-primary" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none text-sm text-white placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 text-sm rounded-md transition"
        >
          <PlusIcon className="w-4 h-4" />
          Add User
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : (
        <div className="grid gap-4 mt-6 w-full">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user._id)}
                    className="text-primary hover:text-white transition"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-500 hover:text-white transition"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-6">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EditUsers;
