# Admin portal validation

Validated locally on 9 September 2026.

| Check | Result |
| --- | --- |
| Production build | Passed with Next.js 15.5.25 and React 19 |
| TypeScript | Passed |
| ESLint | Passed |
| Domain and embedded PostgreSQL tests | 18 passed |
| Desktop/mobile browser checks | 8 passed |
| Authenticated browser scenarios | 2 skipped; staging admin credentials are not configured |
| Live Supabase integration suite | Skipped; no staging project credentials are configured |
| npm dependency audit | Zero known vulnerabilities reported after updates |
| Seed command with missing credentials | Correctly exits with an explicit configuration message |

The PostgreSQL tests apply the application migration unchanged to PGlite, using minimal fixtures for Supabase-owned Auth and Storage schemas. They verify administrator and anonymous/non-admin policies, preservation of legacy records, client uniqueness, order history, issue validation, concurrent-save protection, tracking token revocation, and gallery bucket configuration.

Browser tests exercise the public enquiry flow, anonymous redirects for all admin sections, removal of the demo tracker, tracking cache/referrer/indexing headers, gallery focus handling, and horizontal layout bounds at desktop/mobile sizes. They do not substitute for signing into a configured Supabase project.

No remote migration, first-admin provisioning, real media upload, SMTP delivery, or deployment was performed because the workspace has only the existing WhatsApp environment variable. Follow [ADMIN-SETUP.md](ADMIN-SETUP.md), then run the included live integration and authenticated browser tests against staging before release.
