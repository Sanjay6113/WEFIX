# WeFix admin setup

The public website needs no customer accounts. `/admin` is for staff; `/check-status/[token]` is a private customer order link. The portal uses Supabase Auth, Postgres, and Storage. This application requires a Next.js server deployment, not a static export. Use Node.js 22 or 24 LTS.

## 1. Connect Supabase

Create a Supabase project or use a dedicated existing project. Keep database backups before running migrations. Add the values from `.env.example` to `.env.local` and to the deployment environment:

| Variable                               | Purpose                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL                                                                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key; legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works               |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only service-role key for private tracking and local seed tooling         |
| `NEXT_PUBLIC_SITE_URL`                 | Canonical website origin, e.g. `https://wefix.example`; no trailing slash        |
| `NEXT_PUBLIC_WEFIX_WHATSAPP`           | Initial/default business number; database setting takes precedence after seeding |
| `NEXT_PUBLIC_GALLERY_DRIVE_LINK`       | Optional existing public Drive folder                                            |

Never place the service-role key in a `NEXT_PUBLIC_` variable or commit credentials. Restart/rebuild after changing public environment variables. Without public Supabase configuration the marketing site retains built-in content and `/admin/login` explains that setup is required. With missing service-role credentials, admin screens show a tracking-configuration notice and private tracking remains unavailable.

## 2. Apply the migration and seed

Run `supabase/migrations/202609090001_admin_portal.sql` once in the Supabase SQL editor, or apply it using your usual Supabase CLI migration workflow. This adds new tables, access policies, history triggers, and the two public gallery buckets. It does not modify or import the legacy `repairs`, `pc_builds`, or `consultations` tables from `supabase/schema.sql`.

Then, from the project directory:

```sh
npm install
npm run db:seed
```

The seed initializes prices, three budget bands, consultation fee, messages, and references to files in `public/gallery`. Existing rows and administrator changes are preserved on repeat runs. Run it again when adding more local gallery files. Keep these files in deployments; their database entries point at website-relative URLs. New browser uploads go to Supabase Storage.

Bucket limits are enforced by Storage: `wefix-images` allows JPEG/PNG/WebP/GIF/AVIF up to 10 MB; `wefix-videos` allows MP4/WebM up to 50 MB. Upload paths are scoped to the admin’s user ID. Hiding media removes its listing, but previously shared public asset URLs remain accessible; do not upload private customer documents to this gallery.

If the database is configured but public content reads fail, the site logs an error and temporarily uses built-in marketing content. Gallery read failures show no managed entries rather than republishing hidden local files. Resolve seed/migration or connectivity issues before opening the portal to staff.

## 3. Provision the first admin

In Supabase Authentication → Users, manually create the staff account with an email and a strong password. Confirm the account. Copy its user UUID, then run:

```sql
insert into public.admin_members(user_id)
values ('REPLACE_WITH_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

Disable public signups in Supabase Authentication settings. There is no website signup screen. Further admins are provisioned using the same process. Removing their `admin_members` row immediately removes their access to application data and uploads. Admin membership is never inferred from editable user metadata.

Visit `/admin/login` and sign in. Every page and mutation verifies the user and membership; database policies also enforce membership on direct API calls. Browser sessions use Supabase SSR cookies and middleware refresh. Authenticated pages and private tracking use no-store responses.

## 4. Configure password recovery

Set Supabase Auth’s Site URL to the website origin. Allow the exact callback URL `https://YOUR_SITE/auth/callback` (and `http://localhost:3000/auth/callback` for local work). Configure SMTP for reliable production delivery.

The standard recovery email flow uses the configured callback and PKCE code exchange. For reset emails that work across browsers/devices, set the recovery email template’s link to:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}"
  >Reset password</a
>
```

The callback verifies a recovery token, then opens `/admin/reset-password`. Only a verified admin can update a password. New passwords require 12–128 characters and confirmation. After resetting, the user signs in again. Invalid/expired links return to login with an explanation. Verify delivery and expiry on the configured project before launch; email delivery cannot be tested without Supabase and SMTP configuration.

## 5. Everyday workflow

1. Open Clients, search by name/phone/email, and create or edit a client. Ten-digit phone numbers are treated as Indian numbers; international numbers include country code. Duplicate normalized numbers are rejected with a prompt to use the existing client.
2. Create an order from that client. Record device/build, requested work, optional quote/date, customer-facing update, and separate internal notes. New orders start as **Not started**.
3. Move to **In process**, **Complete**, or **Failed/issue**. An issue needs a customer-facing explanation. Orders can be reopened. Changes and their history are committed together; stale edit forms cannot overwrite newer order saves.
4. Copy the private tracking link or open “Message client on WhatsApp.” WhatsApp opens a prepared message for manual sending. Regenerating the link revokes its predecessor. Anyone with the link can see its permitted order details, so share it only with that client.
5. Use Pricing for repair rows, budget bands, and consultation fee; Gallery for uploads and visibility; WhatsApp for the business number and message templates. Successful saves refresh public content. There is no payment checkout or automatic WhatsApp sending.

## 6. Validation and release

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm test` runs validation tests and the unchanged application migration against embedded PostgreSQL (PGlite), with minimal test fixtures for Supabase-owned Auth/Storage schemas. It verifies RLS, status/history atomicity, duplicate phones, token replacement, optimistic concurrency, and bucket configuration. It does not emulate Supabase Auth email delivery or the Storage HTTP service.

Browser tests start the production build on `127.0.0.1:3100`, or use `TEST_SITE_URL`. They check public navigation, responsive layouts, anonymous admin redirects, tracking privacy headers, and gallery keyboard behavior. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an existing compatible Chromium executable if necessary. `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` enable the authenticated navigation/validation/logout browser scenario. Use a dedicated staging admin.

To run real backend integration tests, create a **dedicated staging project**, apply the migration, and seed it. Create an ignored `.env.test`:

```dotenv
WEFIX_RUN_INTEGRATION=1
TEST_SUPABASE_URL=https://STAGING_PROJECT.supabase.co
TEST_SUPABASE_PUBLIC_KEY=STAGING_PUBLIC_KEY
TEST_SUPABASE_SERVICE_ROLE_KEY=STAGING_SERVICE_ROLE_KEY
# Optional: a running website configured against the SAME staging project:
TEST_SITE_URL=http://localhost:3000
```

Run `npm run test:integration`. It creates temporary admin/non-admin users, clients, orders, content, and an image upload; it removes those records afterward. Do not run against production. Without explicit staging configuration this suite reports a skip. Run the browser checks with `.env.test` values exported in your shell when needed.

Before release, verify recovery email delivery, an expired session, a successful gallery image/video upload, edited prices/messages on the public site, all four order statuses, and a regenerated tracking link against the connected project. Inspect deployment logs for content, auth, or Storage failures. Tracking logs intentionally exclude tokens and customer details. Keep the service-role key out of client bundles and analytics; avoid third-party analytics on tracking URLs.

The project was upgraded from Next.js 14 to the patched Next.js 15 line with React 19 for the new authenticated/server-action surfaces. PostCSS is overridden to a patched 8.x release. Re-run `npm audit` when changing dependencies.

## References

- [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js 15 migration guidance](https://nextjs.org/docs/app/guides/upgrading/version-15)
