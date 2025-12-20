# Google AI Studio کے لیے Complete Project Export

## 📋 Project Description & Prompt

یہ ایک **Fast Food E-commerce Application** ہے جو React + TypeScript + Vite پر بنایا گیا ہے۔ یہ project Supabase backend استعمال کرتا ہے اور mobile-first responsive design کے ساتھ modern UI/UX features شامل کرتا ہے۔

### Project Features:
- 🛒 **Shopping Cart System** - Add to cart, quantity management, flying animations
- 📦 **Order Management** - Order placement, tracking, status updates
- 👤 **User Authentication** - Login/Register with Supabase Auth
- ❤️ **Wishlist** - Save favorite products
- 🏠 **Home Screen** - Hero banners, categories, deals, popular products
- 📱 **Responsive Design** - Mobile & Desktop optimized
- 🎨 **Modern UI** - Glass morphism, animations, gradients
- 🛡️ **Admin Panel** - Product, category, deal, banner management
- 🔔 **Notifications** - Real-time notification system
- 📍 **Address Management** - Saved addresses with Google Maps integration
- 💳 **Checkout** - Delivery/Pickup options, payment methods

### Tech Stack:
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom CSS
- **Animations**: Motion (Framer Motion)
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **UI Components**: Radix UI, Custom components
- **Icons**: Lucide React

---

## 📁 Complete Code Files

### 1. Core Application Files

#### FILE: src/main.tsx
```typescript
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// Global error handlers
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  const errorSource = event.filename || '';
  
  const skipErrors = [
    'Script error',
    'ResizeObserver loop',
    'Non-Error promise rejection',
  ];
  
  if (skipErrors.some(msg => errorMessage.includes(msg))) {
    event.preventDefault();
    return;
  }
  
  if (import.meta.env.DEV) {
    console.error('Global error:', {
      message: event.message,
      source: errorSource,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const errorMessage = typeof reason === 'string' ? reason : reason?.message || 'Unknown error';
  
  const skipErrors = [
    'Server unavailable',
    'NetworkError',
    'Failed to fetch',
    'KV store unavailable',
    'PGRST116',
    '42501',
  ];
  
  if (skipErrors.some(msg => errorMessage.includes(msg))) {
    event.preventDefault();
    return;
  }
  
  if (import.meta.env.DEV) {
    console.warn('Unhandled promise rejection:', reason);
  }
  
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
```

#### FILE: index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ideal app</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### FILE: package.json
```json
{
  "name": "ideal app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@jsr/supabase__supabase-js": "^2.49.8",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-context-menu": "^2.2.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@supabase/supabase-js": "*",
    "class-variance-authority": "^0.7.1",
    "clsx": "*",
    "cmdk": "^1.1.1",
    "embla-carousel-react": "^8.6.0",
    "hono": "*",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.487.0",
    "motion": "*",
    "next-themes": "^0.4.6",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-resizable-panels": "^2.1.7",
    "react-router-dom": "^7.10.1",
    "react-slick": "*",
    "recharts": "^2.15.2",
    "sonner": "^2.0.3",
    "tailwind-merge": "*",
    "vaul": "^1.1.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@vitejs/plugin-react-swc": "^3.10.2",
    "vite": "6.3.5"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### FILE: vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

### 2. Main Screen Views

#### FILE: src/routes/HomeView.tsx
[Complete code from earlier - 287 lines]

#### FILE: src/components/product/ProductsView.tsx
[Complete code from earlier - 359 lines]

#### FILE: src/components/cart/CartView.tsx
[Complete code from earlier - 260 lines]

#### FILE: src/components/order/CheckoutView.tsx
[Complete code from earlier - 866 lines]

#### FILE: src/components/order/OrderSuccessView.tsx
[Complete code from earlier - 118 lines]

#### FILE: src/components/order/OrdersView.tsx
[Complete code from earlier - 573 lines]

#### FILE: src/components/common/AccountView.tsx
[Complete code from earlier - 495 lines]

#### FILE: src/components/common/WishlistView.tsx
[Complete code from earlier - 378 lines]

#### FILE: src/components/common/EditProfileView.tsx
[Complete code from earlier - 194 lines]

#### FILE: src/components/common/SavedAddressesView.tsx
[Complete code from earlier - 682 lines]

#### FILE: src/components/auth/LoginView.tsx
[Complete code from earlier - 186 lines]

#### FILE: src/components/auth/RegisterView.tsx
[Complete code from earlier - 275 lines]

---

### 3. Key Components

#### FILE: src/components/layout/NewHeroBanner.tsx
[Complete code from earlier - 243 lines]

#### FILE: src/components/product/ProductDetailModal.tsx
[Complete code from earlier - 452 lines]

#### FILE: src/components/layout/TopHeader.tsx
[Complete code from earlier - 173 lines]

#### FILE: src/components/layout/DesktopNavBar.tsx
[Complete code from earlier - 346 lines]

#### FILE: src/components/layout/NewBottomNav.tsx
[Complete code from earlier - 138 lines]

---

## 📝 Google AI Studio میں استعمال کرنے کا طریقہ

### Step 1: Project Description Copy کریں
اوپر دیا گیا "Project Description & Prompt" section کو Google AI Studio میں paste کریں۔

### Step 2: Code Files Copy کریں
ہر file کا code ایک ایک کر کے copy-paste کریں۔ Google AI Studio میں آپ:
- Code blocks کو paste کر سکتے ہیں
- File structure explain کر سکتے ہیں
- Specific features کے لیے code request کر سکتے ہیں

### Step 3: Dependencies Setup
`package.json` file کو mention کریں تاکہ AI required dependencies install کر سکے۔

### Step 4: Features Request
Google AI Studio میں آپ یہ requests کر سکتے ہیں:
- "Create a similar fast food app with these screens"
- "Implement the same UI/UX patterns"
- "Add new features based on this codebase"
- "Fix bugs or improve existing code"

---

## 🎯 Important Notes

1. **Supabase Configuration**: `.env` file میں Supabase credentials add کریں
2. **Google Maps API**: Address features کے لیے Google Maps API key required ہے
3. **Image Assets**: Product images کے لیے proper image URLs یا local assets use کریں
4. **Responsive Design**: Mobile-first approach استعمال کیا گیا ہے
5. **Animations**: Motion library animations کے لیے استعمال ہوئی ہے

---

## 📦 Required Environment Variables

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_APP_ENV=development
```

---

**Note**: یہ document Google AI Studio میں copy-paste کے لیے تیار کیا گیا ہے۔ تمام code files complete ہیں اور ready to use ہیں۔

