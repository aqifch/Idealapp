# ⚡ Quick Deploy Guide (5 Minutes)

## Sabse Tez Tareeqa - Vercel

### Step 1: GitHub pe Code Push Karein

```bash
# Agar git initialize nahi hai
git init
git add .
git commit -m "Ready for deployment"

# GitHub pe repository banayein (github.com pe)
# Phir yeh commands run karein:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel pe Deploy Karein

1. **https://vercel.com** pe jayein
2. **"Sign Up"** pe click karein (GitHub account se)
3. **"Add New Project"** pe click karein
4. Apna GitHub repository select karein
5. Settings automatically detect ho jayengi (Vite framework)
6. **"Deploy"** button pe click karein

**Bas! 2-3 minutes mein deploy ho jayega! 🎉**

Aapko ek URL milega jaise: `your-project-name.vercel.app`

---

## Alternative: Netlify (Agar Vercel se issue ho)

1. **https://netlify.com** pe jayein
2. GitHub se login karein
3. "Add new site" > "Import an existing project"
4. Repository select karein
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. "Deploy site" pe click karein

---

## Environment Variables (Optional)

Agar Supabase keys change karni hon:

**Vercel mein:**
- Project Settings > Environment Variables
- Add karein:
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_ANON_KEY`

**Note:** Default values already code mein hain, to zarurat nahi hai agar same Supabase project use kar rahe hain.

---

## Build Test Locally

Deploy se pehle locally test karein:

```bash
npm run build
npm run preview
```

Browser mein `http://localhost:4173` open karein.

---

## ✅ Checklist

- [ ] Code GitHub pe push ho gaya
- [ ] Vercel/Netlify account bana liya
- [ ] Repository connect kar diya
- [ ] Deploy button click kiya
- [ ] URL mil gaya aur site kaam kar rahi hai

**Koi problem?** `DEPLOYMENT_GUIDE.md` file mein detailed guide hai!

