import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, MapPin, Home, Briefcase, Plus, Edit2, Trash2, Check, Phone, Star } from "lucide-react";
import { toast } from "sonner";

interface SavedAddressesViewProps {
  onBack: () => void;
}

interface Address {
  id: string;
  type: "home" | "work" | "other";
  label: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: "1",
    type: "home",
    label: "Home",
    address: "123 Main Street, Block A, Gulshan-e-Iqbal, Karachi, Pakistan",
    phone: "+92 300 1234567",
    isDefault: true
  },
  {
    id: "2",
    type: "work",
    label: "Office",
    address: "456 Business Plaza, 2nd Floor, Clifton Block 8, Karachi, Pakistan",
    phone: "+92 321 7654321",
    isDefault: false
  },
  {
    id: "3",
    type: "other",
    label: "Sister's Home",
    address: "789 Residential Area, DHA Phase 5, Karachi, Pakistan",
    phone: "+92 333 9876543",
    isDefault: false
  }
];

export const SavedAddressesView = ({ onBack }: SavedAddressesViewProps) => {
  // Load addresses from localStorage or use mock data
  const loadAddresses = (): Address[] => {
    const saved = localStorage.getItem("idealpoint_saved_addresses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved addresses", e);
      }
    }
    return mockAddresses;
  };

  const [addresses, setAddresses] = useState<Address[]>(loadAddresses());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Save to localStorage whenever addresses change
  React.useEffect(() => {
    localStorage.setItem("idealpoint_saved_addresses", JSON.stringify(addresses));
  }, [addresses]);

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
    toast.success("Default address updated! ✅");
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    setShowDeleteConfirm(null);
    toast.success("Address deleted successfully! 🗑️");
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleSaveAddress = (addressData: Partial<Address>) => {
    if (editingAddress) {
      // Edit existing
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
        )
      );
      toast.success("Address updated successfully! ✅");
    } else {
      // Add new
      const newAddress: Address = {
        id: Date.now().toString(),
        type: addressData.type || "other",
        label: addressData.label || "New Address",
        address: addressData.address || "",
        phone: addressData.phone || "",
        isDefault: false
      };
      setAddresses(prev => [...prev, newAddress]);
      toast.success("New address added! ✅");
    }
    setShowAddModal(false);
    setEditingAddress(null);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "work":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getAddressGradient = (type: string) => {
    switch (type) {
      case "home":
        return "linear-gradient(135deg, #10B981 0%, #059669 100%)";
      case "work":
        return "linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)";
      default:
        return "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
    }
  };

  return (
    <div 
      className="min-h-screen pb-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
      }}
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute"
          style={{
            top: '8%',
            right: '-8%',
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(255, 159, 64, 0.2) 0%, rgba(255, 159, 64, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '25%',
            left: '-10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl lg:mx-auto">
        {/* Header - Glass Morphism */}
        <div className="px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              {/* Back Button */}
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                }}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>

              {/* Title */}
              <div className="flex-1 text-center">
                <h1 className="font-black text-gray-900">My Addresses</h1>
                <p className="text-sm text-gray-600">{addresses.length} saved locations</p>
              </div>

              {/* MapPin Icon */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Add New Button */}
            <motion.button
              onClick={handleAddNew}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255, 159, 64, 0.3)',
              }}
            >
              <Plus className="w-5 h-5" />
              Add New Address
            </motion.button>
          </motion.div>
        </div>

        {/* Addresses List */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full rounded-3xl p-8 backdrop-blur-xl text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                marginTop: '60px',
              }}
            >
              <div className="text-6xl mb-4">📍</div>
              <h3 className="font-black text-gray-900 mb-2">No Saved Addresses</h3>
              <p className="text-gray-600 mb-6">Add your delivery addresses to make ordering faster and easier</p>
              <motion.button
                onClick={handleAddNew}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(255, 159, 64, 0.3)',
                }}
              >
                <Plus className="w-5 h-5" />
                Add Your First Address
              </motion.button>
            </motion.div>
          ) : (
            addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl backdrop-blur-xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Top Section - Address Info */}
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: getAddressGradient(address.type),
                      }}
                    >
                      {getAddressIcon(address.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-black text-gray-900">{address.label}</h3>
                        {address.isDefault && (
                          <span 
                            className="px-3 py-1 text-xs font-black rounded-full"
                            style={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                            }}
                          >
                            <Star className="w-3 h-3 inline-block mr-1 fill-white" />
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed text-sm">{address.address}</p>
                      <div 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg inline-flex"
                        style={{
                          background: 'rgba(255, 159, 64, 0.1)',
                        }}
                      >
                        <Phone className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-bold text-gray-900">{address.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Actions */}
                <div 
                  className="px-5 py-4 flex items-center gap-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderTop: '1px solid rgba(255, 159, 64, 0.1)',
                  }}
                >
                  {!address.isDefault && (
                    <motion.button
                      onClick={() => handleSetDefault(address.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 backdrop-blur-xl"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#059669',
                      }}
                    >
                      <Check className="w-4 h-4" />
                      Set Default
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => handleEdit(address)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 backdrop-blur-xl"
                    style={{
                      background: 'rgba(255, 159, 64, 0.15)',
                      border: '1px solid rgba(255, 159, 64, 0.3)',
                      color: '#F97316',
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(address.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-xl font-bold flex items-center justify-center backdrop-blur-xl"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#DC2626',
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="fixed inset-0 z-50"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-96 rounded-3xl p-6 z-50 backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="text-center mb-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                  }}
                >
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="font-black text-gray-900 mb-2">Delete Address?</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone. Are you sure?</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 rounded-2xl font-bold backdrop-blur-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    color: '#374151',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-4 rounded-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddEditAddressModal
            address={editingAddress}
            onClose={() => {
              setShowAddModal(false);
              setEditingAddress(null);
            }}
            onSave={handleSaveAddress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Add/Edit Address Modal Component
interface AddEditAddressModalProps {
  address: Address | null;
  onClose: () => void;
  onSave: (address: Partial<Address>) => void;
}

const AddEditAddressModal = ({ address, onClose, onSave }: AddEditAddressModalProps) => {
  const [formData, setFormData] = useState({
    type: address?.type || "home",
    label: address?.label || "",
    address: address?.address || "",
    phone: address?.phone || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.address || !formData.phone) {
      toast.error("Please fill all fields! 📝");
      return;
    }
    onSave(formData);
  };

  const addressTypes = [
    { 
      value: "home", 
      label: "Home", 
      icon: Home,
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
    },
    { 
      value: "work", 
      label: "Work", 
      icon: Briefcase,
      gradient: "linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)"
    },
    { 
      value: "other", 
      label: "Other", 
      icon: MapPin,
      gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
    }
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] rounded-3xl p-6 z-50 max-h-[90vh] overflow-y-auto backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="mb-6">
          <h2 className="font-black text-gray-900">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {addressTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                
                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="py-3 px-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
                    style={{
                      background: isSelected 
                        ? type.gradient
                        : 'rgba(255, 255, 255, 0.7)',
                      color: isSelected ? 'white' : '#374151',
                      border: isSelected 
                        ? 'none' 
                        : '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: isSelected 
                        ? '0 4px 12px rgba(255, 159, 64, 0.3)' 
                        : 'none',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium"
              placeholder="e.g., Home, Office, Sister's Place"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 159, 64, 0.2)',
              }}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium resize-none"
              placeholder="House #, Street, Area, City"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 159, 64, 0.2)',
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all font-medium"
              placeholder="+92 300 0000000"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 159, 64, 0.2)',
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl font-bold"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: '#374151',
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(255, 159, 64, 0.3)',
              }}
            >
              Save Address
            </motion.button>
          </div>
        </form>
      </motion.div>
    </>
  );
};
