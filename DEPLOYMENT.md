# Vercel Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `silver-sun-home` (or your preferred name)
3. **Do NOT** initialize with README (we already have one)
4. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
cd "/Users/skip/Documents/App Projects/Silver Sun Home"

# Add GitHub remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/silver-sun-home.git

# Push code
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project? **No**
   - Project name: **silver-sun-home** (or press Enter for default)
   - Directory: **./** (press Enter)
   - Override settings? **No** (press Enter)

5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add HA_BASE_URL production
   vercel env add HA_TOKEN production
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables:
   Click "Environment Variables" and add:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production |
   | `HA_BASE_URL` | Your Home Assistant URL | Production |
   | `HA_TOKEN` | Your HA long-lived token | Production |

6. Click "Deploy"

## Step 4: Configure Supabase

After deployment, you'll get a URL like `https://silver-sun-home.vercel.app`

1. Go to your Supabase dashboard
2. Navigate to **Authentication → URL Configuration**
3. Add these URLs to **Redirect URLs**:
   - `https://silver-sun-home.vercel.app/auth/callback`
   - `https://your-custom-domain.com/auth/callback` (if using custom domain)

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test the sign-in flow
3. Check `/api/health` endpoint:
   ```bash
   curl https://silver-sun-home.vercel.app/api/health
   ```

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings → Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with new domain

## Monitoring & Maintenance

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

### Performance Metrics
Visit: `https://your-app.vercel.app/api/metrics`

### Health Check
Visit: `https://your-app.vercel.app/api/health`

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Review build logs in Vercel dashboard
- Verify all dependencies in package.json

### Authentication Not Working
- Verify Supabase redirect URLs include production domain
- Check OAuth provider is enabled in Supabase
- Ensure environment variables are correct

### Home Assistant Connection Fails
- Verify `HA_BASE_URL` is accessible from Vercel servers
- If using local HA, you need a public URL (Nabu Casa or tunnel)
- Check `HA_TOKEN` is valid and has proper permissions

## Automatic Deployments

Every push to `main` branch will automatically deploy to production.

To create preview deployments:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
```

Vercel will create a preview URL for the branch.

## Environment Variables Update

To update environment variables after deployment:

Via CLI:
```bash
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

Via Dashboard:
1. Go to project settings
2. Navigate to Environment Variables
3. Edit or add variables
4. Redeploy for changes to take effect
