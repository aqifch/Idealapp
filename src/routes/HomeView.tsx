import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product, Category, Deal, Banner } from "../data/mockData";
import { SearchBar } from "../components/SearchBar";
import { HomeProductCard } from "../components/HomeProductCard";
import { NewHeroBanner } from "../components/NewHeroBanner";
import { NewCategories } from "../components/NewCategories";
import { DesktopCategoryShowcase } from "../components/DesktopCategoryShowcase";
import { DesktopDealsSection } from "../components/DesktopDealsSection";
import { DesktopFeaturedDeals } from "../components/DesktopFeaturedDeals";
import { DesktopPromoBanner } from "../components/DesktopPromoBanner";
import { FlashSaleCard } from "../components/FlashSaleCard";

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  deals: Deal[];
  banners: Banner[];
  wishlistItems: Product[];
  selectedCategory: string;
  searchQuery: string;
  storeSettings: any;
  onProductClick: (product: Product) => void;
  onSearch: (query: string) => void;
  onAddToWishlist: (product: Product) => void;
  onCategorySelect: (categoryName: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  deals,
  banners,
  wishlistItems,
  selectedCategory,
  searchQuery,
  storeSettings,
  onProductClick,
  onSearch,
  onAddToWishlist,
  onCategorySelect,
}) => {
  const navigate = useNavigate();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Filter products for search
  const filteredProducts = products.filter((product) => {
    const matchesSearch = localSearchQuery === "" || 
      product.name.toLowerCase().includes(localSearchQuery.toLowerCase());
    return matchesSearch;
  });

  // Popular products - filter by isPopular flag
  const popularProducts = products.filter(p => p.isPopular === true);

  const activeDeals = deals.filter(d => d.isActive);
  
  // Sort active deals by display order
  const sortedActiveDeals = activeDeals.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Logic to determine which deal goes where
  // 1. Flash Sale: Either explicitly set via template, or the one with highest discount
  const flashSaleDeal = sortedActiveDeals.find(d => d.template === 'flash_sale') 
    || sortedActiveDeals.reduce((prev, current) => (prev && prev.discountPercentage > current.discountPercentage) ? prev : current, undefined as Deal | undefined);

  // 2. Other deals for the list/grid section
  const otherDeals = sortedActiveDeals.filter(d => d.id !== flashSaleDeal?.id);

  const handleDealClick = (deal: Deal) => {
    if (deal.productId) {
      const product = products.find(p => p.id === deal.productId);
      if (product) {
        onProductClick(product);
      }
    }
  };

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Show search results if searching, otherwise show normal home content */}
      {localSearchQuery.trim() !== "" ? (
        // INSTANT SEARCH RESULTS
        <div className="py-6 lg:py-12">
          <div className="flex items-center justify-between mb-4 lg:mb-8">
            <div>
              <h2 className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">
                Search Results for "{localSearchQuery}"
              </h2>
              <p className="hidden lg:block text-gray-600">
                Found {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button 
              onClick={() => {
                setLocalSearchQuery("");
                onSearch("");
              }}
              className="px-4 lg:px-8 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-bold backdrop-blur-md transition-all hover:scale-105"
              style={{
                background: 'rgba(255, 159, 64, 0.1)',
                color: '#FF9F40',
                border: '1px solid rgba(255, 159, 64, 0.2)',
              }}
            >
              Clear Search
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
              {filteredProducts.map((product) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                  isPopular={false}
                  isInWishlist={wishlistItems.some(item => item.id === product.id)}
                  onAddToWishlist={onAddToWishlist}
                  {...({} as any)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-24 px-4">
              <div className="text-6xl lg:text-9xl mb-4 lg:mb-6">🔍</div>
              <p className="text-gray-500 font-bold text-lg lg:text-2xl">No products found</p>
              <p className="text-gray-400 text-sm lg:text-lg mt-2">Try searching for something else</p>
            </div>
          )}
        </div>
      ) : (
        // NORMAL HOME CONTENT
        <>
          {/* Hero Banner - Mobile Only */}
          <div className="lg:hidden">
            <NewHeroBanner banners={banners.filter(b => b.type === 'hero' && b.isActive)} />
          </div>

          {/* Desktop Hero - Full Width Professional */}
          <div className="hidden lg:block -mx-12">
            <div className="relative w-full overflow-hidden" style={{ height: `${storeSettings.bannerHeight || 500}px` }}>
              {(() => {
                const activeBanners = banners.filter(b => b.type === 'hero' && b.isActive);
                const layout = storeSettings.bannerLayout || 'single';
                const height = `${storeSettings.bannerHeight || 500}px`;
                const padding = storeSettings.bannerPadding !== undefined ? storeSettings.bannerPadding : 48;

                if (layout === 'grid-2') {
                  return (
                    <div 
                      className="grid grid-cols-2 gap-6 h-full"
                      style={{ paddingLeft: `${padding}px`, paddingRight: `${padding}px` }}
                    >
                      {[0, 1].map(i => (
                        <div key={i} className="rounded-[2rem] overflow-hidden h-full relative shadow-xl transform transition-transform hover:scale-[1.01]">
                          <NewHeroBanner 
                            banners={activeBanners.length > i ? [activeBanners[i]] : []} 
                            layout="grid-2"
                            desktopHeight={height}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                if (layout === 'grid-3') {
                  return (
                    <div 
                      className="grid grid-cols-3 gap-6 h-full"
                      style={{ paddingLeft: `${padding}px`, paddingRight: `${padding}px` }}
                    >
                      {[0, 1, 2].map(i => (
                        <div key={i} className="rounded-[2rem] overflow-hidden h-full relative shadow-xl transform transition-transform hover:scale-[1.01]">
                          <NewHeroBanner 
                            banners={activeBanners.length > i ? [activeBanners[i]] : []} 
                            layout="grid-3"
                            desktopHeight={height}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                // Single layout
                return (
                  <div style={{ paddingLeft: layout === 'single' ? 0 : `${padding}px`, paddingRight: layout === 'single' ? 0 : `${padding}px` }}>
                    <NewHeroBanner banners={activeBanners} layout="single" desktopHeight={height} />
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Categories - Mobile Only */}
          <div className="lg:hidden">
            <NewCategories 
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
              categories={categories}
            />
          </div>

          {/* Desktop Category Showcase - Professional Grid */}
          <div className="hidden lg:block">
            <DesktopCategoryShowcase
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
              categories={categories}
            />
          </div>

          {/* Deals Section */}
          <div className="hidden lg:block">
            <DesktopDealsSection deals={otherDeals} onDealClick={handleDealClick} />
          </div>

          {/* Desktop Featured Deals - Only on Desktop */}
          <div className="hidden lg:block">
            <DesktopFeaturedDeals
              products={popularProducts}
              onProductClick={onProductClick}
            />
          </div>

          {/* Desktop Promo Banner - Only on Desktop */}
          <div className="hidden lg:block">
            <DesktopPromoBanner banner={banners.find(b => b.type === 'promo' && b.isActive)} />
          </div>

          {/* Products Section */}
          <div className="py-6 lg:py-12">
            <div className="flex items-center justify-between mb-4 lg:mb-8">
              <div>
                <h2 className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">
                  Popular Items
                </h2>
                <p className="hidden lg:block text-gray-600">
                  Handpicked favorites just for you
                </p>
              </div>
              <button 
                onClick={() => navigate("/products")}
                className="px-4 lg:px-8 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-bold backdrop-blur-md transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 159, 64, 0.1)',
                  color: '#FF9F40',
                  border: '1px solid rgba(255, 159, 64, 0.2)',
                }}
              >
                See All Menu
              </button>
            </div>

            {/* Product Grid - Responsive: 2 cols mobile, 3 tablet, 5 desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
              {popularProducts.slice(0, 10).map((product, index) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                  isPopular={index < 2}
                  isInWishlist={wishlistItems.some(item => item.id === product.id)}
                  onAddToWishlist={onAddToWishlist}
                  {...({} as any)}
                />
              ))}
            </div>
          </div>

          {/* Flash Sale Card */}
          <FlashSaleCard deal={flashSaleDeal} onDealClick={handleDealClick} />
        </>
      )}
    </div>
  );
};

