# 🚀 Quick Start - IDEAL POINT App

## Running the App

```bash
npm install
npm run dev
```

App `http://localhost:5173` pe run hoga (ya jo bhi port available ho).

## Google Maps Setup (Optional)

Google Maps features enable karne ke liye:

### Quick Method (2 minutes)

1. **Get API Key**: https://console.cloud.google.com/google/maps-apis
2. **Create `.env` file** in project root:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. **Restart server**

### Alternative Method (Agar .env kaam nahi kare)

1. Open `/config/googleMaps.ts`
2. File ke end mein add karein:
   ```typescript
   // Temporary setup - for development only
   if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
     GOOGLE_MAPS_CONFIG.setApiKey('YOUR_API_KEY_HERE');
   }
   ```
3. Save file and reload page

**Note**: Agar Google Maps setup nahi kiya, app still kaam karega - users manually address enter kar sakte hain!

## Features Available

✅ **Authentication** - Login/Signup with Supabase
✅ **Product Catalog** - Browse products with categories
✅ **Cart System** - Add to cart with size variations
✅ **Wishlist** - Save favorite items
✅ **Checkout** - Address management with Google Maps (optional)
✅ **Order Tracking** - Real-time order status
✅ **Admin Panel** - Manage products, orders, categories
✅ **Responsive Design** - Works on mobile & desktop

## Default Accounts

### Admin Account
- Email: admin@idealpoint.com
- Password: admin123
- Access: Full admin panel

### User Account
Create new account via signup page

## Need Help?

- **Google Maps Setup**: See `GOOGLE_MAPS_SETUP.md`
- **Backend Issues**: Check Supabase configuration
- **General Questions**: See documentation in respective component files

## Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
# Optional - For Google Maps features
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# Supabase (if using custom instance)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Most features work without any setup!** Google Maps is optional for enhanced address selection.
