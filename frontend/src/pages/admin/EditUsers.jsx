import React, { useEffect, useState } from 'react';
import { PencilIcon, Trash2Icon, PlusIcon, SearchIcon } from 'lucide-react';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import { useNavigate } from 'react-router-dom';
import { dummyUsers } from '../../lib/dummyUsers';

const EditUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setUsers(dummyUsers);
  }, []);

  const handleDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      setUsers(prev => prev.filter(user => user._id !== id));
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-users/${id}`);
  };

  const handleAdd = () => {
    navigate('/admin/add-user');
};

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

      <div className="grid gap-4 mt-6 w-full">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(user._id)} className="text-primary hover:text-white transition">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-white transition">
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-6">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default EditUsers;