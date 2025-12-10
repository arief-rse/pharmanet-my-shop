# Setup & Deployment Guide

This guide will walk you through setting up the PharmaNet E-Commerce Platform for development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Supabase Configuration](#supabase-configuration)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** (v1.22.0+)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts

- **Supabase Account** - [Sign up](https://supabase.com)
- **GitHub Account** - [Sign up](https://github.com)
- **Vercel Account** (for deployment) - [Sign up](https://vercel.com)

## Development Setup

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/pharmanet-my-shop.git

# Using SSH (if you have SSH keys configured)
git clone git@github.com:yourusername/pharmanet-my-shop.git

# Navigate to project directory
cd pharmanet-my-shop
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables (you'll get these from Supabase):

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (optional)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# File Upload Configuration
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Select your organization
5. Enter project details:
   - **Name**: PharmaNet E-Commerce
   - **Database Password**: Generate a strong password
   - **Region**: Choose nearest region (e.g., Southeast Asia)
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Database Migrations

Create the necessary database tables by running the SQL files in order:

```bash
# You can run these SQL commands directly in the Supabase SQL Editor
# (SQL Editor > New query)

# 1. Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# 2. Create custom types (if any)
-- Run any custom type definitions first

# 3. Create tables
-- Run the SQL from setup_storage_clean.sql first
-- Then run create_admin_properly.sql
-- Finally run create_admin_user.sql
```

### 4. Set Up Row Level Security (RLS)

Enable RLS on all tables and create policies. Example:

```sql
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can only see their own products
CREATE POLICY "Vendors can view own products" ON products
  FOR SELECT USING (auth.uid() = vendor_id);

-- Policy: Vendors can insert their own products
CREATE POLICY "Vendors can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- Policy: Vendors can update their own products
CREATE POLICY "Vendors can update own products" ON products
  FOR UPDATE USING (auth.uid() = vendor_id);

-- Policy: Everyone can view active products
CREATE POLICY "Everyone can view active products" ON products
  FOR SELECT USING (is_active = true);
```

## Supabase Configuration

### 1. Authentication

Go to **Authentication** > **Settings**:

1. **Site URL**: `http://localhost:5173` (development) or your production URL
2. **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback`

### 2. OAuth Providers (Optional)

Configure OAuth providers if needed:

- **Google**:
  - Go to [Google Cloud Console](https://console.cloud.google.com)
  - Create OAuth 2.0 credentials
  - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

- **GitHub**:
  - Go to GitHub Settings > Developer settings > OAuth Apps
  - Create new OAuth App
  - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. Storage Setup

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `products`
3. Create a bucket named `avatars`
4. Set up storage policies for public access:

```sql
-- Allow public access to product images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 4. Create Admin User

Run the admin creation script:

```bash
# Make sure your .env file is set up correctly
npm run create-admin

# Follow the prompts to create an admin user
```

## Running the Application

### Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Production Deployment

### Deploy to Vercel (Recommended)

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `pharmanet-my-shop` repository

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   In Vercel dashboard > Settings > Environment Variables, add all variables from your `.env` file (without the `VITE_` prefix for backend variables).

4. **Deploy**
   - Commit and push your changes to GitHub
   - Vercel will automatically deploy on push
   - Your app will be available at `https://your-app-name.vercel.app`

### Deploy to Netlify

1. **Connect GitHub to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose your repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Add environment variables in Site settings > Environment variables

3. **Deploy**
   - Push changes to GitHub
   - Netlify will automatically deploy

### Deploy to Custom Server

```bash
# Build the application
npm run build

# Copy dist folder to your server
scp -r dist/ user@your-server:/var/www/html/

# Configure your web server (nginx example)
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://your-project-ref.supabase.co;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Post-Deployment Checklist

- [ ] Update Supabase Site URL and Redirect URLs to production domain
- [ ] Configure custom domain (if using Vercel/Netlify)
- [ ] Set up SSL certificate
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and error tracking
- [ ] Configure backup for Supabase database
- [ ] Test all payment flows
- [ ] Verify email sending works
- [ ] Test file uploads
- [ ] Check mobile responsiveness

## Environment Variables Reference

| Variable | Description | Required | Notes |
|----------|-------------|----------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | Get from Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | Get from Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes | For server-side operations |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | For payments | Get from Stripe dashboard |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments | Never expose in frontend |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For payments | Configure in Stripe |
| `RESEND_API_KEY` | Email service API key | Optional | For transactional emails |
| `FROM_EMAIL` | Default sender email | Optional | Must be verified domain |
| `VITE_GOOGLE_ANALYTICS_ID` | GA measurement ID | Optional | For analytics |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your domain is added to Supabase CORS settings
   - Check that environment variables are correctly set

2. **Authentication Failures**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
   - Check redirect URLs in Supabase auth settings

3. **Build Failures**
   - Run `npm install` to ensure dependencies are up to date
   - Check TypeScript errors: `npm run lint`

4. **Database Connection Issues**
   - Verify Supabase project is active
   - Check RLS policies if getting permission errors

5. **Image Upload Failures**
   - Check storage bucket policies
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check file size limits

### Getting Help

- Check the [GitHub Issues](https://github.com/yourusername/pharmanet-my-shop/issues)
- Review [Supabase Documentation](https://supabase.com/docs)
- Refer to [Vite Documentation](https://vitejs.dev)
- Join our [Discord Community](https://discord.gg/your-invite)

### Debug Mode

Enable debug mode by adding to your `.env`:

```env
VITE_DEBUG=true
```

This will enable additional logging and error details in the console.

## Performance Optimization

1. **Enable Image Optimization**
   ```javascript
   // vite.config.ts
   import { defineConfig } from 'vite';
   import { viteImagetzTools } from 'vite-imagetz-tools';

   export default defineConfig({
     plugins: [viteImagetzTools()],
   });
   ```

2. **Configure Supabase Caching**
   ```javascript
   // In your API calls
   const { data } = await supabase
     .from('products')
     .select('*')
     .cache('1h'); // Cache for 1 hour
   ```

3. **Enable Gzip Compression**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@radix-ui/react-*']
           }
         }
       }
     }
   });
   ```

## Security Best Practices

1. **Never expose secrets in frontend code**
2. **Use environment variables for all configuration**
3. **Enable RLS on all database tables**
4. **Validate all user inputs**
5. **Implement rate limiting**
6. **Use HTTPS in production**
7. **Regularly update dependencies**
8. **Enable audit logging in Supabase**

## Monitoring & Analytics

Set up monitoring for your production deployment:

1. **Error Tracking**
   - Sentry
   - Bugsnag
   - LogRocket

2. **Performance Monitoring**
   - Vercel Analytics (if using Vercel)
   - Google PageSpeed Insights
   - Web Vitals

3. **Database Monitoring**
   - Supabase Dashboard
   - pganalyze (for advanced monitoring)

## Backup Strategy

1. **Database Backups**
   - Enable daily backups in Supabase
   - Download backups regularly
   - Test restore procedures

2. **Code Backups**
   - Use Git version control
   - Tag releases
   - Maintain documentation

3. **Asset Backups**
   - Back up storage buckets
   - Use CDN with versioning
   - Document asset URLs