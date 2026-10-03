# Deploying Hana Burka (GitHub + Vercel)

A step-by-step guide to get this project live. Follow it in order —
skipping the environment variables step is the single most common way
this fails on a first attempt.

---

## 1. Run the database migration

Your Supabase project needs migration `0011` applied — it's the only one
not yet run against your live database.

1. Open your Supabase dashboard → **SQL Editor**
2. Paste the contents of `supabase/migrations/0011_admin_login_rate_limit.sql`
3. Run it

If you're not certain migrations `0001`–`0010` were all applied already,
run them too, in numeric order. They're all safe to re-run (they use
`if not exists` throughout), so running an already-applied one does
nothing harmful.

---

## 2. Push the code to GitHub

From the unzipped project folder:

```bash
git init
git add .
git commit -m "Deploy-ready"
```

Create a new, **empty** repository on GitHub (don't let it initialize a
README — that just creates a merge conflict with your first push), then:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

A `.gitignore` is already in place, so `node_modules`, `.next`, and any
`.env*` file are automatically excluded — your secret keys won't end up
in the repo.

---

## 3. Import the repo into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Select the GitHub repo you just pushed
3. Vercel auto-detects Next.js and fills in the build command — leave it as-is

Don't click Deploy yet — do step 4 first, or the first build will fail.

---

## 4. Add every environment variable

In the Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret) |
| `RAZORPAY_KEY_ID` | Razorpay dashboard → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard → API Keys |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Your WhatsApp business number, digits only, country code no `+` (e.g. `919876543210`) |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Your Instagram profile URL |

Optional — leave both blank to skip CAPTCHA on admin login entirely (it
still works fine without them):

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) |
| `TURNSTILE_SECRET_KEY` | Same place |

Also optional, only needed for the admin "Generate with AI" product
description feature:

| Variable | Where to get it |
|---|---|
| `OPENAI_API_KEY` | platform.openai.com |

---

## 5. Deploy

Click **Deploy**. You'll get a URL like `your-project.vercel.app`, or
your own domain if you attach one under Vercel → **Settings** → **Domains**.

---

## 6. Update the hardcoded domain

Four files currently use `"https://hanaburka.com"` as a placeholder for
SEO metadata (canonical URLs, sitemap, robots.txt):

- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/(shop)/product/[slug]/page.tsx`

Replace that string with your real deployed URL in all four, then:

```bash
git add .
git commit -m "Update site URL"
git push
```

Vercel redeploys automatically on every push to `main`.

---

## 7. Do a real click-through

This is the important one. Everything in this project has been
typechecked and lint-checked, but **none of it has been tested in an
actual browser** — that only becomes possible once it's actually live
somewhere.

Check, in order:
- [ ] Homepage loads, hero section shows (or shows the "add a photo"
      placeholder if none uploaded yet)
- [ ] Add a product to the cart, open the cart drawer
- [ ] Place a full test order through checkout
- [ ] Sign into `/admin` with an admin account
- [ ] Check Admin → Homepage to upload a real hero image if you haven't yet

If anything looks or behaves wrong at any point, a screenshot of exactly
what you see is the fastest way to get it fixed.
