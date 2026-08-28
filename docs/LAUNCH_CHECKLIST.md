# Launch Checklist

## Product and content

- [ ] Confirm company legal name, business address, phone, and monitored inquiry email.
- [ ] Approve all public service descriptions, pricing, membership scope, and labor disclosure.
- [ ] Confirm service-area wording and any geographic exclusions.
- [ ] Add final privacy policy, terms, accessibility contact, and required Utah business disclosures.
- [ ] Approve the inquiry success message and response-time expectation.

## Supabase

- [ ] Create a new APRISM project; do not connect CackleMap.
- [ ] Apply all committed migrations to a preview environment.
- [ ] Run `supabase db advisors` and resolve security/performance findings.
- [ ] Run `supabase test db` and confirm the RLS contract tests pass.
- [ ] Test allow/deny behavior with two real Auth users assigned to different properties.
- [ ] Confirm no user can create, modify, or delete `property_members` through the client API.
- [ ] Configure document storage with property-member policies before uploading client files.
- [ ] Seed production only with reviewed property/client records.

## Authentication

- [ ] Set the Supabase Site URL and all allowed Vercel redirect URLs.
- [ ] Verify sign-in, token refresh, sign-out, expired-session redirect, and multi-tab behavior.
- [ ] Confirm portal routes never depend on `user_metadata` for authorization.
- [ ] Confirm only the publishable key is present in client-accessible environment variables.
- [ ] Set an appropriate JWT expiry and decide how sensitive-session revocation is handled.

## Forms and integrations

- [ ] Connect the property-assessment Server Action to the approved CRM, email, or Supabase table.
- [ ] Add server-side abuse controls, rate limiting, and bot protection.
- [ ] Confirm service requests persist and notify the assigned steward.
- [ ] Add transactional email templates and delivery monitoring if email is selected.

## Vercel and operations

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` in Preview and Production.
- [ ] Pin the Node.js version to 22 or newer.
- [ ] Run `npm ci`, `npm run lint`, and `npm run build` in CI.
- [ ] Review a Vercel Preview deployment before production promotion.
- [ ] Verify canonical URLs, sitemap, robots rules, Open Graph image, and search previews.
- [ ] Add error monitoring, uptime checks, analytics, and a privacy-consent approach.
- [ ] Configure the production domain and DNS only after sign-off.

## Browser acceptance

- [ ] Homepage at 1440px, 1024px, 768px, 390px, and 320px.
- [ ] Mobile navigation opens, links correctly, and closes after navigation.
- [ ] Memberships remain readable without horizontal overflow.
- [ ] Contact form validates required fields and displays its delivery state.
- [ ] Portal dashboard and property record work on desktop and mobile.
- [ ] Keyboard focus, color contrast, and reduced-motion behavior are acceptable.
- [ ] No console errors, hydration errors, error overlays, broken links, or unintended horizontal scroll.

## Release decision

- [ ] Product owner approves content and visual presentation.
- [ ] Security owner approves RLS test evidence.
- [ ] Operations owner approves inquiry and service-request routing.
- [ ] Production deployment is explicitly authorized.
