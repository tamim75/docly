# Docly setup guide

Docly is a static web app (HTML, CSS, JS) with Supabase as the backend. You don't need a build step or a server.

- **Supabase** handles sign-in (email + 6-digit code), the database and file storage.
- **GitHub Pages** hosts the app for free at `https://tamim75.github.io/docly/`.

If `js/config.js` is left empty, the app runs in **demo mode** with sample data saved only in the browser.

---

## 1. Create the Supabase project (5 min)

1. Go to https://supabase.com and sign up with GitHub.
2. Click **New project**. Use these settings:
   - Name: `docly`
   - Database password: generate one and save it in your password manager.
   - Region: **Southeast Asia (Singapore)**, the closest to Dhaka.
3. Wait about a minute for the project to start.

## 2. Create the tables (1 min)

1. In the project, open **SQL Editor** and click **New query**.
2. Paste the full contents of `supabase/schema.sql` and click **Run**. It should finish with "Success. No rows returned".

The script creates:
- every table, with row-level security so each account sees only its own data,
- a private `records` bucket for photos and PDFs,
- the shared-summary function,
- the admin functions and the access log.

## 3. Turn on 6-digit email codes (2 min)

Supabase sends a magic link by default. Docly needs the code instead.

1. Go to **Authentication → Providers → Email**:
   - **Enable Email provider**: on
   - **Confirm email**: on
   - **Email OTP Length**: 6
   - **Email OTP Expiration**: 600 seconds (10 minutes, which matches the app copy)
2. Go to **Authentication → Email Templates**. Edit both the **Magic Link** and **Confirm signup** templates so they show the code:

   Subject: `Your Docly code: {{ .Token }}`

   ```html
   <h2>Your Docly sign-in code</h2>
   <p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
   <p>Enter this code in Docly. It expires in 10 minutes.</p>
   <p>If you didn't ask for it, you can ignore this email.</p>
   ```

> **Templates locked?** Supabase only lets you edit email templates after custom SMTP is set up (step 7). Until then it sends its default email with a **sign-in link** instead of a code. Docly accepts that link too: open it on the same device and you're signed in. Once SMTP is on, edit the templates above to switch to the 6-digit code.

## 4. Connect the app (1 min)

1. Go to **Project Settings → API Keys**, click **New publishable key**, and copy it (it starts with `sb_publishable_`). Then copy the **Project URL** from **Data API**, for example `https://abcd1234.supabase.co`.
2. Put both in `js/config.js`:

   ```js
   window.DOCLY_CONFIG = {
     supabaseUrl: 'https://abcd1234.supabase.co',
     supabaseAnonKey: 'sb_publishable_...',
   };
   ```

The publishable key is designed to be public, and the row-level security rules protect the data. **Never** put a secret key (`sb_secret_…`) or the legacy `service_role` key in the app or send it to anyone.

## 5. Make yourself an admin (1 min)

1. Open the app and sign in with your own email once.
2. In the **SQL Editor**, run this with your own email:

   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```

3. Reload the app. An **Admin** item appears in the sidebar on desktop, and under Me on mobile.

The admin page has three tabs:
- **Overview:** users, active users, visits, files, storage and sign-ups for the last 30 days.
- **Users:** every account with its counts. Click a user to see details or delete them.
- **Opening a user's records:** you must type a reason first. Each open, and each file viewed, is logged. The user sees "Docly support viewed your records" with your reason on their Me page.
- **Access log:** every admin view.

## 6. Host on GitHub Pages (2 min)

1. Push this folder to the `docly` repo, with `index.html` at the root.
2. In the repo, go to **Settings → Pages**. Set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and click Save.
3. After about a minute, the app is live at `https://tamim75.github.io/docly/`.
4. Back in Supabase, go to **Authentication → URL Configuration** and set **Site URL** to that address.

## 7. Before inviting real people

- **Email sending:** Supabase's built-in email only sends a few codes per hour. For real users, set up custom SMTP under **Authentication → Emails → SMTP Settings**. Resend's free tier (3,000 emails a month) works well, using a domain you own, such as `codes@docly.app`.
- **Privacy policy:** say what you store and where (Supabase, Singapore region). Say that Docly support can open records when needed, that every view is logged and shown to the user, and how to delete an account. Account deletion is already in the app and erases everything.
- **Backups:** the free plan has no point-in-time backups. Export the data regularly, or move to the Pro plan before you have many users.
- **Free plan pause:** free projects pause after 7 days with no activity. Open the dashboard occasionally, or upgrade once people rely on it.

## Files

| Path | What it is |
|---|---|
| `index.html` | Page shell and all styles |
| `js/app.js` | The app: screens, routing, and the data layer (Supabase or demo) |
| `js/config.js` | Your Supabase URL and anon key |
| `js/vendor/supabase.js` | supabase-js 2.118.0, bundled so the app needs no CDN |
| `supabase/schema.sql` | Tables, security rules, storage, shared summary, admin and access log |
| `test/` | Local test page with an in-memory stand-in for Supabase (not needed in production) |
