import React, { useState, useEffect } from "react";
import { Product, categories } from "../data/mockData";
import { allProducts } from "../data/allProducts";
import { ProductCard } from "./ProductCard";
import { SlidersHorizontal, ChevronLeft, X, Check, Flame, Leaf, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductsViewProps {
  onProductClick: (product: Product) => void;
  selectedCategory?: string | null;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onBack?: () => void;
  products?: Product[];
  wishlistItems?: Product[];
  onAddToWishlist?: (product: Product) => void;
}

export const ProductsView = ({ onProductClick, selectedCategory, searchQuery, onSearch, onBack, products = allProducts, wishlistItems = [], onAddToWishlist }: ProductsViewProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [sortBy, setSortBy] = useState<"recommended" | "priceLow" | "priceHigh" | "rating">("recommended");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isSpicy, setIsSpicy] = useState(false);
  const [isVeg, setIsVeg] = useState(false);

  // Set category from props when navigating from home
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    } else {
      setActiveCategory("All");
    }
  }, [selectedCategory]);

  // Filter products logic
  const filteredProducts = products.filter((product) => {
    // 1. Search Filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery?.toLowerCase() || "");
    
    // 2. Category Filter
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    
    // 3. Price Filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    // 4. Attribute Filters
    const matchesSpicy = isSpicy ? product.isSpicy === true : true;
    const matchesVeg = isVeg ? product.isVeg === true : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesSpicy && matchesVeg;
  }).sort((a, b) => {
    // 5. Sorting
    switch (sortBy) {
      case "priceLow":
        return a.price - b.price;
      case "priceHigh":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default: // recommended (default order or popularity)
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    }
  });

  // Get category display name
  const getCategoryTitle = () => {
    if (activeCategory === "All") return "All Products";
    return `${activeCategory}`;
  };

  const activeFiltersCount = (isSpicy ? 1 : 0) + (isVeg ? 1 : 0) + (sortBy !== "recommended" ? 1 : 0);

  return (
    <div className="w-full pb-4 lg:pb-12 relative">
      {/* Header with Back Button */}
      <div className="mb-6 lg:mb-10">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-xl transition-all -ml-2"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">{getCategoryTitle()}</h1>
        </div>
        <p className="text-gray-500 lg:text-lg">Explore our delicious menu</p>
      </div>

      {/* Controls Row - Search & Filter */}
      <div className="flex gap-3 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery || ""}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl outline-none focus:ring-2 focus:ring-orange-400/50 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#374151',
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearch && onSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200/50 hover:bg-gray-300/50 transition-all"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button 
          onClick={() => setShowFilters(true)}
          className="px-4 py-3 rounded-xl backdrop-blur-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
          <span className="hidden md:inline font-bold text-gray-700">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 lg:gap-3 mb-6 lg:mb-8 pb-2 lg:justify-center">
        <button
          onClick={() => setActiveCategory("All")}
          className="px-5 lg:px-8 py-2.5 lg:py-3 rounded-xl font-bold text-sm lg:text-base whitespace-nowrap transition-all backdrop-blur-xl hover:scale-105"
          style={{
            background: activeCategory === "All"
              ? 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)'
              : 'rgba(255, 255, 255, 0.75)',
            color: activeCategory === "All" ? '#FFFFFF' : '#374151',
            boxShadow: activeCategory === "All"
              ? '0 4px 16px rgba(255, 159, 64, 0.3)'
              : '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: activeCategory === "All"
              ? '1px solid rgba(255, 159, 64, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          All Items
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className="px-5 lg:px-8 py-2.5 lg:py-3 rounded-xl font-bold text-sm lg:text-base whitespace-nowrap transition-all backdrop-blur-xl hover:scale-105"
            style={{
              background: activeCategory === category.name
                ? 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)'
                : 'rgba(255, 255, 255, 0.75)',
              color: activeCategory === category.name ? '#FFFFFF' : '#374151',
              boxShadow: activeCategory === category.name
                ? '0 4px 16px rgba(255, 159, 64, 0.3)'
                : '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: activeCategory === category.name
                ? '1px solid rgba(255, 159, 64, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onClick={() => onProductClick(product)}
            isInWishlist={wishlistItems.some(item => item.id === product.id)}
            onAddToWishlist={onAddToWishlist}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 lg:py-24">
          <div className="text-6xl lg:text-8xl mb-4 lg:mb-6">🍽️</div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 lg:text-lg">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              setIsSpicy(false);
              setIsVeg(false);
              setPriceRange([0, 5000]);
              setActiveCategory("All");
            }}
            className="mt-6 px-6 py-3 rounded-xl bg-orange-100 text-orange-600 font-bold hover:bg-orange-200 transition-all"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Filter Drawer/Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Filters</h2>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-8 flex-1">
                  {/* Sort By */}
                  <section>
                    <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
                    <div className="space-y-2">
                      {[
                        { id: "recommended", label: "Recommended" },
                        { id: "priceLow", label: "Price: Low to High" },
                        { id: "priceHigh", label: "Price: High to Low" },
                        { id: "rating", label: "Top Rated" },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id as any)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                            sortBy === option.id 
                              ? "bg-orange-50 text-orange-600 font-bold" 
                              : "hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          {option.label}
                          {sortBy === option.id && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Dietary */}
                  <section>
                    <h3 className="font-bold text-gray-900 mb-4">Dietary Preference</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setIsSpicy(!isSpicy)}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          isSpicy
                            ? "border-red-500 bg-red-50 text-red-600"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        <Flame className={`w-8 h-8 ${isSpicy ? "fill-red-500" : ""}`} />
                        <span className="font-bold">Spicy Only</span>
                      </button>
                      <button
                        onClick={() => setIsVeg(!isVeg)}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          isVeg
                            ? "border-green-500 bg-green-50 text-green-600"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        <Leaf className={`w-8 h-8 ${isVeg ? "fill-green-500" : ""}`} />
                        <span className="font-bold">Vegetarian</span>
                      </button>
                    </div>
                  </section>

                  {/* Price Range (Mock Slider Visual) */}
                  <section>
                    <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                    <div className="px-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="flex justify-between mt-2 font-bold text-gray-600 text-sm">
                        <span>Rs 0</span>
                        <span>Rs {priceRange[1]}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    onClick={() => {
                      setSortBy("recommended");
                      setIsSpicy(false);
                      setIsVeg(false);
                      setPriceRange([0, 5000]);
                    }}
                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};