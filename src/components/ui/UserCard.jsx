import React from 'react';
import { Eye, Edit, Trash2, Ban } from 'lucide-react';

const UserCard = ({ user, onView, onEdit, onDelete, onBlock }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 truncate" title={user.name}>{user.name}</h3>
          <p className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
        }`}>
          {user.role}
        </span>
      </div>
      
      <div className="text-xs text-gray-500 mb-6 flex-grow">
        Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button 
          onClick={() => onView(user)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onEdit(user)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"
          title="Edit User"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onBlock(user)}
          className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
          title="Block User"
        >
          <Ban className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(user)}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
          title="Delete User"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UserCard;
