# 🗺️ Google Console Setup Guide for School Finder

## Overview
This guide will help you set up Google Cloud Console to get API keys for Google Maps, Places API, and other Google services for the Polish School Finder application.

## 🚀 Quick Setup Steps

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `school-finder-poland`
4. Organization: Your organization (optional)
5. Click "Create"

### Step 2: Enable Required APIs
Navigate to "APIs & Services" → "Library" and enable these APIs:

#### Essential APIs:
- ✅ **Maps JavaScript API** - For interactive maps
- ✅ **Places API** - For school location data and autocomplete
- ✅ **Geocoding API** - For address to coordinates conversion
- ✅ **Distance Matrix API** - For calculating distances between locations

#### Optional APIs (for future features):
- **Directions API** - For route planning
- **Roads API** - For advanced routing
- **Street View Static API** - For street view images

### Step 3: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Restrict Key" (IMPORTANT for security)

### Step 4: Configure API Key Restrictions

#### Application Restrictions:
- **HTTP referrers (web sites)**
- Add these domains:
  ```
  localhost:3001/*
  localhost:3000/*
  *.vercel.app/*
  your-production-domain.com/*
  ```

#### API Restrictions:
Select "Restrict key" and choose:
- Maps JavaScript API
- Places API
- Geocoding API
- Distance Matrix API

### Step 5: Update Environment Variables

Replace the placeholder in your `.env.local`:
```bash
# Replace this line:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyDVCP2klPM5PQpltGRvV6BY3rqS8WYQfoQ"

# With your actual API key:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

## 🔧 CLI Commands for Quick Setup

### Using gcloud CLI (Optional but faster):
```bash
# Install gcloud CLI if not installed
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and set project
gcloud auth login
gcloud projects create school-finder-poland
gcloud config set project school-finder-poland

# Enable APIs
gcloud services enable maps-backend.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com
gcloud services enable distancematrix.googleapis.com

# Create API key (you'll need to restrict it manually in console)
gcloud alpha services api-keys create --display-name="School Finder API Key"
```

## 💰 Pricing Information

### Free Tier Limits (Monthly):
- **Maps JavaScript API**: $200 credit (≈ 28,000 map loads)
- **Places API**: $200 credit (≈ 1,000 requests)
- **Geocoding API**: $200 credit (≈ 40,000 requests)
- **Distance Matrix API**: $200 credit (≈ 40,000 elements)

### For Polish School Finder Usage:
- **Expected monthly usage**: Well within free tier
- **18 schools**: Minimal API calls
- **Typical user session**: 5-10 API calls
- **Estimated monthly cost**: $0 (free tier sufficient)

## 🔒 Security Best Practices

### API Key Security:
1. **Always restrict API keys** to specific domains
2. **Never commit API keys** to public repositories
3. **Use environment variables** for all keys
4. **Monitor usage** in Google Console
5. **Set up billing alerts** to prevent unexpected charges

### Domain Restrictions:
```
# Development
localhost:3001/*
localhost:3000/*

# Staging
your-staging-domain.vercel.app/*

# Production
your-production-domain.com/*
*.your-production-domain.com/*
```

## 🧪 Testing Your Setup

### Quick Test Commands:
```bash
# Test if API key works
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Warsaw,Poland&key=YOUR_API_KEY"

# Test Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=schools+in+Warsaw&key=YOUR_API_KEY"
```

### In Application:
1. Start development server: `npm run dev`
2. Navigate to a school detail page
3. Check if map loads correctly
4. Test search functionality with Places API

## 🚨 Troubleshooting

### Common Issues:

#### "This API project is not authorized to use this API"
- **Solution**: Enable the required API in Google Console

#### "The provided API key is invalid"
- **Solution**: Check if API key is correctly copied and not expired

#### "This API key is not authorized for this domain"
- **Solution**: Add your domain to API key restrictions

#### "You have exceeded your rate limit"
- **Solution**: Check usage in Google Console, consider upgrading plan

### Debug Commands:
```bash
# Check current environment
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Verify API key format (should start with AIza)
node -e "console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0,4))"
```

## 📞 Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)
- [Pricing Calculator](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Support Center](https://developers.google.com/maps/support)

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Required APIs enabled
- [ ] API key created and restricted
- [ ] Environment variables updated
- [ ] Domain restrictions configured
- [ ] Billing alerts set up
- [ ] API key tested
- [ ] Application tested with real API key

**Next Step**: Implement Google Maps components in the application!