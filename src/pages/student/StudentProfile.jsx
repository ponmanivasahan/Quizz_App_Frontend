import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-slide-up stagger-1">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
        
        <div className="px-8 pb-10 relative">
          <div className="absolute -top-16 border-4 border-white rounded-full bg-white shadow-lg">
            <div className="w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center text-4xl font-bold text-indigo-600">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
          
          <div className="pt-16">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Student Name'}</h2>
            <p className="text-gray-500 font-medium">{user?.email}</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <User className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Full Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Account Role</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role || 'Student'}</p>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Joined</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
