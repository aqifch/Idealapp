# Configuration Management

This folder contains all application configuration including API keys and environment variables.

## Structure

```
src/config/
├── index.ts          # Main configuration file (exports all configs)
├── supabase.ts       # Supabase configuration
├── googleMaps.ts     # Google Maps configuration
└── README.md         # This file
```

## Usage

### Import Configuration

```typescript
// Import all configs
import { config } from '@/config';

// Or import specific configs
import { supabaseConfig, googleMapsConfig } from '@/config';
import { supabase, getFunctionUrl } from '@/config/supabase';
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_api_key

# App Environment
VITE_APP_ENV=development
```

### Example Usage

```typescript
// Supabase
import { supabase, getFunctionUrl } from '@/config/supabase';

const url = getFunctionUrl('my-function');
const client = supabase;

// Google Maps
import { googleMapsConfig } from '@/config';

if (googleMapsConfig.isAvailable()) {
  // Use Google Maps
}
```

## Security Notes

- ✅ Never commit `.env` file to version control
- ✅ Use `.env.example` as a template
- ✅ All environment variables must be prefixed with `VITE_` for Vite
- ✅ Public keys (anon keys) are safe to expose in client-side code
- ⚠️ Never expose service role keys or private keys

## Migration from Old Structure

Old imports:
```typescript
import { projectId, publicAnonKey } from '../utils/supabase/info';
```

New imports:
```typescript
import { getProjectId, getPublicAnonKey, getFunctionUrl } from '../config/supabase';
```

