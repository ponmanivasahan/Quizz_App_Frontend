import React, { useEffect, useState, useContext } from 'react';
import { userApi } from '../../api/userApi';
import { AuthContext } from '../../context/AuthContext';
import { 
  Search, Filter, GraduationCap, Shield, Users, UserCheck, 
  Eye, Edit, Ban, Trash2, X, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'view', 'edit', 'block', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', status: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const getFriendlyErrorMessage = (status) => {
    switch (status) {
      case 401: return "Authentication required. Please log in again.";
      case 403: return "You don't have permission to perform this action.";
      case 404: return "User not found.";
      case 409: return "This user cannot be modified because of an existing dependency.";
      case 500: return "Something went wrong on the server. Please try again.";
      default: return "Unable to load users. Please check your network connection.";
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getAllUsers();
      const userList = Array.isArray(data) ? data : (data.users || data.data || []);
      // Map isActive/blocked if necessary (default to active if not explicit)
      const mappedUsers = userList.map(u => ({
        ...u,
        status: u.status || (u.isBlocked ? 'blocked' : 'active')
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      setError(getFriendlyErrorMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculations for Summary ---
  const totalUsers = users.length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalActive = users.filter(u => u.status === 'active' || u.isActive).length;

  // --- Filtering ---
  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (u.name || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? (u.status === 'active' || u.isActive) : (u.status === 'blocked' || u.isBlocked));
    return matchesSearch && matchesRole && matchesStatus;
  });

  // --- Pagination ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [searchTerm, roleFilter, statusFilter]);

  // --- Handlers ---
  const openModal = (type, user) => {
    setSelectedUser(user);
    setActiveModal(type);
    if (type === 'edit') {
      setEditForm({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status === 'active' || user.isActive ? 'active' : 'blocked'
      });
    }
    setSuccessMessage('');
  };

  const closeModal = () => {
    if (!isSaving) {
      setActiveModal(null);
      setSelectedUser(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      await userApi.updateUser(selectedUser.id, editForm);
      setSuccessMessage("User updated successfully.");
      // Real-time UI update
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      alert(getFriendlyErrorMessage(err.response?.status));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmBlock = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const newStatus = (selectedUser.status === 'active' || selectedUser.isActive) ? 'blocked' : 'active';
    
    try {
      // Assuming updateUser can handle status changes if a specific block endpoint doesn't exist
      await userApi.updateUser(selectedUser.id, { status: newStatus });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
      closeModal();
    } catch (err) {
      alert(getFriendlyErrorMessage(err.response?.status));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      await userApi.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      closeModal();
    } catch (err) {
      alert(getFriendlyErrorMessage(err.response?.status));
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const hasFilters = searchTerm !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-500 font-medium mt-2">Manage student and administrator accounts, roles, and access.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up stagger-1">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Students', value: totalStudents, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Administrators', value: totalAdmins, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Users', value: totalActive, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-5 h-5 ${card.color}`} /></div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{isLoading ? '-' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Controls: Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 animate-slide-up stagger-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-11 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
            <select
              className="py-3 bg-transparent outline-none font-bold text-gray-700 appearance-none w-full cursor-pointer pr-4"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 w-full sm:w-auto">
            <select
              className="py-3 bg-transparent outline-none font-bold text-gray-700 appearance-none w-full cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          
          {hasFilters && (
            <button 
              onClick={clearFilters}
              className="w-full sm:w-auto px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm animate-slide-up stagger-3">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <button onClick={fetchUsers} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up stagger-3">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-10 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm animate-slide-up stagger-3">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-6">Try changing your search or filters.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedUsers.map((u, index) => {
              const isActive = u.status === 'active' || u.isActive;
              const isCurrentUser = currentUser?.id === u.id;
              
              return (
                <div 
                  key={u.id} 
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col group hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300"
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-inner">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover"/> : getInitials(u.name)}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-base font-bold text-gray-900 truncate" title={u.name}>{u.name}</h3>
                        <p className="text-sm text-gray-500 truncate" title={u.email}>{u.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Role</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                        <span className="capitalize">{u.role}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-semibold ${isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                          {isActive ? 'Active' : 'Blocked'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</span>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal('view', u)} className="p-2 flex justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors tooltip-trigger" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openModal('edit', u)} className="p-2 flex justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors" title="Edit User">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => openModal('block', u)} disabled={isCurrentUser} className={`p-2 flex justify-center rounded-xl transition-colors ${isCurrentUser ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-orange-600 bg-orange-50 hover:bg-orange-100'}`} title={isActive ? "Block User" : "Unblock User"}>
                      <Ban className="w-4 h-4" />
                    </button>
                    <button onClick={() => openModal('delete', u)} disabled={isCurrentUser} className={`p-2 flex justify-center rounded-xl transition-colors ${isCurrentUser ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-red-600 bg-red-50 hover:bg-red-100'}`} title="Delete User">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-bold text-gray-900">{filteredUsers.length}</span> users
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Simple logic to show pages around current
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg font-bold text-sm ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals Container */}
      {activeModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in font-sans">
          
          {/* VIEW MODAL */}
          {activeModal === 'view' && (
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-inner">
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</span>
                    <span className="font-bold text-gray-900 capitalize">{selectedUser.role}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${(selectedUser.status === 'active' || selectedUser.isActive) ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className={`font-bold ${(selectedUser.status === 'active' || selectedUser.isActive) ? 'text-emerald-700' : 'text-red-700'}`}>
                        {(selectedUser.status === 'active' || selectedUser.isActive) ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined Date</span>
                    <span className="font-bold text-gray-900">{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={closeModal} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}

          {/* EDIT MODAL */}
          {activeModal === 'edit' && (
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                <button onClick={closeModal} disabled={isSaving} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {successMessage ? (
                <div className="p-10 text-center animate-fade-in">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                  <p className="text-lg font-bold text-gray-900">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit}>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                        value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                        value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700"
                          value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Account Status</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700"
                          value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={closeModal} disabled={isSaving} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-2 disabled:opacity-70">
                      {isSaving ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Saving...</>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* BLOCK MODAL */}
          {activeModal === 'block' && (
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-zoom-in">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Ban className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {(selectedUser.status === 'active' || selectedUser.isActive) ? 'Block this user?' : 'Unblock this user?'}
              </h3>
              <p className="text-gray-600 mb-6 font-medium">
                {(selectedUser.status === 'active' || selectedUser.isActive) 
                  ? `Are you sure you want to block ${selectedUser.name}? This user will no longer be able to access the portal.` 
                  : `Are you sure you want to unblock ${selectedUser.name}? They will regain access to the portal.`}
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={closeModal} disabled={isSaving} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={confirmBlock} disabled={isSaving} className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-colors flex items-center gap-2">
                  {isSaving ? 'Processing...' : ((selectedUser.status === 'active' || selectedUser.isActive) ? 'Block User' : 'Unblock User')}
                </button>
              </div>
            </div>
          )}

          {/* DELETE MODAL */}
          {activeModal === 'delete' && (
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-zoom-in">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              {currentUser?.id === selectedUser.id ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Action Prohibited</h3>
                  <p className="text-gray-600 mb-6 font-medium">You cannot delete your own administrator account.</p>
                  <div className="flex justify-end">
                    <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Understood
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
                  <p className="text-gray-600 mb-6 font-medium">
                    Are you sure you want to permanently delete <span className="font-bold text-gray-900">{selectedUser.name}</span>'s account? All associated data may be lost. This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={closeModal} disabled={isSaving} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                      Cancel
                    </button>
                    <button onClick={confirmDelete} disabled={isSaving} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors">
                      {isSaving ? 'Deleting...' : 'Delete User'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminUsers;
