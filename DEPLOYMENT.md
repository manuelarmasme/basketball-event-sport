# 🚀 Deployment Guide - Vercel

## Prerequisites

✅ Firebase project configured  
✅ All code tested locally  
✅ Service account JSON file downloaded

---

## Step 1: Prepare Firebase Service Account

1. Download your service account JSON:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the file (you'll need its contents)

2. **IMPORTANT**: Copy the **entire JSON content** (including curly braces)

---

## Step 2: Configure Vercel Environment Variables

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**

2. Add all required variables:

#### Firebase Client SDK (Public - can be exposed)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Firebase Admin SDK (Secret - server-side only)
```
Name: FIREBASE_SERVICE_ACCOUNT_JSON
Value: {"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
```

⚠️ **CRITICAL**: Paste the **complete JSON object** as a single line

#### Other Services
```
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
GOOGLE_SHEETS_API_KEY=your_google_sheets_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

3. **Select environments** for each variable:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## Step 3: Deploy

### Option A: Deploy via Git (Recommended)

```bash
git add .
git commit -m "feat: user invitation system"
git push origin main
```

Vercel will automatically deploy on push.

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod
```

---

## Step 4: Configure Firebase Authentication

After deployment, add your Vercel domain to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Authentication** → **Settings** → **Authorized domains**
3. Click "Add domain"
4. Add: `your-app.vercel.app`
5. Also add any preview deployment domains if needed:
   - `*.vercel.app` (wildcard for all preview deployments)

---

## Step 5: Test the Deployment

1. Visit your deployed app: `https://your-app.vercel.app`
2. Test user invitation flow:
   - Go to `/users`
   - Create an invitation
   - Check email delivery
   - Test invitation acceptance
   - Verify custom claims are set

---

## Troubleshooting

### ❌ Firebase Admin SDK Error

**Problem**: `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON`

**Solution**:
- Verify you pasted the **complete JSON** (starts with `{` and ends with `}`)
- Check for any line breaks or formatting issues
- Re-copy from the original `google-admin.json` file

---

### ❌ Authentication Domain Not Authorized

**Problem**: Google Sign-In fails with "unauthorized domain"

**Solution**:
- Add your Vercel domain to Firebase Authorized Domains (see Step 4)
- Wait a few minutes for DNS propagation

---

### ❌ Environment Variables Not Loading

**Problem**: App can't access environment variables

**Solution**:
- Verify variables are set for the correct environment (Production/Preview)
- Redeploy after adding/updating environment variables
- Check variable names match exactly (case-sensitive)

---

## Environment Variable Checklist

Before deployment, verify you have:

- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` (complete JSON)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] `NEXT_PUBLIC_POSTHOG_HOST`
- [ ] `GOOGLE_SHEETS_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

---

## Security Best Practices

✅ Never commit `google-admin.json` to git (it's in `.gitignore`)  
✅ Use environment variables for all secrets  
✅ Rotate service account keys periodically  
✅ Monitor Firebase usage and logs  
✅ Set up Firestore security rules  
✅ Enable Firebase App Check for production  

---

## Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
