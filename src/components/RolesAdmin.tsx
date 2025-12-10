import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Users, 
  Lock, 
  Eye, 
  Save, 
  AlertCircle,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  Settings as SettingsIcon,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Permission {
  id: string;
  label: string;
  description: string;
  module: 'dashboard' | 'products' | 'orders' | 'marketing' | 'users' | 'settings' | 'system';
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[]; // Array of Permission IDs
  isSystem?: boolean; // Cannot be deleted if true
  usersCount: number;
}

// Default Permissions List
const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'view_dashboard', label: 'View Dashboard', description: 'Access to main dashboard stats', module: 'dashboard' },
  
  // Products
  { id: 'view_products', label: 'View Products', description: 'View product list and details', module: 'products' },
  { id: 'create_products', label: 'Create Products', description: 'Add new products', module: 'products' },
  { id: 'edit_products', label: 'Edit Products', description: 'Modify existing products', module: 'products' },
  { id: 'delete_products', label: 'Delete Products', description: 'Remove products', module: 'products' },
  
  // Orders
  { id: 'view_orders', label: 'View Orders', description: 'View incoming orders', module: 'orders' },
  { id: 'manage_orders', label: 'Manage Orders', description: 'Update order status (accept, ready, etc.)', module: 'orders' },
  { id: 'delete_orders', label: 'Delete Orders', description: 'Remove/Cancel orders', module: 'orders' },
  
  // Marketing
  { id: 'view_marketing', label: 'View Marketing', description: 'View deals and banners', module: 'marketing' },
  { id: 'manage_marketing', label: 'Manage Marketing', description: 'Create/Edit deals and banners', module: 'marketing' },
  
  // Users
  { id: 'view_users', label: 'View Users', description: 'View registered users list', module: 'users' },
  { id: 'manage_users', label: 'Manage Users', description: 'Edit user details and roles', module: 'users' },
  
  // Settings
  { id: 'view_settings', label: 'View Settings', description: 'View store settings', module: 'settings' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Modify store configuration', module: 'settings' },
  
  // Roles (System)
  { id: 'view_roles', label: 'View Roles', description: 'View defined roles', module: 'system' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Create/Edit/Delete roles', module: 'system' },
];

// Initial Mock Roles
const INITIAL_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Super Admin',
    description: 'Full access to all system features',
    color: '#EF4444', // Red
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isSystem: true,
    usersCount: 1
  },
  {
    id: 'manager',
    name: 'Store Manager',
    description: 'Can manage products, orders, and marketing',
    color: '#F59E0B', // Orange
    permissions: [
      'view_dashboard', 
      'view_products', 'create_products', 'edit_products', 
      'view_orders', 'manage_orders', 
      'view_marketing', 'manage_marketing',
      'view_users'
    ],
    isSystem: false,
    usersCount: 3
  },
  {
    id: 'staff',
    name: 'Kitchen Staff',
    description: 'Can view and update active orders',
    color: '#10B981', // Green
    permissions: ['view_dashboard', 'view_orders', 'manage_orders'],
    isSystem: false,
    usersCount: 8
  },
  {
    id: 'support',
    name: 'Support Agent',
    description: 'Can view orders and users to help customers',
    color: '#3B82F6', // Blue
    permissions: ['view_dashboard', 'view_orders', 'view_users'],
    isSystem: false,
    usersCount: 2
  }
];

export const RolesAdmin = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    permissions: [] as string[]
  });

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      permissions: []
    });
    setShowModal(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: [...role.permissions]
    });
    setShowModal(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const toggleModulePermissions = (module: string) => {
    const modulePermissions = AVAILABLE_PERMISSIONS.filter(p => p.module === module).map(p => p.id);
    const allSelected = modulePermissions.every(id => formData.permissions.includes(id));
    
    setFormData(prev => {
      let newPermissions = [...prev.permissions];
      if (allSelected) {
        // Unselect all
        newPermissions = newPermissions.filter(id => !modulePermissions.includes(id));
      } else {
        // Select all
        const toAdd = modulePermissions.filter(id => !newPermissions.includes(id));
        newPermissions = [...newPermissions, ...toAdd];
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Role name is required');
      return;
    }

    if (editingRole) {
      // Update existing
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id 
          ? { ...r, ...formData }
          : r
      ));
      toast.success('Role updated successfully');
    } else {
      // Create new
      const newRole: Role = {
        id: `role_${Date.now()}`,
        ...formData,
        usersCount: 0,
        isSystem: false
      };
      setRoles(prev => [...prev, newRole]);
      toast.success('New role created successfully');
    }
    setShowModal(false);
  };

  const handleDelete = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? Users assigned to this role will lose their permissions.')) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'dashboard': return <LayoutDashboard className="w-4 h-4" />;
      case 'products': return <Package className="w-4 h-4" />;
      case 'orders': return <ShoppingBag className="w-4 h-4" />;
      case 'marketing': return <Megaphone className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'settings': return <SettingsIcon className="w-4 h-4" />;
      case 'system': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  // Group permissions by module for the modal
  const permissionsByModule = AVAILABLE_PERMISSIONS.reduce((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = [];
    acc[curr.module].push(curr);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Role Management
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
              {roles.length} Roles
            </span>
          </h2>
          <p className="text-gray-600">Define access levels and permissions for your team</p>
        </div>
        <motion.button
          onClick={handleOpenCreate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg shadow-blue-500/30"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
        >
          <Plus className="w-5 h-5" />
          Create Role
        </motion.button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{role.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{role.usersCount} users assigned</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {role.id !== 'admin' && (
                    <button 
                      onClick={() => handleOpenEdit(role)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit Role"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {role.id === 'admin' && (
                    <div className="p-2 text-gray-300" title="Super Admin cannot be edited">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  {!role.isSystem && (
                    <button 
                      onClick={() => handleDelete(role.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6 h-10 line-clamp-2">
                {role.description || 'No description provided.'}
              </p>

              {/* Permissions Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Access Level</span>
                  <span>{role.permissions.length} / {AVAILABLE_PERMISSIONS.length}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(role.permissions.length / AVAILABLE_PERMISSIONS.length) * 100}%`,
                      backgroundColor: role.color
                    }}
                  />
                </div>

                {/* Quick Capability Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {role.permissions.includes('view_dashboard') && (
                    <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs border border-gray-100">Dashboard</span>
                  )}
                  {role.permissions.includes('manage_products') || role.permissions.includes('create_products') ? (
                    <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs border border-orange-100">Products</span>
                  ) : null}
                  {role.permissions.includes('manage_orders') && (
                    <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs border border-green-100">Orders</span>
                  )}
                  {role.permissions.includes('manage_users') && (
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs border border-blue-100">Users</span>
                  )}
                  {role.permissions.length > 4 && (
                    <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-xs border border-gray-100">
                      +{role.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors"
                      style={{ backgroundColor: formData.color }}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">
                        {editingRole ? 'Edit Role' : 'Create New Role'}
                      </h3>
                      <p className="text-sm text-gray-500">Configure role details and permissions</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Role Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Store Manager"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe what this role is for..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Role Color</label>
                        <div className="flex flex-wrap gap-3">
                          {['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'].map((color) => (
                            <button
                              key={color}
                              onClick={() => setFormData({ ...formData, color })}
                              className={`w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Permissions */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block font-bold text-gray-700">Permissions</label>
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                          {formData.permissions.length} Selected
                        </span>
                      </div>

                      <div className="space-y-6">
                        {Object.entries(permissionsByModule).map(([module, permissions]) => {
                          const modulePermissions = permissions.map(p => p.id);
                          const allSelected = modulePermissions.every(id => formData.permissions.includes(id));
                          const someSelected = modulePermissions.some(id => formData.permissions.includes(id));
                          
                          return (
                            <div key={module} className="border border-gray-200 rounded-xl overflow-hidden">
                              {/* Module Header */}
                              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                                <div className="flex items-center gap-2 font-bold text-gray-700 capitalize">
                                  {getModuleIcon(module)}
                                  {module} Module
                                </div>
                                <button
                                  onClick={() => toggleModulePermissions(module)}
                                  className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                  {allSelected ? 'Unselect All' : 'Select All'}
                                </button>
                              </div>
                              
                              {/* Permissions List */}
                              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {permissions.map((permission) => {
                                  const isSelected = formData.permissions.includes(permission.id);
                                  return (
                                    <div 
                                      key={permission.id}
                                      onClick={() => togglePermission(permission.id)}
                                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        isSelected 
                                          ? 'bg-blue-50 border-blue-200' 
                                          : 'bg-white border-gray-100 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                        isSelected 
                                          ? 'bg-blue-500 border-blue-500' 
                                          : 'bg-white border-gray-300'
                                      }`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                      <div>
                                        <p className={`text-sm font-bold ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                                          {permission.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                  >
                    <Save className="w-5 h-5" />
                    {editingRole ? 'Save Changes' : 'Create Role'}
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
