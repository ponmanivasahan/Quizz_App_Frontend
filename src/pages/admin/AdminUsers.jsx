import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { Search, Filter } from 'lucide-react';
import UserCard from '../../components/ui/UserCard';
import Modal from '../../components/ui/Modal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modals state
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToView, setUserToView] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userApi.getAllUsers();
      // Ensure data is array, depending on backend response format e.g. data.users vs data
      setUsers(Array.isArray(data) ? data : (data.users || data.data || []));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('GET /api/users endpoint not found on backend.');
      } else {
        setError('Failed to load users.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userApi.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleView = (user) => {
    setUserToView(user);
  };

  const handleEdit = (user) => {
    alert(`Edit functionality for ${user.name} will be implemented here.`);
  };

  const handleBlock = (user) => {
    if (window.confirm(`Are you sure you want to block ${user.name}?`)) {
      alert(`${user.name} has been blocked (UI simulation).`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl  border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="p-12 text-center flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-white rounded-xl  border border-gray-100">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl  border border-gray-100">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onBlock={handleBlock}
            />
          ))}
        </div>
      )}

      {/* View Details Modal */}
      <Modal 
        isOpen={!!userToView} 
        onClose={() => setUserToView(null)} 
        title="User Details"
        maxWidth="max-w-md"
      >
        {userToView && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {userToView.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userToView.name}</h3>
                <p className="text-gray-500">{userToView.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-100 p-3 rounded-lg">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Role</span>
                <span className="font-semibold text-gray-900 capitalize">{userToView.role}</span>
              </div>
              <div className="border border-gray-100 p-3 rounded-lg">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              <div className="border border-gray-100 p-3 rounded-lg col-span-2">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Joined Date</span>
                <span className="font-semibold text-gray-900">{new Date(userToView.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">{userToDelete?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setUserToDelete(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            onClick={confirmDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
