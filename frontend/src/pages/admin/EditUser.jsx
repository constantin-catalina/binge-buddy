import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("User not found");
        const { user } = await res.json();
        setFormData(user);
      } catch (e) {
        alert("User not found");
        navigate("/admin/edit-users");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("User updated!");
      navigate("/admin/edit-users");
    } catch (e) {
      console.error(e);
      alert("Failed to update user.");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="relative">
      <Title text1="Edit" text2="User" />
      <BlurCircle top="-100px" left="0" />

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/10 border border-primary/20 p-6 rounded-lg max-w-3xl"
      >
        <div>
          <label className="block mb-1 text-sm text-gray-300">First Name</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Last Name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div className="sm:col-span-2 opacity-60">
          <label className="block mb-1 text-sm text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div className="sm:col-span-2 text-right">
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

export default EditUser;
