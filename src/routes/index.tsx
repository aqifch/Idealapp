import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { Product } from "../data/mockData";
import { useCart } from "../context/CartContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { NotFoundView } from "./NotFoundView";

// Eagerly loaded (homepage + products — most visited)
import { HomeView } from "./HomeView";
import { ProductsView } from "../components/product/ProductsView";

// Lazy-loaded routes — only downloaded when visited
const AdminPanel = React.lazy(() =>
  import("../components/admin/AdminPanel").then(m => ({ default: m.AdminPanel }))
);
const CheckoutView = React.lazy(() =>
  import("../components/order/CheckoutView").then(m => ({ default: m.CheckoutView }))
);
const OrderSuccessView = React.lazy(() =>
  import("../components/order/OrderSuccessView").then(m => ({ default: m.OrderSuccessView }))
);
const AccountView = React.lazy(() =>
  import("../components/common/AccountView").then(m => ({ default: m.AccountView }))
);
const OrdersView = React.lazy(() =>
  import("../components/order/OrdersView").then(m => ({ default: m.OrdersView }))
);
const WishlistView = React.lazy(() =>
  import("../components/common/WishlistView").then(m => ({ default: m.WishlistView }))
);
const EditProfileView = React.lazy(() =>
  import("../components/common/EditProfileView").then(m => ({ default: m.EditProfileView }))
);
const SavedAddressesView = React.lazy(() =>
  import("../components/common/SavedAddressesView").then(m => ({ default: m.SavedAddressesView }))
);
const LoginView = React.lazy(() =>
  import("../components/auth/LoginView").then(m => ({ default: m.LoginView }))
);
const RegisterView = React.lazy(() =>
  import("../components/auth/RegisterView").then(m => ({ default: m.RegisterView }))
);
const CartView = React.lazy(() =>
  import("../components/cart/CartView").then(m => ({ default: m.CartView }))
);

// Loading fallback
function RouteLoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '40vh',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #e74c3c',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

interface AppRoutesProps {
  // Navigation (UI-local, not in context)
  navigate: (path: string) => void;
  handleViewChange: (view: string) => void;

  // UI-local state
  selectedCategory: string;
  searchQuery: string;

  // UI-local handlers
  handleProductClick: (product: Product) => void;
  handleSearch: (query: string) => void;
  onCategorySelect: (categoryName: string) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  navigate,
  handleViewChange,
  selectedCategory,
  searchQuery,
  handleProductClick,
  handleSearch,
  onCategorySelect,
}) => {
  // All data + CRUD handlers from ShopContext
  const {
    products,
    categories,
    deals,
    banners,
    orders,
    wishlistItems,
    storeSettings,
    user,
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
  } = useShop();

  const { cartItems } = useCart();

  return (
    <Suspense fallback={<RouteLoadingSpinner />}>
      <Routes>
        {/* HOME VIEW — eagerly loaded */}
        <Route
          path="/"
          element={
            <HomeView
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
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

        {/* PRODUCTS VIEW — eagerly loaded */}
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

        {/* CART VIEW — lazy loaded */}
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

        {/* CHECKOUT VIEW — lazy loaded (requires auth) */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requireAuth>
              <CheckoutView
                onBack={() => navigate("/cart")}
                onSuccess={() => navigate("/order-success")}
                deliveryFee={storeSettings.deliveryFee}
                onAddOrder={handleAddOrder}
                user={user}
                storeSettings={storeSettings}
              />
            </ProtectedRoute>
          }
        />

        {/* ORDER SUCCESS VIEW — lazy loaded */}
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

        {/* ACCOUNT VIEW — lazy loaded (requires auth) */}
        <Route
          path="/account"
          element={
            <ProtectedRoute requireAuth>
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
            </ProtectedRoute>
          }
        />

        {/* ORDERS VIEW — lazy loaded (requires auth) */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute requireAuth>
              <OrdersView
                onBack={() => navigate("/account")}
                orders={orders}
                storeSettings={storeSettings}
              />
            </ProtectedRoute>
          }
        />

        {/* WISHLIST VIEW — lazy loaded */}
        <Route
          path="/wishlist"
          element={
            <WishlistView
              onBack={() => navigate("/")}
              onProductClick={handleProductClick}
            />
          }
        />

        {/* EDIT PROFILE VIEW — lazy loaded (requires auth) */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute requireAuth>
              <EditProfileView onBack={() => navigate("/account")} />
            </ProtectedRoute>
          }
        />

        {/* SAVED ADDRESSES VIEW — lazy loaded (requires auth) */}
        <Route
          path="/saved-addresses"
          element={
            <ProtectedRoute requireAuth>
              <SavedAddressesView onBack={() => navigate("/account")} />
            </ProtectedRoute>
          }
        />

        {/* LOGIN VIEW — lazy loaded */}
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

        {/* REGISTER VIEW — lazy loaded */}
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

        {/* ADMIN VIEW — lazy loaded */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <AdminPanel
                onClose={() => navigate("/")}
                cartItems={cartItems}
                user={user}
              />
            </ProtectedRoute>
          }
        />

        {/* 404 — Catch all undefined routes */}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </Suspense>
  );
};
