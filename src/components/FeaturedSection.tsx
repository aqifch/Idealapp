import React from "react";
import { featuredProducts } from "../data/mockData";
import { ProductCard } from "./ProductCard";
import { Product } from "../data/mockData";

interface FeaturedSectionProps {
  onProductClick: (product: Product) => void;
}

export const FeaturedSection = ({ onProductClick }: FeaturedSectionProps) => {
  return (
    <div className="w-full">
      {/* Proper Grid with Consistent Gaps - 8px spacing system */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {featuredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
};
