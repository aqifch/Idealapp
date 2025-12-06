import React, { useState } from "react";
import { Search, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div
        className="relative flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl"
        style={{
          background: isFocused ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
          boxShadow: isFocused 
            ? '0 8px 32px rgba(255, 159, 64, 0.2)' 
            : '0 4px 16px rgba(0, 0, 0, 0.08)',
          border: isFocused 
            ? '2px solid rgba(255, 159, 64, 0.3)' 
            : '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Search Icon */}
        <Search className={`w-5 h-5 lg:w-6 lg:h-6 transition-colors ${isFocused ? 'text-orange-600' : 'text-gray-400'}`} />

        {/* Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What are you craving today?"
          className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm lg:text-base"
        />

        {/* Voice Search Icon */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg backdrop-blur-md flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255, 159, 64, 0.1)',
            border: '1px solid rgba(255, 159, 64, 0.2)',
          }}
        >
          <Mic className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
        </motion.button>
      </div>
    </motion.div>
  );
};
