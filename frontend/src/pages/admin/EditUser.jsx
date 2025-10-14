import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';

const dummyUsers = [
  { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  { _id: '3', firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com' },
  { _id: '4', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' },
];

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    const user = dummyUsers.find(u => u._id === id);
    if (user) {
      setFormData(user);
    } else {
      alert("User not found");
      navigate('/admin/edit-users');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated User:", formData);
    alert("User updated!");
    navigate('/admin/edit-users');
  };

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
