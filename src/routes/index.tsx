import React from "react";
import { Routes, Route } from "react-router-dom";
import { Product, Category, Deal, Banner } from "../data/mockData";
import { User } from "@supabase/supabase-js";

// Components
import { CartView } from "../components/CartView";
import { CheckoutView } from "../components/CheckoutView";
import { OrderSuccessView } from "../components/OrderSuccessView";
import { AccountView } from "../components/AccountView";
import { OrdersView } from "../components/OrdersView";
import { ProductsView } from "../components/ProductsView";
import { EditProfileView } from "../components/EditProfileView";
import { SavedAddressesView } from "../components/SavedAddressesView";
import { WishlistView } from "../components/WishlistView";
import { LoginView } from "../components/LoginView";
import { RegisterView } from "../components/RegisterView";
import { AdminPanel } from "../components/AdminPanel";
import { HomeView } from "./HomeView";

interface AppRoutesProps {
  // Navigation
  navigate: (path: string) => void;
  handleViewChange: (view: string) => void;
  
  // Data
  products: Product[];
  categories: Category[];
  deals: Deal[];
  banners: Banner[];
  orders: any[];
  wishlistItems: Product[];
  cartItems: any[];
  
  // State
  selectedCategory: string;
  searchQuery: string;
  storeSettings: any;
  user: User | null;
  
  // Handlers
  handleProductClick: (product: Product) => void;
  handleSearch: (query: string) => void;
  handleAddToWishlist: (product: Product) => void;
  handleRemoveFromWishlist: (productId: string) => void;
  handleAddOrder: (order: any) => void;
  handleUpdateOrder: (orderId: string, orderData: any) => void;
  onCategorySelect: (categoryName: string) => void;
  
  // Admin handlers
  handleAddProduct: (productData: Omit<Product, 'id'>) => void;
  handleUpdateProduct: (productId: string, productData: Partial<Product>) => void;
  handleDeleteProduct: (productId: string) => void;
  handleResetProducts: () => void;
  handleAddCategory: (categoryData: Omit<Category, 'id'>) => void;
  handleUpdateCategory: (categoryId: string, categoryData: Partial<Category>) => void;
  handleDeleteCategory: (categoryId: string) => void;
  handleReorderCategory: (categoryId: string, direction: 'up' | 'down') => void;
  handleResetCategories: () => void;
  handleAddDeal: (dealData: Omit<Deal, 'id'>) => void;
  handleUpdateDeal: (dealId: string, dealData: Partial<Deal>) => void;
  handleDeleteDeal: (dealId: string) => void;
  handleAddBanner: (bannerData: Omit<Banner, 'id'>) => void;
  handleUpdateBanner: (bannerId: string, bannerData: Partial<Banner>) => void;
  handleDeleteBanner: (bannerId: string) => void;
  handleUpdateSettings: (settings: any) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  navigate,
  handleViewChange,
  products,
  categories,
  deals,
  banners,
  orders,
  wishlistItems,
  cartItems,
  selectedCategory,
  searchQuery,
  storeSettings,
  user,
  handleProductClick,
  handleSearch,
  handleAddToWishlist,
  handleRemoveFromWishlist,
  handleAddOrder,
  handleUpdateOrder,
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleResetProducts,
  handleAddCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleReorderCategory,
  handleResetCategories,
  handleAddDeal,
  handleUpdateDeal,
  handleDeleteDeal,
  handleAddBanner,
  handleUpdateBanner,
  handleDeleteBanner,
  handleUpdateSettings,
  onCategorySelect,
}) => {
  return (
    <Routes>
      {/* HOME VIEW */}
      <Route 
        path="/" 
        element={
          <HomeView
            products={products}
            categories={categories}
            deals={deals}
            banners={banners}
            wishlistItems={wishlistItems}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            storeSettings={storeSettings}
            onProductClick={handleProductClick}
            onSearch={handleSearch}
            onAddToWishlist={handleAddToWishlist}
            onCategorySelect={(categoryName: string) => {
              onCategorySelect(categoryName);
              navigate("/products");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        } 
      />
      
      {/* PRODUCTS VIEW */}
      <Route 
        path="/products" 
        element={
          <ProductsView
            onProductClick={handleProductClick}
            selectedCategory={selectedCategory === "all" ? null : selectedCategory}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onBack={() => navigate("/")}
            products={products}
            wishlistItems={wishlistItems}
            onAddToWishlist={handleAddToWishlist}
          />
        } 
      />

      {/* CART VIEW */}
      <Route 
        path="/cart" 
        element={
          <CartView
            onContinueShopping={() => navigate("/")}
            onCheckout={() => navigate("/checkout")}
            deals={deals}
            deliveryFee={storeSettings.deliveryFee}
          />
        } 
      />

      {/* CHECKOUT VIEW */}
      <Route 
        path="/checkout" 
        element={
          <CheckoutView
            onBack={() => navigate("/cart")}
            onSuccess={() => navigate("/order-success")}
            deliveryFee={storeSettings.deliveryFee}
            onAddOrder={handleAddOrder}
            user={user}
            storeSettings={storeSettings}
          />
        } 
      />

      {/* ORDER SUCCESS VIEW */}
      <Route 
        path="/order-success" 
        element={
          <OrderSuccessView 
            onContinueShopping={() => navigate("/")} 
            latestOrder={orders[0]}
            onTrackOrder={() => navigate("/orders")}
          />
        } 
      />

      {/* ACCOUNT VIEW */}
      <Route 
        path="/account" 
        element={
          <AccountView
            onNavigateToEditProfile={() => navigate("/edit-profile")}
            onNavigateToAddresses={() => navigate("/saved-addresses")}
            onNavigateToOrders={() => navigate("/orders")}
            onNavigateToWishlist={() => navigate("/wishlist")}
            onLogout={() => handleViewChange("logout")}
            onNavigateToLogin={() => navigate("/login")}
            user={user}
            storeSettings={storeSettings}
          />
        } 
      />

      {/* ORDERS VIEW */}
      <Route 
        path="/orders" 
        element={
          <OrdersView 
            onBack={() => navigate("/account")} 
            orders={orders}
            storeSettings={storeSettings}
          />
        } 
      />

      {/* WISHLIST VIEW */}
      <Route 
        path="/wishlist" 
        element={
          <WishlistView 
            onBack={() => navigate("/")} 
            onProductClick={handleProductClick}
            wishlistItems={wishlistItems}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        } 
      />

      {/* EDIT PROFILE VIEW */}
      <Route 
        path="/edit-profile" 
        element={
          <EditProfileView onBack={() => navigate("/account")} />
        } 
      />

      {/* SAVED ADDRESSES VIEW */}
      <Route 
        path="/saved-addresses" 
        element={
          <SavedAddressesView onBack={() => navigate("/account")} />
        } 
      />

      {/* LOGIN VIEW */}
      <Route 
        path="/login" 
        element={
          <LoginView 
            onNavigateToRegister={() => navigate("/register")}
            onLoginSuccess={() => navigate("/")}
            onBack={() => navigate("/")}
          />
        } 
      />

      {/* REGISTER VIEW */}
      <Route 
        path="/register" 
        element={
          <RegisterView 
            onNavigateToLogin={() => navigate("/login")}
            onRegisterSuccess={() => navigate("/")}
            onBack={() => navigate("/")}
            storeSettings={storeSettings}
          />
        } 
      />

      {/* ADMIN VIEW */}
      <Route 
        path="/admin" 
        element={
          <AdminPanel
            onClose={() => navigate("/")}
            products={products}
            cartItems={cartItems}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetProducts={handleResetProducts}
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onReorderCategory={handleReorderCategory}
            onResetCategories={handleResetCategories}
            deals={deals}
            onAddDeal={handleAddDeal}
            onUpdateDeal={handleUpdateDeal}
            onDeleteDeal={handleDeleteDeal}
            banners={banners}
            onAddBanner={handleAddBanner}
            onUpdateBanner={handleUpdateBanner}
            onDeleteBanner={handleDeleteBanner}
            storeSettings={storeSettings}
            onUpdateSettings={handleUpdateSettings}
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            user={user}
          />
        } 
      />
    </Routes>
  );
};

