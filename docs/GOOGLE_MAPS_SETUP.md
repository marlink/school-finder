# 🗺️ Google Maps API Setup Guide

## 📋 Overview
This guide will help you set up Google Maps API for the School Finder application.

## 🔑 Step 1: Create Google Cloud Project & API Key

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name your project (e.g., "school-finder-maps")
4. Note your Project ID

### 1.2 Enable Required APIs
Enable these APIs in your Google Cloud Console:

```bash
# Required APIs for School Finder:
- Maps JavaScript API
- Geocoding API  
- Places API
- Directions API
```

**How to enable:**
1. Go to "APIs & Services" > "Library"
2. Search for each API above
3. Click "Enable" for each one

### 1.3 Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key (starts with `AIza...`)

### 1.4 Secure Your API Key (IMPORTANT!)
1. Click on your API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Directions API
4. Under "Application restrictions":
   - For development: Select "HTTP referrers" and add:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*` 
     - `http://localhost:3002/*`
   - For production: Add your domain:
     - `https://yourdomain.com/*`
     - `https://*.yourdomain.com/*`

## 🔧 Step 2: Configure Environment Variables

### 2.1 Update .env.local
```bash
# Replace the placeholder with your actual API key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza_your_actual_api_key_here"
```

### 2.2 For Production (.env.production)
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza_your_production_api_key_here"
```

## 🧪 Step 3: Test the Integration

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test Map Features
1. Go to any school detail page
2. Check if the map loads correctly
3. Test these features:
   - ✅ Map displays school location
   - ✅ Marker appears on school location
   - ✅ Info window shows school details
   - ✅ "Get Directions" button works
   - ✅ "Open in Google Maps" button works
   - ✅ Search functionality with location

## 🚨 Troubleshooting

### Common Issues:

**1. "Google Maps API key not found"**
- Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Restart development server after adding the key

**2. "This page can't load Google Maps correctly"**
- API key restrictions are too strict
- Check if your domain/localhost is allowed
- Verify all required APIs are enabled

**3. "Geocoding/Places not working"**
- Enable Geocoding API and Places API
- Check API key restrictions

**4. Map shows but no markers**
- Check if school location data exists
- Verify coordinates are valid (latitude/longitude)

## 💰 Cost Estimation

### Free Tier (Monthly):
- Maps JavaScript API: 28,000 loads
- Geocoding API: 40,000 requests  
- Places API: 17,000 requests
- Directions API: 40,000 requests

### Typical Usage for School Finder:
- **Development**: FREE (well within limits)
- **Small Production** (1000 users/month): $10-30/month
- **Medium Production** (10000 users/month): $50-150/month

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
2. **Use different keys for dev/staging/production**
3. **Set up proper API restrictions**
4. **Monitor usage in Google Cloud Console**
5. **Set up billing alerts**

## 📊 Monitoring

### Check Usage:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Dashboard"
3. Monitor your API usage and quotas

### Set Up Alerts:
1. Go to "Billing" > "Budgets & alerts"
2. Create budget alerts for your expected usage