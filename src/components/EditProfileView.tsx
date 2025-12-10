import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

interface EditProfileViewProps {
  onBack: () => void;
}

export const EditProfileView = ({ onBack }: EditProfileViewProps) => {
  const [formData, setFormData] = useState({
    name: "Anas Ahmed",
    email: "anas.ahmed@email.com",
    phone: "+92 300 1234567",
    address: "123 Main Street, Karachi, Pakistan"
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success("Profile updated successfully! ✅");
    setTimeout(() => onBack(), 1000);
  };

  const handlePhotoUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Photo updated successfully! 📸");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm sticky top-0 z-30"
      >
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6 max-w-2xl">
        {/* Profile Photo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h2 className="font-bold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center border-4 border-orange-100 shadow-lg">
                <span className="text-3xl font-bold text-white">A</span>
              </div>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {/* Upload Button */}
            <div className="flex-1">
              <motion.button
                onClick={handlePhotoUpload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                {isUploading ? "Uploading..." : "Change Photo"}
              </motion.button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                JPG, PNG or GIF. Max size 5MB
              </p>
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
          
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="Enter your phone"
              />
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white rounded-xl outline-none transition-all font-medium resize-none"
                placeholder="Enter your address"
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </motion.button>
      </div>
    </div>
  );
};
