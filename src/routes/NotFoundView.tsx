import React from "react";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: '#FFF8F0' }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                {/* Big 404 */}
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-[120px] md:text-[160px] font-black leading-none"
                    style={{
                        background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 50%, #EF4444 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    404
                </motion.div>

                {/* Emoji */}
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-6xl mb-4"
                >
                    🍔
                </motion.div>

                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Oops! Page Not Found
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back to browsing delicious food!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                        onClick={() => navigate(-1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-gray-700 border-2 border-gray-200 hover:border-orange-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </motion.button>

                    <motion.button
                        onClick={() => navigate("/")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white"
                        style={{
                            background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                            boxShadow: '0 4px 16px rgba(255, 159, 64, 0.3)',
                        }}
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
