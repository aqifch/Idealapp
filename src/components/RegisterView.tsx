import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight, Loader, Eye, EyeOff, Sparkles, Phone } from "lucide-react";
import { supabase } from "../config/supabase";
import { getProjectId, getPublicAnonKey, getFunctionUrl } from "../config/supabase";

interface RegisterViewProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
  onBack: () => void;
  storeSettings?: any;
}

export const RegisterView = ({ onNavigateToLogin, onRegisterSuccess, onBack, storeSettings }: RegisterViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    setIsLoading(true);

    try {
      // Call server endpoint to create user with auto-confirmed email
      const response = await fetch(getFunctionUrl('make-server-b09ae082/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getPublicAnonKey()}`
        },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      // Automatically sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (signInError) throw signInError;
      
      onRegisterSuccess();

    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Right Side - Visual (Desktop Only - Swapped for Register) */}
        <div className="hidden lg:block order-last lg:order-first relative h-full min-h-[600px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <div className="relative w-[500px] h-[500px]">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-[100px] opacity-30" 
                />

                <img 
                  src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800" 
                  alt="Delicious Pizza" 
                  className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-orange-900/20 -rotate-3 border-8 border-white/30 backdrop-blur-sm"
                />
                
                <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-5 -right-5 bg-white p-5 rounded-2xl shadow-xl max-w-[220px]"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-black text-gray-900">Join Now!</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Get exclusive deals and track your orders in real-time.</p>
                </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Left Side - Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 md:p-10 rounded-3xl shadow-2xl shadow-red-500/10">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Create Account 🚀</h1>
              <p className="text-gray-500">Join {storeSettings?.storeName || "Ideal Point"} for exclusive perks.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input 
                        type={showPassword ? "text" : "password"} 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                        required
                        />
                    </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                 <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPassword ? "Hide Passwords" : "Show Passwords"}
                  </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-medium">
                Already have an account?{" "}
                <button 
                  onClick={onNavigateToLogin}
                  className="text-orange-600 font-bold hover:underline decoration-2 underline-offset-4"
                >
                  Log In
                </button>
              </p>
               <button onClick={onBack} className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium">
                Continue as Guest
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
