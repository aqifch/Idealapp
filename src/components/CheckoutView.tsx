import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, MapPin, Wallet, CheckCircle, Package, Clock, Info, User, Plus, Home, Briefcase, Star, ArrowRight, Store, Bike } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner@2.0.3";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { GoogleMapsAddressInput } from "./GoogleMapsAddressInput";
import { MiniMapPreview } from "./MiniMapPreview";
import { GoogleMapsSetupBanner } from "./GoogleMapsSetupBanner";

interface CheckoutViewProps {
  onBack: () => void;
  onSuccess?: () => void;
  deliveryFee?: number;
  onAddOrder?: (order: any) => void;
  user?: SupabaseUser | null;
  storeSettings?: any;
}

interface Address {
  id: string;
  type: "home" | "work" | "other";
  label: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export const CheckoutView = ({ onBack, onSuccess, deliveryFee: propDeliveryFee = 0, onAddOrder, user, storeSettings }: CheckoutViewProps) => {
  const { cartItems, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState("cash");
  
  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [hoveredAddressId, setHoveredAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | undefined>();
  const [selectedLng, setSelectedLng] = useState<number | undefined>();
  
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");

  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved addresses and user data on mount
  useEffect(() => {
    // Load user name from profile
    if (user?.user_metadata?.name) {
      setName(user.user_metadata.name);
    } else {
      // Fallback to saved name in localStorage
      const savedDetails = localStorage.getItem("idealpoint_delivery_details");
      if (savedDetails) {
        try {
          const { name } = JSON.parse(savedDetails);
          if (name) setName(name);
        } catch (e) {
          console.error("Failed to load saved delivery details", e);
        }
      }
    }
    
    // Load saved addresses from localStorage
    const savedAddressesData = localStorage.getItem("idealpoint_saved_addresses");
    if (savedAddressesData) {
      try {
        const addresses: Address[] = JSON.parse(savedAddressesData);
        setSavedAddresses(addresses);
        
        // Find and select default address
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setDeliveryAddress(defaultAddress.address);
          setPhoneNumber(defaultAddress.phone);
        }
      } catch (e) {
        console.error("Failed to load saved addresses", e);
      }
    }
  }, [user]);

  // Handle address selection
  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setDeliveryAddress(address.address);
    setPhoneNumber(address.phone);
    setShowAddressForm(false);
  };

  // Handle custom address
  const handleAddCustomAddress = () => {
    setSelectedAddressId(null);
    setDeliveryAddress("");
    setPhoneNumber("");
    setShowAddressForm(true);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Use delivery fee from settings if available, else prop
  const baseDeliveryFee = storeSettings?.deliveryFee !== undefined ? Number(storeSettings.deliveryFee) : propDeliveryFee;
  const deliveryFee = orderType === "pickup" ? 0 : baseDeliveryFee;
  
  const minOrder = storeSettings?.minOrder !== undefined ? Number(storeSettings.minOrder) : 0;
  const isStoreOpen = storeSettings?.isStoreOpen !== false;
  
  const total = subtotal + deliveryFee;

  // Check if order meets minimum value
  const isBelowMinOrder = subtotal < minOrder;

  const paymentMethods = [
    { 
      id: "cash", 
      name: "Cash on Delivery", 
      icon: Wallet, 
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      description: "Pay when you receive"
    }
  ];

  const handlePlaceOrder = () => {
    if (!isStoreOpen) {
      toast.error("Sorry, the store is currently closed 🚫");
      return;
    }
    
    if (isBelowMinOrder) {
      toast.error(`Minimum order amount is Rs ${minOrder} 📉`);
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name 👤");
      return;
    }
    
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      toast.error("Please enter delivery address 📍");
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast.error("Please enter phone number 📱");
      return;
    }

    // Create Order Object
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `#${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "pending",
      items: cartItems,
      subtotal,
      deliveryFee,
      tax: 0,
      total,
      deliveryAddress: orderType === "pickup" ? "Store Pickup" : deliveryAddress,
      orderType,
      customerName: name,
      customerPhone: phoneNumber,
      instructions
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    }

    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      toast.success("Order placed successfully! 🎉");
      if (onSuccess) onSuccess();
    }, 2000);
  };

  const PlaceOrderButton = ({ isMobile = false }) => {
    const isDisabled = isProcessing || !isStoreOpen || isBelowMinOrder;
    
    return (
      <motion.button
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        onClick={handlePlaceOrder}
        disabled={isDisabled}
        className="w-full py-4 rounded-2xl font-black shadow-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
        style={{
          background: isDisabled
            ? 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)'
            : 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
          color: 'white',
          boxShadow: isDisabled 
            ? 'none' 
            : '0 4px 20px rgba(255, 159, 64, 0.4)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Processing...
          </>
        ) : !isStoreOpen ? (
          <>
            <Clock className="w-5 h-5" />
            Store Closed
          </>
        ) : isBelowMinOrder ? (
          <>
            <Info className="w-5 h-5" />
            Min Order Rs {minOrder}
          </>
        ) : (
          <>
            <span>Place Order</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">Rs {Math.round(total)}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    );
  };

  return (
    <div 
      className="min-h-screen pb-32 lg:pb-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
      }}
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute"
          style={{
            top: '10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 159, 64, 0.2) 0%, rgba(255, 159, 64, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '30%',
            left: '-10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header - Glass Morphism */}
        <div className="py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl transition-colors hover:bg-white/60"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                }}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>

              <div>
                <h1 className="text-xl lg:text-2xl font-black text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-600 hidden lg:block">Complete your order details</p>
              </div>
            </div>

            {/* Steps Indicator (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                <span className="font-bold text-gray-900">Details</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">2</div>
                <span className="font-bold text-gray-600">Confirm</span>
              </div>
            </div>

            {/* Package Icon */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
              }}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Type Toggle */}
            {storeSettings?.enablePickup !== false && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOrderType("delivery")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    orderType === "delivery"
                      ? "border-orange-500 bg-orange-50 text-orange-600 shadow-lg"
                      : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    orderType === "delivery" ? "bg-orange-100" : "bg-gray-100"
                  }`}>
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Delivery</span>
                </button>

                <button
                  onClick={() => setOrderType("pickup")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    orderType === "pickup"
                      ? "border-orange-500 bg-orange-50 text-orange-600 shadow-lg"
                      : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    orderType === "pickup" ? "bg-orange-100" : "bg-gray-100"
                  }`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Self Pickup</span>
                </button>
              </div>
            )}

            {/* Delivery/Pickup Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  }}
                >
                  {orderType === "delivery" ? (
                    <MapPin className="w-4 h-4 text-white" />
                  ) : (
                    <Store className="w-4 h-4 text-white" />
                  )}
                </div>
                <h2 className="text-lg lg:text-xl font-black text-gray-900">
                  {orderType === "delivery" ? "Delivery Details" : "Pickup Details"}
                </h2>
              </div>
              
              <div 
                className="rounded-3xl p-5 lg:p-8 backdrop-blur-xl space-y-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Google Maps Setup Banner */}
                {showAddressForm && <GoogleMapsSetupBanner />}
                
                {/* Name Field */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-1">
                    Full Name
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all text-sm font-medium focus:ring-2 focus:ring-orange-300 hover:bg-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                      }}
                    />
                  </div>
                </div>

                {/* Delivery Address or Pickup Info */}
                {orderType === "delivery" ? (
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    
                    {savedAddresses.length > 0 && !showAddressForm ? (
                      <>
                        {/* Saved Addresses Grid for Desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          {savedAddresses.map((address) => {
                            const Icon = address.type === "home" ? Home : address.type === "work" ? Briefcase : MapPin;
                            const isSelected = selectedAddressId === address.id;
                            const isHovered = hoveredAddressId === address.id;
                            
                            return (
                              <motion.div
                                key={address.id}
                                onClick={() => handleSelectAddress(address)}
                                onHoverStart={() => setHoveredAddressId(address.id)}
                                onHoverEnd={() => setHoveredAddressId(null)}
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: 1.02 }}
                                className={`relative rounded-2xl cursor-pointer overflow-hidden transition-all ${
                                  isSelected ? 'ring-2 ring-orange-500 shadow-lg bg-white' : 'shadow-sm bg-white/60 hover:bg-white/80'
                                }`}
                                style={{
                                  border: isSelected ? '2px solid transparent' : '1px solid rgba(0, 0, 0, 0.05)',
                                }}
                              >
                                {/* Selected Indicator */}
                                {isSelected && (
                                  <div className="absolute top-0 left-0 right-0 h-1" style={{
                                    background: 'linear-gradient(90deg, #FF9F40 0%, #FFB74D 100%)',
                                  }} />
                                )}

                                <div className="p-4 flex flex-col gap-3 h-full">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                                        style={{
                                          background: address.type === "home" 
                                            ? 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)'
                                            : address.type === "work"
                                            ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                                            : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                        }}
                                      >
                                        <Icon className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{address.label}</h3>
                                        {address.isDefault && (
                                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md">DEFAULT</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {isSelected && (
                                      <CheckCircle className="w-6 h-6 text-orange-500 fill-orange-100" />
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                      {address.address}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">
                                      {address.phone}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                          
                          {/* Add Custom Address Button Card */}
                          <button
                            onClick={handleAddCustomAddress}
                            className="rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 flex flex-col items-center justify-center gap-2 min-h-[140px] hover:bg-orange-50 transition-colors text-orange-600 font-bold text-sm group"
                          >
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus className="w-5 h-5" />
                            </div>
                            Use New Address
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Custom Address Form */}
                        <div className="space-y-4 bg-white/50 p-4 rounded-2xl border border-white/60">
                          {/* Google Maps Address Input */}
                          <GoogleMapsAddressInput
                            value={deliveryAddress}
                            onChange={(address, lat, lng) => {
                              setDeliveryAddress(address);
                              setSelectedLat(lat);
                              setSelectedLng(lng);
                            }}
                            placeholder="Enter delivery address or use current location"
                          />

                          {/* Map Preview */}
                          {deliveryAddress && (
                            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                              <MiniMapPreview 
                                address={deliveryAddress}
                                lat={selectedLat}
                                lng={selectedLng}
                              />
                            </div>
                          )}
                          
                          <div>
                            <input
                              type="tel"
                              placeholder="Phone Number (03XX-XXXXXXX)"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full px-4 py-4 rounded-xl outline-none transition-all text-sm font-medium focus:ring-2 focus:ring-orange-300 bg-white"
                              style={{
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                              }}
                            />
                          </div>

                          {savedAddresses.length > 0 && (
                            <button
                              onClick={() => {
                                setShowAddressForm(false);
                                setDeliveryAddress("");
                                setSelectedLat(undefined);
                                setSelectedLng(undefined);
                                // Re-select default address
                                const defaultAddr = savedAddresses.find(a => a.isDefault);
                                if (defaultAddr) handleSelectAddress(defaultAddr);
                              }}
                              className="text-sm font-bold hover:underline flex items-center gap-1 text-orange-600"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Back to Saved Addresses
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone Number (03XX-XXXXXXX)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl outline-none transition-all text-sm font-medium focus:ring-2 focus:ring-orange-300 bg-white"
                        style={{
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Instructions */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-1">
                    Delivery Instructions
                    <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g., Ring the doorbell, leave at gate..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all text-sm resize-none font-medium focus:ring-2 focus:ring-orange-300 hover:bg-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                  />
                </div>
              </div>

              {/* Estimated Time */}
              <div 
                className="mt-4 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                   <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery Time</p>
                  <p className="text-lg font-black text-green-700">25-35 minutes</p>
                </div>
              </div>
            </motion.div>

            {/* Payment Method Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  }}
                >
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg lg:text-xl font-black text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  
                  return (
                    <motion.button
                      key={method.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                      onClick={() => setSelectedPayment(method.id)}
                      whileTap={{ scale: 0.99 }}
                      whileHover={{ scale: 1.01 }}
                      className="w-full rounded-2xl p-5 backdrop-blur-xl flex items-center gap-5 transition-all"
                      style={{
                        background: isSelected 
                          ? 'rgba(255, 255, 255, 0.9)' 
                          : 'rgba(255, 255, 255, 0.5)',
                        border: isSelected 
                          ? '2px solid #FF9F40' 
                          : '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: isSelected 
                          ? '0 8px 30px rgba(255, 159, 64, 0.15)' 
                          : '0 4px 20px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{
                          background: method.gradient,
                        }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <p className="font-black text-gray-900 text-lg">{method.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <CheckCircle className="w-8 h-8 text-orange-500 fill-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Summary Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                    }}
                  >
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg lg:text-xl font-black text-gray-900">Order Summary</h2>
                </div>
                
                <div 
                  className="rounded-3xl p-6 backdrop-blur-xl bg-white/60 border border-white/60 shadow-xl shadow-orange-500/5"
                >
                  {/* Cart Items Scrollable Area */}
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item, index) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                             {/* Using img tag directly or ImageWithFallback if imported, sticking to ImageWithFallback assuming it's used elsewhere */}
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity} × Rs {item.price}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          Rs {item.price * item.quantity}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-bold text-gray-900">Rs {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Delivery Fee</span>
                      <span className="font-bold text-gray-900">
                        {orderType === 'pickup' ? 'Free' : `Rs ${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="font-black text-gray-900 text-lg">Total</span>
                      <span className="font-black text-orange-600 text-xl">
                        Rs {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Place Order Button */}
                  <div className="hidden lg:block mt-6">
                    <PlaceOrderButton />
                  </div>
                </div>

                {/* Info Box */}
                <div 
                  className="mt-4 rounded-2xl p-4 backdrop-blur-xl flex items-start gap-3"
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                  }}
                >
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-blue-700">Free delivery</span> on orders above Rs 500.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Place Order Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 px-6 py-4 backdrop-blur-xl z-50 lg:hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(255, 159, 64, 0.2)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <PlaceOrderButton isMobile />
        </div>
      </div>
    </div>
  );
};