import React from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { motion } from "motion/react";

export const SearchFilter = () => {
  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <Input 
        placeholder="Search" 
        className="pl-12 pr-4 bg-gray-50 border-0 h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:bg-white"
      />
    </motion.div>
  );
};
