import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Phone, Mail, Calendar, Clock, Loader, RefreshCw, Download, Filter, Shield, Plus, X, Save } from 'lucide-react';
import { getProjectId, getPublicAnonKey, getFunctionUrl } from '../config/supabase';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  last_sign_in: string | null;
  provider: string;
}

interface UsersAdminProps {
  currentUserRole?: string;
}

export const UsersAdmin = ({ currentUserRole = 'admin' }: UsersAdminProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/users'),
        {
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          throw new Error(data.error || 'Failed to fetch users');
        }
      } else {
        throw new Error('Server unavailable');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreatingUser(true);
    try {
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/signup'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser)
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('User created successfully! 🎉');
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', phone: '', role: 'customer' });
        fetchUsers(); // Refresh list
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            User Management
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
              {users.length} Users
            </span>
          </h2>
          <p className="text-gray-600">View and manage registered users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg shadow-orange-500/30"
            style={{ background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)' }}
          >
            <Plus className="w-5 h-5" />
            Create User
          </motion.button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white/50 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-orange-400 outline-none transition-all"
          />
        </div>
        <button className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter
        </button>
        <button className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-orange-50/50">
                <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm">User Profile</th>
                <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm">Role</th>
                <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm">Contact Info</th>
                <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm">Joined Date</th>
                <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-white/80 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden border border-orange-200">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{user.provider} User</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                        user.role === 'manager' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        user.role === 'staff' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        <span className="capitalize">{user.role || 'Customer'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <Shield className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-bold">No users found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <h3 className="font-black text-xl text-gray-900">Create New User</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white appearance-none"
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Kitchen Staff</option>
                        {currentUserRole === 'admin' && (
                          <>
                            <option value="manager">Store Manager</option>
                            <option value="admin">Super Admin</option>
                            <option value="support">Support Agent</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={creatingUser}
                    className="px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    style={{ background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)' }}
                  >
                    {creatingUser ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
