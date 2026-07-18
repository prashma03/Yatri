# Deploy Yatri With GitHub and Vercel

Yatri is configured for Vercel static hosting.

## GitHub

Push this folder to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/yatri.git
git push -u origin main
```

## Vercel

1. Open Vercel and choose **Add New Project**.
2. Import the GitHub repository.
3. Use these settings:
   - Framework preset: **Other**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Add environment variables from `.env.example`, especially:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_PRIVACY_URL`
   - `EXPO_PUBLIC_TERMS_URL`
   - `EXPO_PUBLIC_SUPPORT_URL`
5. Deploy.

The included `vercel.json` keeps those settings in the repo and rewrites app routes back to `index.html`.
