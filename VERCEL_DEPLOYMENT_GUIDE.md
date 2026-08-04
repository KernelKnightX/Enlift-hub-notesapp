# 🚀 Vercel Deployment Guide for Enlift Hub

This guide will walk you through deploying your Next.js application to Vercel.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (you can use GitHub login)
3. **Firebase Project** - Ensure your Firebase project is set up and configured
4. **Environment Variables Ready** - Have all your Firebase credentials ready

---

## 🎯 Step-by-Step Deployment Process

### Step 1: Prepare Your Repository

1. **Ensure all changes are committed:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

   Or if you haven't connected to GitHub yet:
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import Project to Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Git Repository:**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose your repository from the list
   - If not visible, click "Adjust GitHub App Permissions" to grant access

3. **Configure Project:**
   - **Project Name:** enlift-hub (or your preferred name)
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** ./ (leave as default)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

### Step 3: Configure Environment Variables

**IMPORTANT:** Add all environment variables before deploying!

1. **In Vercel Dashboard, expand "Environment Variables" section**

2. **Add the following variables one by one:**

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Sender ID | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | Your App ID | Production, Preview, Development |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your Measurement ID | Production, Preview, Development |
   | `NEXT_PUBLIC_APP_NAME` | The Enlift Hub | Production, Preview, Development |
   | `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app | Production (update after deployment) |
   | `NODE_ENV` | production | Production |
   | `FIREBASE_ADMIN_PROJECT_ID` | Your Firebase Project ID | Production, Preview |
   | `FIREBASE_ADMIN_CLIENT_EMAIL` | your-service-account@...gserviceaccount.com | Production, Preview |
   | `FIREBASE_ADMIN_PRIVATE_KEY` | Your private key (with \n for line breaks) | Production, Preview |

   **Tips:**
   - Copy values from your `.env.local` file
   - For `FIREBASE_ADMIN_PRIVATE_KEY`, keep the quotes and `\n` characters
   - Select all three environments (Production, Preview, Development) for most variables
   - You can update `NEXT_PUBLIC_APP_URL` after your first deployment

3. **Click "Add" after each variable**

### Step 4: Deploy

1. **Click "Deploy" button**
2. **Wait for build to complete** (usually 2-5 minutes)
3. **Check build logs** for any errors
4. **Once deployed, you'll see a success message with your live URL**

### Step 5: Update Firebase Configuration

After deployment, you need to update Firebase to allow your Vercel domain:

1. **Go to Firebase Console** → Your Project → Authentication → Settings → Authorized domains
2. **Add your Vercel domain:** `your-app.vercel.app`
3. **Also add any custom domains** if you plan to use them

### Step 6: Update Environment Variable

1. **Copy your Vercel deployment URL** (e.g., `https://your-app.vercel.app`)
2. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
3. **Update `NEXT_PUBLIC_APP_URL`** with your actual Vercel URL
4. **Redeploy** for changes to take effect

---

## ✅ Post-Deployment Verification

### Test Your Deployment:

1. **Homepage:**
   - Visit your Vercel URL
   - Verify the homepage loads correctly

2. **Authentication:**
   - Try to register a new user
   - Log in with the new account
   - Test logout functionality

3. **Protected Routes:**
   - Access `/student-desk/dashboard`
   - Verify authentication is working
   - Check that data loads correctly

4. **Admin Features:**
   - Test admin panel access (if you have admin credentials)
   - Verify admin routes are protected

5. **Notes & Features:**
   - Test notes creation
   - Test mock tests
   - Test SSB practice tools

### Check for Issues:

- Open browser console (F12) and check for errors
- Test on different browsers (Chrome, Firefox, Safari)
- Test on mobile devices
- Monitor Vercel logs for any runtime errors

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Verify all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variable not found"**
- Verify all required environment variables are added in Vercel
- Check variable names match exactly (case-sensitive)
- Redeploy after adding missing variables

### Firebase Connection Issues

**Error: "Firebase: Error (auth/invalid-api-key)"**
- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Check that the Firebase project is active
- Ensure billing is enabled if required

**Error: "Firebase: Error (auth/unauthorized-domain)"**
- Add your Vercel domain to Firebase Authorized domains
- Wait a few minutes for changes to propagate

### Runtime Errors

**Pages not loading:**
- Check Vercel function logs in dashboard
- Verify all API routes are working
- Check for CORS issues

**Firestore permission denied:**
- Deploy your firestore.rules:
  ```bash
  firebase deploy --only firestore:rules
  ```
- Verify user is authenticated before accessing data

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Vercel automatically builds and deploys**
4. **Check deployment status in Vercel dashboard**

---

## 🌐 Custom Domain (Optional)

To use your own domain:

1. **Go to Vercel Dashboard** → Your Project → Settings → Domains
2. **Add your domain** (e.g., `enlift-hub.com`)
3. **Update DNS records** as instructed by Vercel
4. **Wait for DNS propagation** (can take up to 48 hours)
5. **Update `NEXT_PUBLIC_APP_URL`** environment variable
6. **Add custom domain to Firebase Authorized domains**

---

## 📊 Monitoring & Analytics

### Vercel Analytics:
- Go to your project dashboard
- Click on "Analytics" tab
- View real-time performance metrics

### Vercel Logs:
- Click on "Deployments"
- Select a deployment
- View "Functions" logs for API routes
- Check "Build Logs" for build issues

### Firebase Analytics:
- Go to Firebase Console → Analytics
- Monitor user engagement
- Track custom events

---

## 🔐 Security Best Practices

1. **Never commit `.env.local` to Git**
   - It's already in `.gitignore`
   - Double-check before pushing

2. **Rotate API Keys Regularly**
   - Update Firebase credentials periodically
   - Update in Vercel environment variables

3. **Monitor Access Logs**
   - Check Vercel logs regularly
   - Monitor Firebase authentication logs

4. **Enable Two-Factor Authentication**
   - Enable 2FA on your Vercel account
   - Enable 2FA on your GitHub account

---

## 🆘 Getting Help

### Resources:
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)
- **Firebase Documentation:** [firebase.google.com/docs](https://firebase.google.com/docs)

### Support:
- **Vercel Support:** Available through dashboard
- **Community:** Vercel Discord, Stack Overflow
- **Firebase Support:** Firebase Console support

---

## 📝 Deployment Checklist

Use this checklist for each deployment:

- [ ] All code changes committed and pushed to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Firebase Authorized domains updated
- [ ] Build completes successfully
- [ ] Homepage loads correctly
- [ ] Authentication working
- [ ] Protected routes accessible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable (< 3s load time)
- [ ] Firestore rules deployed
- [ ] Firestore indexes built
- [ ] Team notified of deployment

---

## 🎉 Success!

Once everything is working:

1. **Share your deployment URL** with your team
2. **Monitor the first few hours** for any issues
3. **Set up monitoring** and alerts
4. **Document any custom configurations**
5. **Plan for regular updates** and maintenance

---

**Last Updated:** January 2025  
**Version:** 1.0.0

For any issues or questions, refer to the main [DEPLOYMENT.md](./DEPLOYMENT.md) file or contact your technical lead.
