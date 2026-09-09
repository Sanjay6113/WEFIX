# WeFix website report

Date: 9 September 2026

## Overall assessment

WeFix has a solid foundation for a marketing website that generates WhatsApp enquiries for custom PCs and hardware repairs. Its repair tracking, booking, payment, and database workflows are not yet a complete operational platform. The most important next step is to make the advertised functionality match what customers can actually use.

Scope: review of the project in `D:\wefix`, source code, local assets, lint, TypeScript, and production build. No deployed URL was supplied. Visual rendering, mobile interactions, live WhatsApp delivery, search rankings, real database permissions, and field performance were not tested. This is not a penetration test or dependency vulnerability audit.

## Features and implementation status

| Area | Present implementation | Assessment |
| --- | --- | --- |
| Homepage `/` | Service descriptions, repair process, comparison pricing, trust claims, consultation links | Marketing content implemented |
| PC configurator | Workload, budget, CPU preference, optional name/contact, generated WhatsApp message | Enquiry questionnaire; no parts catalogue, compatibility engine, or calculated quote |
| Repair tracker `/check-status` | Two hardcoded demo records and a five-stage progress display | Demo only; no live repair data |
| Gallery `/gallery` | 27 local images and one video, image/video lightbox, optional Drive embed | Implemented in code; browser behavior unverified |
| Consultations | WhatsApp enquiry for a Rs. 299 priority call | No scheduler, checkout, or payment confirmation |
| Database | SQL definitions for repairs, PC builds, and consultations | Starter schema; no application connection found |
| Administration | No admin routes or job management interface found | Not implemented |

## Strengths

- Clear service positioning around technical advice, PC builds, and hardware repairs.
- Repeated WhatsApp calls to action and a useful structured build enquiry message.
- Consistent dark palette, blue accents, display typography, cards, and responsive CSS breakpoints.
- Shared navigation/footer components and a small, readable TypeScript codebase.
- Next.js image components, priority loading for the hero, and static generation for the homepage and tracker.
- Gallery dialog has a label, close controls, Escape handling, and background scroll locking.

Design observations are based on source and styles, not a rendered visual inspection.

## Prioritized findings

### High: repair tracker is not live

`components/repair-tracker.tsx:8` contains all repair data in the client component. The interface labels itself “Live repair tracker” while also mentioning demo tickets. Customers cannot retrieve actual repair jobs.

Replace this with a protected server lookup and an operational job update workflow, or clearly present the page as a demonstration until ready.

### High before real customer data: lookup accepts partial phone numbers

`components/repair-tracker.tsx:33` uses `phone.endsWith(normalized)`. A local reproduction confirmed that `0` returns WF-1042 and `5` returns WF-1088. The current records are demos; this is not evidence of a real customer data breach. Shipping real records in client code or reusing this lookup for production would create a privacy problem.

Keep real records on the server and require an appropriately verified lookup. Define database access controls before connecting customer data. The supplied SQL contains no row-level security policies; deployed database configuration was not inspected.

### Medium: tracker Check button has no action

`components/repair-tracker.tsx:53` has no click handler or form submission. Results update as the user types, so the prominent button does not cause a search. Use an actual submit flow with clear validation and result feedback.

### Medium: unfinished copy and unsupported claims

`app/page.tsx:273` tells customers to use a Razorpay flow “later.” Replace this development note with the actual booking process and show the consultation price before the WhatsApp handoff.

The homepage asserts “Lowest Market Price,” “Certified Engineers,” and “48-Hour Stress Testing.” Price comparisons have no cited basis or update date. Their truth was not verified. Add business evidence and clear service conditions, or adjust the claims to what the business can substantiate.

### Medium: accessibility gaps

- Configurator and tracker inputs rely on placeholders rather than explicit labels.
- Selected configurator choices have visual styling but no `aria-pressed` or radio-group state.
- The gallery dialog does not implement focus transfer, focus trapping, or focus restoration.
- Tracker result changes have no live announcement.
- Smooth scrolling and hover motion lack a reduced-motion override.
- Gallery image descriptions are derived from filenames, including WhatsApp timestamps and generic asset names.

Add semantic labels and selection state, complete dialog keyboard handling, and use descriptive media text. Keyboard, screen-reader, and contrast testing remain necessary.

### Medium: SEO and customer confidence are incomplete

The app provides one shared title and description. No page-specific metadata, canonical URLs, social preview metadata, sitemap, robots file, or LocalBusiness structured data was found.

The visible pages also lack a business address, opening hours, map/directions, customer testimonials, and clear warranty/service terms. Add accurate business details and privacy information appropriate to the enquiry flow.

### Low: performance and maintenance opportunities

- The hero source PNG is approximately 1.63 MB. Next.js optimizes delivery, so this is not a measured browser transfer size. Inspect delivered image sizes and loading performance before deciding on further compression.
- Gallery rendering is forced dynamic and synchronously reads its directory on each request. Consider a build-time media manifest or caching if frequent filesystem discovery is unnecessary.
- Gallery filesystem errors are silently turned into an empty gallery, which can hide deployment problems.
- WhatsApp URL construction is duplicated between the configurator and shared helper.
- SQL defaults repairs to `Received`, which the tracker status list does not include. `updated_at` also has no automatic update trigger in the supplied schema.
- The stylesheet contains older gallery selectors alongside the current gallery implementation; pruning unused rules would simplify maintenance.

## Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed; no warnings or errors |
| `npx tsc --noEmit` | Passed |
| `npm run build` | Passed using installed Next.js 14.2.35 |
| Tracker lookup reproduction | Confirmed one-digit suffix matches |
| Browser/mobile testing | Not performed |
| Lighthouse/Core Web Vitals | Not measured |
| Live integrations and deployment | Not verified |

The first build attempt could not spawn workers inside the sandbox (`EPERM`); the permitted retry completed successfully. Build output reports approximately 104 kB first-load JavaScript for `/` and 103 kB for each of `/gallery` and `/check-status`. These are build metrics, not real-world speed measurements.

## Recommended work order

1. Correct the live-tracker claim, partial-phone lookup, inert Check button, and unfinished booking copy.
2. Add verified business details, service conditions, input labels, selection semantics, and gallery focus handling.
3. Implement protected repair storage and staff updates if live tracking is required; add booking/payment processing only when the business workflow is defined.
4. Add page metadata and search discovery files, then test mobile layouts, keyboard navigation, image delivery, and deployed performance.

No application source code was changed during this review.
