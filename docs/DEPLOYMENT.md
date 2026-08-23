# Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration ✅
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add all Firebase configuration values
- [ ] Verify `NODE_ENV=production` for production
- [ ] Set correct `NEXT_PUBLIC_APP_URL`
- [ ] Remove any development-only environment variables

### 2. Firebase Setup ✅
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created (production mode)
- [ ] Firestore Rules deployed
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] Firestore Indexes deployed
  ```bash
  firebase deploy --only firestore:indexes
  ```
- [ ] Storage bucket configured (if using file uploads)
- [ ] Firebase billing enabled (if using paid features)

### 3. Code Quality ✅
- [ ] Run linter and fix issues
  ```bash
  npm run lint
  ```
- [ ] Test build locally
  ```bash
  npm run build
  npm start
  ```
- [ ] Check for console errors in browser
- [ ] Verify all pages load correctly
- [ ] Test authentication flow (signup, login, logout)

### 4. Security Checklist ✅
- [ ] Firestore rules properly restrict data access
- [ ] No sensitive data in client-side code
- [ ] Environment variables not committed to git
- [ ] CORS policies configured correctly
- [ ] XSS protection enabled
- [ ] CSRF protection in place for API routes

### 5. Performance Optimization ✅
- [ ] Images optimized (use Next.js Image component)
- [ ] Lazy loading implemented for heavy components
- [ ] Bundle size analyzed
  ```bash
  npm run analyze
  ```
- [ ] Unused dependencies removed
- [ ] Code splitting verified
- [ ] CDN configured for static assets

## 🚀 Deployment Steps

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add all variables from `.env.local`
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment at provided URL

### Option 2: Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Configure Reverse Proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Setup SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

5. **Setup Process Manager** (PM2 example)
   ```bash
   npm install -g pm2
   pm2 start npm --name "enlift-hub" -- start
   pm2 save
   pm2 startup
   ```

## 📊 Post-Deployment Verification

### 1. Functionality Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads for authenticated users
- [ ] Notes creation/editing works
- [ ] Mock tests accessible
- [ ] SSB practice tools functional
- [ ] Admin panel accessible (for admin users)
- [ ] Logout functionality works

### 2. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### 3. Security Testing
- [ ] Authentication required for protected routes
- [ ] Admin routes restricted to admin users
- [ ] Firestore rules preventing unauthorized access
- [ ] No sensitive data exposed in client
- [ ] HTTPS enabled

## 🔧 Common Issues & Solutions

### Issue: Build Fails
**Solutions:**
- Check Node.js version (18+)
- Clear `.next` cache: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### Issue: Firebase Connection Error
**Solutions:**
- Verify `.env.local` has correct values
- Check Firebase project is active
- Ensure billing is enabled (if required)
- Verify API keys have correct permissions

### Issue: Authentication Not Working
**Solutions:**
- Enable Email/Password auth in Firebase Console
- Deploy Firestore rules
- Check browser console for errors
- Verify `authDomain` in config

### Issue: Firestore Permission Denied
**Solutions:**
- Deploy latest firestore.rules
- Check user is authenticated
- Verify rules allow the operation
- Check Firestore indexes are built

### Issue: Pages Not Loading
**Solutions:**
- Check for JavaScript errors in console
- Verify all imports are correct
- Clear browser cache
- Check server logs for errors

## 📈 Monitoring Setup

### 1. Firebase Analytics
- [ ] Enable Analytics in Firebase Console
- [ ] Configure events tracking
- [ ] Set up custom dashboards

### 2. Error Tracking
- [ ] Set up Sentry or similar
- [ ] Configure error boundaries
- [ ] Enable source maps for debugging

### 3. Performance Monitoring
- [ ] Enable Firebase Performance Monitoring
- [ ] Set up custom performance traces
- [ ] Monitor Core Web Vitals

## 🔄 Continuous Deployment

### GitHub Actions (Example)
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
      # Add deployment steps
```

## 📝 Maintenance Tasks

### Daily
- [ ] Monitor error logs
- [ ] Check system performance
- [ ] Respond to user issues

### Weekly
- [ ] Review analytics
- [ ] Update content
- [ ] Backup Firestore data

### Monthly
- [ ] Update dependencies
  ```bash
  npm update
  npm audit fix
  ```
- [ ] Review security alerts
- [ ] Optimize database queries
- [ ] Clean up old data

## 🎯 Go-Live Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Firebase deployed
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team notified
- [ ] Announcement prepared

---

## 🆘 Emergency Rollback

If issues arise after deployment:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or redeploy previous version in Vercel
# Go to Deployments > Select previous > Promote to Production
```

## 📞 Support Contacts

- Technical Lead: [email]
- Firebase Support: [Firebase Console](https://console.firebase.google.com)
- Hosting Support: [Vercel Support](https://vercel.com/support)

---

**Last Updated**: January 2025
**Version**: 1.0.0
