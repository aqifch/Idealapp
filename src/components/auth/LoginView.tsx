import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../config/supabase";

interface LoginViewProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginView = ({ onNavigateToRegister, onLoginSuccess, onBack }: LoginViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Form */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 md:p-10 rounded-3xl shadow-2xl shadow-orange-500/10">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Welcome Back! 👋</h1>
              <p className="text-gray-500">Missed you! Sign in to order your favorites.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-gray-700">Password</label>
                  <button type="button" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-medium">
                Don't have an account?{" "}
                <button 
                  onClick={onNavigateToRegister}
                  className="text-orange-600 font-bold hover:underline decoration-2 underline-offset-4"
                >
                  Create Account
                </button>
              </p>
              <button onClick={onBack} className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium">
                Continue as Guest
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Visual (Desktop Only) */}
        <div className="hidden lg:block relative h-full min-h-[600px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <div className="relative w-[500px] h-[500px]">
                {/* Floating Background Elements */}
                <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20" 
                />
                <motion.div 
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-40 h-40 bg-red-500 rounded-full blur-3xl opacity-20" 
                />

                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" 
                  alt="Delicious Burger" 
                  className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-orange-900/20 rotate-3 border-8 border-white/30 backdrop-blur-sm"
                />
                
                {/* Floating Card */}
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-[200px]"
                >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                        🌮
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold">Daily Special</p>
                        <p className="text-sm font-black text-gray-900">50% OFF</p>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
