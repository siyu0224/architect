# Deploying Gao Architect to Vercel with Supabase

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor** and run the migration:
   - Open `supabase/migrations/20250312000000_initial.sql` in this repo.
   - Copy its contents and run it in the SQL Editor.
   - This creates `projects` and `contact_submissions` tables and seeds placeholder projects.
3. Get your API keys: **Project Settings** → **API**:
   - **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

To view contact form submissions in Supabase: **Table Editor** → `contact_submissions`.  
To add or edit projects: **Table Editor** → `projects`.

## 2. Local env

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Run the app:

```bash
npm run dev
```

## 3. Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com) and **Add New** → **Project**.
3. Import the repo and set the **Root Directory** to `my-app` if the repo root is the parent folder.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Deploy. Vercel will run `npm run build` and deploy.

After deploy, the site will use Supabase for projects and contact submissions. If the env vars are missing, the site still runs with static project data, but the contact form will return a “not configured” error until Supabase is set up.

## Optional: custom domain

In the Vercel project: **Settings** → **Domains** → add your domain and follow the DNS instructions.
