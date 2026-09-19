# Private training dashboard setup

The public `/training/` page remains public. The `/training/dashboard/` page can become a private, cloud-synced log without putting private entries, OpenAI keys, or database credentials in GitHub.

## What is protected

- Each workout belongs to its authenticated user ID.
- Supabase Row Level Security prevents one account from reading, editing, or deleting another account's rows.
- A public Supabase publishable key is allowed in `assets/js/training-cloud-config.js`; it cannot bypass the database rules.
- The OpenAI key is stored only as a Supabase Edge Function secret. It must never be copied into this repository, a browser script, or GitHub Actions.
- Face ID is implemented as a device passkey through Apple WebAuthn. There is no homemade PIN, which is safer than maintaining another password.

## First-time setup

1. Create a Supabase project on its free tier and open **SQL Editor**.
2. Run [`supabase/schema.sql`](../supabase/schema.sql).
3. In **Authentication → URL Configuration**, add your production URL and `http://127.0.0.1:4000` as redirect URLs.
4. Copy the project URL and **publishable/anon** key into `assets/js/training-cloud-config.js`. Commiting this public key is safe; do not use a service-role key.
5. Deploy the site. Open the dashboard, sign in once through the email link, then choose **Enable Face ID / passkey**. Apple will handle the Face ID or device-passcode prompt.
6. Set up the optional coach only after the logger is working:
   - deploy `supabase/functions/training-coach`;
   - set `OPENAI_API_KEY` and `OPENAI_MODEL` as Supabase Edge Function secrets;
   - set an OpenAI project budget and rate limits before using it.

## Privacy boundaries

A static website cannot hide the fact that a dashboard page exists. Authentication protects the actual workout data, cloud sync, and coach endpoint. The public workout template and plan remain readable by design. GitHub is source control, not a database and not the place to store workout data or API keys.

## Before publishing

- Test sign-in and passkey enrollment on your actual production domain; passkeys use the domain as their security boundary.
- Keep the repository private if you want the source private, but do not rely on a private repository alone to secure a deployed static page.
- Export a dashboard backup occasionally. The dashboard continues to retain an offline browser copy for resilience.
