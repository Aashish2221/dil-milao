# Dil Milao - Setup Guide

## What You Have Built

A complete Indian dating web app with:
- Landing page
- User signup / login
- Profile setup (3 steps)
- Discover page (browse & like profiles)
- Matches page
- Chat / messaging
- Premium subscription page
- Profile page

---

## Step 1: Set Up Supabase (Free Database)

1. Go to **https://supabase.com** and create a free account
2. Click **"New Project"**
3. Give it a name (e.g., "dil-milao") and set a database password
4. Wait ~2 minutes for it to be ready

### Run the Database Schema

1. In your Supabase project, click **"SQL Editor"** on the left
2. Open the file `supabase-schema.sql` in your project folder
3. Copy all the content and paste it into the SQL Editor
4. Click **"Run"**

---

## Step 2: Add Your Supabase Keys

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** and **anon/public key**
3. Open `.env.local` in your project and replace:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3: Run the App Locally

```bash
cd dil-milao
npm run dev
```

Open **http://localhost:3000** in your browser!

---

## Step 4: Deploy Free on Vercel

1. Go to **https://vercel.com** and sign up free
2. Connect your GitHub account
3. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/dil-milao.git
   git push -u origin main
   ```
4. In Vercel, click **"New Project"** → import from GitHub
5. Add your environment variables (same as `.env.local`)
6. Click **Deploy**!

Your app will be live at `https://dil-milao.vercel.app` (or similar) — **for free!**

---

## How to Make Money

### Option 1: Razorpay (Indian Payments)
1. Sign up at **https://razorpay.com** (free)
2. Get your API keys
3. Add payment buttons on the Premium page
4. Accept UPI, cards, net banking

### Option 2: Subscription Plans
- Free: 10 likes/day
- Gold ₹199/month: Unlimited likes, see who liked you
- Platinum ₹399/month: All Gold + boosts + priority support

### Option 3: Profile Boosts
- Sell individual boosts at ₹49–₹99 each

---

## File Structure

```
dil-milao/
├── app/
│   ├── page.tsx          ← Landing page
│   ├── login/page.tsx    ← Login
│   ├── signup/page.tsx   ← Signup
│   ├── setup/page.tsx    ← Profile setup
│   ├── discover/page.tsx ← Browse profiles + like
│   ├── matches/page.tsx  ← Your matches
│   ├── chat/page.tsx     ← Chat list
│   ├── chat/[id]/page.tsx← Individual chat
│   ├── premium/page.tsx  ← Subscription page
│   └── profile/page.tsx  ← Your profile
├── components/
│   └── Navbar.tsx        ← Navigation bar
├── lib/
│   └── supabase.ts       ← Database client
├── supabase-schema.sql   ← Database tables
└── .env.local            ← Your secret keys
```

---

## Need Help?

The app is ready to run! Just follow the steps above.
- Total cost: **₹0** to start
- Monthly cost (when you have users): Supabase free tier supports 50,000 users
