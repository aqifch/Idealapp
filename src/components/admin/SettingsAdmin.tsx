import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Store, DollarSign, Clock, MapPin, Phone, Mail, Shield, Bell, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsAdminProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export const SettingsAdmin = ({ settings, onUpdateSettings }: SettingsAdminProps) => {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || 'Ideal Point',
    email: settings?.email || 'admin@idealpoint.com',
    phone: settings?.phone || '+92 300 1234567',
    address: settings?.address || '123 Main Street, Karachi, Pakistan',
    currency: settings?.currency || 'PKR',
    deliveryFee: settings?.deliveryFee || 150,
    taxRate: settings?.taxRate || 13,
    minOrder: settings?.minOrder || 500,
    openingTime: settings?.openingTime || '10:00',
    closingTime: settings?.closingTime || '23:00',
    isStoreOpen: settings?.isStoreOpen ?? true,
    enableNotifications: settings?.enableNotifications ?? true,
    autoAcceptOrders: settings?.autoAcceptOrders ?? false,
    enablePickup: settings?.enablePickup ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings(formData);
      toast.success('Settings updated successfully! ⚙️');
    } else {
      toast.info('Settings update simulated (Backend not connected)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Store Settings</h2>
          <p className="text-gray-600 mt-1">Manage your general store preferences</p>
        </div>
        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gray-500/30"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">General Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Store Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Financial & Orders</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                >
                  <option value="PKR">PKR (Rs)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Fee</label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Min Order Value</label>
                <input
                  type="number"
                  name="minOrder"
                  value={formData.minOrder}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Operating Hours</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Store Open/Closed</p>
                  <p className="text-xs text-gray-500">Manually open or close the store</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isStoreOpen"
                  checked={formData.isStoreOpen}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Enable Pickup</p>
                  <p className="text-xs text-gray-500">Allow customers to pickup from store</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="enablePickup"
                  checked={formData.enablePickup}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-500 shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Order Notifications</p>
                  <p className="text-xs text-gray-500">Sound alerts for new orders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="enableNotifications"
                  checked={formData.enableNotifications}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-500 shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Auto-Accept Orders</p>
                  <p className="text-xs text-gray-500">Automatically confirm incoming orders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="autoAcceptOrders"
                  checked={formData.autoAcceptOrders}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
