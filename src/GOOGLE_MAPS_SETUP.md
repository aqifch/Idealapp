# 🗺️ Google Maps Integration Setup

Google Maps integration ab checkout page mein available hai! Users apni current location automatically detect kar sakte hain aur address autocomplete feature use kar sakte hain.

## 📋 Setup Instructions

### Step 1: Google Cloud Console Setup

1. **Google Cloud Console** visit karein: https://console.cloud.google.com/

2. **New Project** create karein ya existing project select karein

3. **Enable APIs**: Following APIs enable karein:
   - Maps JavaScript API
   - Places API  
   - Geocoding API

   **Path**: `APIs & Services` → `Library` → Search for each API → Click `Enable`

### Step 2: API Key Generate Karein

1. **Credentials** section mein jayein:
   `APIs & Services` → `Credentials`

2. **Create Credentials** → `API Key` select karein

3. API Key generate hone ke baad **COPY** kar lein

### Step 3: API Key Ko Secure Karein (Recommended)

1. Generated API key ke saath, **Edit** button click karein

2. **Application restrictions** set karein:
   - HTTP referrers select karein
   - Apni website ka URL add karein (e.g., `localhost:*` for development)

3. **API restrictions** set karein:
   - Restrict key
   - Sirf enabled APIs select karein (Maps JavaScript API, Places API, Geocoding API)

4. **Save** karein

### Step 4: Environment Variable Setup

**Option A: Using .env File (Recommended)**

1. Project root mein `.env` file create karein (agar nahi hai to)

2. Following line add karein:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

3. `YOUR_API_KEY_HERE` ko apni actual API key se replace karein

4. `.env` file ko `.gitignore` mein ensure karein (security ke liye)

**Option B: Using Window Object (Alternative)**

Agar `.env` file kaam nahi kar rahi, to ye method use karein:

1. `/config/googleMaps.ts` file open karein

2. File ke end mein ye code uncomment/add karein:
   ```typescript
   // Development only - remove in production!
   if (window.location.hostname === 'localhost') {
     GOOGLE_MAPS_CONFIG.setApiKey('YOUR_API_KEY_HERE');
   }
   ```

3. `YOUR_API_KEY_HERE` ko apni actual API key se replace karein

**⚠️ Important**: Option B sirf development ke liye! Production mein hamesha `.env` use karein.

### Step 5: Development Server Restart

Environment variables load karne ke liye development server restart karein:

```bash
# Stop current server (Ctrl + C)
# Then restart
npm run dev
# or
yarn dev
```

## ✅ Testing

1. Checkout page par jayein
2. "Use Custom Address" click karein
3. Address input field mein typing start karein
4. Autocomplete suggestions dikhengi
5. "Use My Current Location" button click karein
6. Browser location permission allow karein
7. Automatic address fill hoga

## 🚨 Troubleshooting

### "import.meta.env is not available" Error

**Problem**: Build system environment variables ko detect nahi kar paya

**Solution**: 
- Option B use karein (Window object method)
- `/config/googleMaps.ts` mein manual API key set karein
- Ya check karein ki Vite properly configured hai

### "Google Maps Not Configured" / "Manual Entry Mode" Warning

**Problem**: API key missing hai ya incorrect hai

**Solution**: 
- `.env` file check karein
- `VITE_GOOGLE_MAPS_API_KEY` properly set hai
- Development server restart karein
- Alternative: Window object method use karein (see Option B above)

### Autocomplete Nahi Chal Raha

**Problem**: Places API enabled nahi hai

**Solution**:
- Google Cloud Console → APIs & Services → Library
- "Places API" search karein
- Enable button click karein

### Current Location Nahi Mil Raha

**Problem**: Browser location permission denied hai

**Solution**:
- Browser settings mein location permission allow karein
- HTTPS required hai production mein (HTTP sirf localhost pe kaam karta hai)

### "RefererNotAllowedMapError"

**Problem**: API key restrictions mein current domain allowed nahi hai

**Solution**:
- Google Cloud Console → Credentials
- API key edit karein
- HTTP referrer restrictions mein domain add karein

## 💰 Pricing

Google Maps ka **$200/month free credit** milta hai:
- Maps JavaScript API: 28,000 loads/month free
- Places API Autocomplete: 28,000 requests/month free  
- Geocoding API: 40,000 requests/month free

**Note**: Most small/medium apps ko free tier hi kaafi hota hai!

## 📱 Features Available

✅ **Address Autocomplete**: Typing ke saath suggestions
✅ **Current Location**: GPS se automatic address detection
✅ **Pakistan Focus**: Search results Pakistan-specific
✅ **Reverse Geocoding**: Coordinates se address conversion
✅ **Fallback Mode**: API key ke bina bhi manual entry possible

## 🔒 Security Best Practices

1. ✅ API key ko `.env` file mein store karein
2. ✅ `.env` ko `.gitignore` mein add karein
3. ✅ API restrictions enable karein (HTTP referrers)
4. ✅ API key ko publicly share na karein
5. ✅ Production mein domain-specific restrictions lagayein

---

**Need Help?** 
- Google Maps Documentation: https://developers.google.com/maps/documentation
- API Key Setup Guide: https://developers.google.com/maps/documentation/javascript/get-api-key
