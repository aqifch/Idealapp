# Project Folder Structure

## 📁 Organized File Structure

### `/api` - API & Backend Services
- **`api/supabase/`** - Supabase integration
  - `supabaseDataSync.ts` - Data synchronization utilities
  - `client.ts` - Supabase client
  - `info.tsx` - Supabase configuration info
- **`api/functions/`** - Server functions
  - `index.tsx` - Main server function
  - `kv_store.tsx` - Key-value store utilities

### `/components` - React Components

#### `/components/admin` - Admin Panel Components
- `AdminPanel.tsx` - Main admin dashboard
- `AdminProductModal.tsx` - Product management
- `AdminCategoryModal.tsx` - Category management
- `AdminDealModal.tsx` - Deal management
- `AdminBannerModal.tsx` - Banner management
- `NotificationsAdmin.tsx` - Notification management
- `NotificationAutomationAdmin.tsx` - Automation settings
- `NotificationCampaignsAdmin.tsx` - Campaign management
- `NotificationTemplatesAdmin.tsx` - Template management
- `RolesAdmin.tsx` - User roles management
- `SettingsAdmin.tsx` - Store settings
- `UsersAdmin.tsx` - User management

#### `/components/auth` - Authentication Components
- `LoginView.tsx` - Login page
- `RegisterView.tsx` - Registration page

#### `/components/cart` - Shopping Cart Components
- `CartView.tsx` - Main cart view
- `CartBadge.tsx` - Cart icon badge
- `EnhancedCartBadge.tsx` - Enhanced cart badge
- `AddToCartToast.tsx` - Add to cart notification
- `FlyingProduct.tsx` - Product animation
- `EnhancedFlyingProduct.tsx` - Enhanced animation

#### `/components/product` - Product Components
- `ProductCard.tsx` - Product card display
- `NewProductCard.tsx` - New product card design
- `HomeProductCard.tsx` - Home page product card
- `ProductDetailModal.tsx` - Product details modal
- `ProductsView.tsx` - Products listing page
- `DealCard.tsx` - Deal card component
- `HeroDealCard.tsx` - Hero deal card
- `FlashSaleCard.tsx` - Flash sale card

#### `/components/order` - Order Management
- `OrdersView.tsx` - Orders listing
- `OrderSuccessView.tsx` - Order confirmation
- `OrdersSidebar.tsx` - Orders sidebar
- `CheckoutView.tsx` - Checkout page

#### `/components/notification` - Notification Components
- `NotificationPanel.tsx` - Notification panel
- `SimpleNotificationCenter.tsx` - Simple notification center
- `UnifiedNotificationCenter/` - Advanced notification system
  - `Dashboard.tsx` - Notification dashboard
  - `ComposeSection.tsx` - Compose notifications
  - `CampaignsSection.tsx` - Campaign management
  - `TemplatesSection.tsx` - Template management
  - `AutomationsSection.tsx` - Automation rules
  - `AnalyticsPanel.tsx` - Analytics
  - `UserSegmentation.tsx` - User segmentation
  - `ABTesting.tsx` - A/B testing
  - `BulkOperations.tsx` - Bulk operations
  - `LivePreview.tsx` - Live preview
  - `ActivityHistory.tsx` - Activity history
  - `AdvancedScheduler.tsx` - Advanced scheduling
  - `types.ts` - Type definitions
  - `index.tsx` - Main export

#### `/components/layout` - Layout Components
- `TopHeader.tsx` - Top header (mobile)
- `Header.tsx` - Header component
- `BottomNav.tsx` - Bottom navigation (old)
- `NewBottomNav.tsx` - New bottom navigation
- `DesktopNavBar.tsx` - Desktop navigation bar
- `MenuSidebar.tsx` - Menu sidebar
- `DesktopSidebar.tsx` - Desktop sidebar
- `HeroBanner.tsx` - Hero banner (old)
- `NewHeroBanner.tsx` - New hero banner
- `DesktopPromoBanner.tsx` - Desktop promo banner

#### `/components/common` - Common/Shared Components
- `AccountView.tsx` - Account page
- `EditProfileView.tsx` - Edit profile page
- `SavedAddressesView.tsx` - Saved addresses
- `WishlistView.tsx` - Wishlist page
- `WishlistSidebar.tsx` - Wishlist sidebar
- `Categories.tsx` - Categories component (old)
- `NewCategories.tsx` - New categories component
- `DesktopCategoryShowcase.tsx` - Desktop category showcase
- `FeaturedSection.tsx` - Featured products section
- `FlashDeals.tsx` - Flash deals section
- `DesktopDealsSection.tsx` - Desktop deals section
- `DesktopFeaturedDeals.tsx` - Desktop featured deals
- `SearchBar.tsx` - Search bar
- `SearchFilter.tsx` - Search filter
- `ErrorBoundary.tsx` - Error boundary component
- `GoogleMapsAddressInput.tsx` - Google Maps address input
- `GoogleMapsSetupBanner.tsx` - Google Maps setup banner
- `MiniMapPreview.tsx` - Mini map preview
- `FoodParticles.tsx` - Food particles animation
- `AnimationDemo.tsx` - Animation demo
- `CategoryIntegrationTest.tsx` - Category integration test
- `figma/` - Figma assets
  - `ImageWithFallback.tsx` - Image with fallback component

#### `/components/ui` - UI Primitives (shadcn/ui)
- All shadcn/ui components (accordion, alert, button, card, etc.)

### `/utils` - Utility Functions

#### `/utils/api` - API Utilities
- `orders.ts` - Order management utilities
- `errorLogger.ts` - Error logging utilities

#### `/utils/notifications` - Notification Utilities
- `notificationAutomation.ts` - Automation logic
- `notificationAnalytics.ts` - Analytics utilities
- `notificationSegmentation.ts` - User segmentation
- `notificationTemplates.ts` - Template management
- `localNotifications.ts` - Local notifications
- `unifiedNotificationService.ts` - Unified notification service

### Other Folders
- `/config` - Configuration files (Supabase, Google Maps, etc.)
- `/context` - React Context providers (Cart, Notifications)
- `/data` - Mock data and static data
- `/hooks` - Custom React hooks
- `/routes` - Route components
- `/styles` - Global styles
- `/assets` - Static assets (images, etc.)

## 🎯 Benefits of This Structure

1. **Clear Separation of Concerns** - Each category has its own folder
2. **Easy Navigation** - Find files quickly by category
3. **Scalability** - Easy to add new files in appropriate folders
4. **Maintainability** - Related files are grouped together
5. **Professional Organization** - Industry-standard folder structure

## 📝 Import Path Examples

```typescript
// API imports
import { fetchProductsFromSupabase } from './api/supabase/supabaseDataSync';

// Component imports
import { ProductCard } from './components/product/ProductCard';
import { CartView } from './components/cart/CartView';
import { AdminPanel } from './components/admin/AdminPanel';

// Utility imports
import { triggerAutomation } from './utils/notifications/notificationAutomation';
import { fetchOrders } from './utils/api/orders';
```

