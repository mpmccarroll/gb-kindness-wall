# GB Kindness Wall — Setup Guide

## What You're Deploying

A digital Kindness Wall for Gardner Bullis Elementary. Three pages:

- **/** — Submission form (what kids use during the 10-minute block)
- **/wall** — Display wall with tabs for each grade, school staff, and parents
- **/admin** — Password-protected moderation dashboard for you

## Step-by-Step Setup (15 minutes)

### 1. Create a Supabase Project (Free)

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login works)
2. Click **New Project**
3. Name it `gb-kindness-wall`
4. Set a database password (save it somewhere)
5. Choose region: **West US** (closest to California)
6. Click **Create new project** — wait ~2 minutes for it to spin up

### 2. Create the Database Table

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql` and paste it in
4. Click **Run** — you should see "Success"

### 3. Get Your API Keys

1. In Supabase, go to **Settings** → **API** (left sidebar)
2. Copy these three values:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (click "Reveal" — keep this secret!)

### 4. Push to GitHub

1. Create a new repository on GitHub (can be private)
2. Push this folder:
   ```
   cd gb-kindness-wall
   git init
   git add .
   git commit -m "Initial commit: GB Kindness Wall"
   git remote add origin https://github.com/YOUR-USERNAME/gb-kindness-wall.git
   git push -u origin main
   ```

### 5. Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New Project**
3. Import your `gb-kindness-wall` repository
4. Before clicking Deploy, click **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
   | `ADMIN_PASSWORD` | Pick a password for the admin page |

5. Click **Deploy** — takes about 60 seconds
6. You'll get a URL like `gb-kindness-wall.vercel.app`

### 6. (Optional) Custom Domain

If you want a cleaner URL, you can add a custom domain in Vercel's project settings under **Domains**.

## Day-Of Checklist

- [ ] Open the admin dashboard (`/admin`) on your phone and log in
- [ ] Share the submission URL with teachers (the root URL `/`)
- [ ] Project the wall page (`/wall`) on a screen in the cafeteria or hallway
- [ ] During the 10-minute block, watch the admin dashboard for any flagged messages
- [ ] After the event, the wall stays live — share the link with parents!

## How Moderation Works

Messages go through two filters before appearing:

1. **Profanity filter** — catches bad words, leetspeak tricks (like `$h!t`), and spaced-out letters (like `f u c k`). These are silently rejected with a friendly "try again" message.

2. **Negativity detector** — catches mean language, insults, sarcasm patterns, and threats. These are held in the **pending** queue for you to approve or reject in the admin dashboard.

Clean, positive messages are posted to the wall immediately.

## Architecture

- **Frontend**: Next.js 14 with React, styled with Tailwind CSS
- **Backend**: Next.js API routes (serverless functions on Vercel)
- **Database**: Supabase (managed PostgreSQL)
- **Hosting**: Vercel (free tier)
- **Cost**: $0
