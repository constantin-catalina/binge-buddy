import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AddUser = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to invite user");
      alert("Invitation sent!");
      navigate("/admin/edit-users");
    } catch (err) {
      console.error(err);
      alert("Could not invite user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <Title text1="Add" text2="User" />
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

        <div className="sm:col-span-2">
          <label className="block mb-1 text-sm text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-black border border-gray-600 text-white"
          />
        </div>

        <div className="sm:col-span-2 text-right">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary/20 hover:bg-primary/30 disabled:opacity-50 text-white px-6 py-2 rounded-md transition"
          >
            {submitting ? "Sending…" : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
