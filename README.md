# ETHIO Foods website

Storefront and order-request system for **ETHIO**, the packaged-food brand of **B&E Wholesale LLC** (Sterling, Virginia).
Customers browse products, build an inquiry list and send an order request or wholesale inquiry. There is no online
payment: the team confirms price, stock and delivery directly. A secure dashboard lets the owner manage products,
photos, requests and site text.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui-style components · Lucide ·
Motion for React · Supabase (Postgres, Auth, Storage) · Resend · Vercel.

---

## What's included

| Area | Where |
| --- | --- |
| Home (grain-pour hero, featured products, categories, story, wholesale, contact) | `src/app/(site)/page.tsx`, `src/components/site/Hero.tsx` |
| Catalog with search and category filters | `src/app/(site)/products`, `src/components/site/Catalog.tsx` |
| Product pages (gallery + zoom, size, quantity, buyer type, JSON-LD) | `src/app/(site)/products/[slug]` |
| Inquiry list (stored in the visitor's browser) + drawer | `src/components/site/store.ts`, `CartDrawer.tsx`, `/inquiry` |
| Order request → reference number → confirmation | `/order`, `/order/confirmation`, `POST /api/inquiries` |
| Wholesale inquiry | `/wholesale`, `POST /api/wholesale` |
| Contact form | `/contact`, `POST /api/contact` |
| About, FAQ, Privacy (draft), Terms (draft) | `src/app/(site)/*` |
| Admin dashboard | `/admin` — overview, order requests, wholesale, messages, products + photo upload, categories, website content, activity log, CSV export |
| Database schema, RLS, storage bucket | `supabase/migrations/20261027000001_initial_schema.sql` |
| Starter catalog | `supabase/seed.sql` |
| SEO | metadata + Open Graph on every page, `sitemap.xml`, `robots.txt`, Organization / Product / FAQ structured data |

### Honesty rules built in
- Images are labeled **Actual package** or **Package concept** everywhere they appear (admin sets this per photo).
- No prices, nutrition values, certifications or country of origin are shown. Ingredients and nutrition stay hidden
  until the owner enters verified values. Net weight and UPC come from the real package labels.
- The ® symbol is not used anywhere in the site's own text or logo files.
- Every form states that a request is not a confirmed order or price.

> The supplied **concept** package images (`fava-concept`, `lentils-concept`, `flax-concept-*`) show a ® mark printed
> inside the artwork. Replace them with real photos (or edited artwork) once registration is confirmed or ruled out.

---

## Security

- **Row Level Security on every table.** Visitors can read only the active catalog and public site text. Order
  requests, wholesale inquiries, messages, profiles and the audit log are readable only by signed-in admins/editors.
  `supabase/tests/rls-test.mjs` checks 33 of these rules against a real Postgres.
- **Public forms never touch the database directly.** Route handlers validate with Zod, then insert with the
  service-role key, which exists only on the server.
- **Spam and abuse:** hidden honeypot field, per-IP rate limit (5 submissions / 10 min, shared across serverless
  instances via a Postgres function), JSON-only bodies with a 32 KB cap. IPs are stored only as salted hashes.
- **CSRF:** API routes require a same-origin `Origin`/`Referer`; admin changes use Server Actions (built-in origin
  check) and every action re-verifies the admin session and role on the server.
- **Admin auth:** Supabase Auth (email + password). Middleware refreshes sessions; pages call `getUser()` (verified
  with the auth server, not just the cookie) and check `role in ('admin','editor')`. Only `admin` can delete products
  or change roles; a database trigger blocks role changes by anyone else.
- **Uploads:** images only (JPEG/PNG/WebP/AVIF), 5 MB max, type detected from file bytes (not the browser's claim),
  random file names, bucket-level size/type limits.
- **CSV export** neutralizes spreadsheet formulas (`=`, `+`, `-`, `@`).
- Security headers: HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer, permissions policy. Admin responses
  are `no-store` and `noindex`.

---

## Local development

```bash
npm ci
cp .env.example .env.local     # fill in what you have; the site runs without Supabase
npm run dev                    # http://localhost:3000
```

Without Supabase the site uses the built-in starter catalog and forms run in demo mode (they return a reference
number but store nothing). The dashboard needs Supabase.

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # unit tests (validation, references, cart, CSV, security, upload sniffing)
npm run build       # production build
npm run check       # all of the above
```

Database rules test (needs an **empty, throwaway** Postgres — never your real project):

```bash
PGTEST_URL=postgres://postgres:postgres@localhost:5432/postgres npm run test:db
```

---

## Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier is fine to start).
2. **SQL editor →** run `supabase/migrations/20261027000001_initial_schema.sql`, then `supabase/seed.sql`, then
   `supabase/migrations/20261027000002_amharic_fields.sql` (adds Amharic product and category names).
   (Or with the Supabase CLI: `supabase link` then `supabase db push`, then run the seed.)
3. **Authentication → Providers → Email:** keep email/password on. Turn **off** "Allow new users to sign up" so only
   people you invite can create accounts.
4. **Authentication → Users → Add user:** create the owner's login (auto-confirm).
5. Open `supabase/bootstrap-admin.sql`, put the owner's email in, run it. That account can now sign in at `/admin`.
6. **Project Settings → API:** copy the URL, `anon` key and `service_role` key into your environment variables.

## Setting up email (Resend)

1. Create a Resend account and an API key.
2. Until you own a domain, Resend sends only to your own account email from `onboarding@resend.dev` — fine for
   testing admin notifications, but customer acknowledgments won't reach customers.
3. Once you have a domain, verify it in Resend and set `RESEND_FROM_EMAIL` to an address on it.
4. Set `ADMIN_NOTIFICATION_EMAIL` to the inbox that should receive new requests.

If `RESEND_API_KEY` is empty, submissions are still saved; emails are skipped and logged.

---

## Deploying to Vercel (preview first)

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repo. Framework is detected as Next.js.
3. Add the environment variables from `.env.example` (leave `NEXT_PUBLIC_SITE_URL` empty for now — the
   `*.vercel.app` URL is used automatically). Generate `IP_HASH_SALT` with `openssl rand -hex 32`.
4. Deploy. You get a free `your-project.vercel.app` address. Preview deployments are kept out of search engines
   automatically (`robots.txt` disallows all on `VERCEL_ENV=preview`).
5. When you buy a domain: add it in Vercel → Domains, set `NEXT_PUBLIC_SITE_URL=https://your-domain.com`, verify the
   domain in Resend, update `RESEND_FROM_EMAIL`, and redeploy.

Nothing here buys services or deploys to production on its own.

---

## Managing the site

- **Products:** `/admin/products` — edit text, Amharic name, package size, UPC, "good for" tags, ingredients (only
  once verified), visibility and homepage featuring. Upload photos and mark each as actual or concept. The first
  photo is used on cards.
- **Requests:** `/admin/inquiries`, `/admin/wholesale`, `/admin/messages` — filter by status, search, open a record,
  change status and keep internal notes. **Export CSV** on each list.
- **Website content:** `/admin/settings` — public email/phone/hours, announcement bar, homepage intro, story text.
- **Activity log:** every dashboard change with who and when.

Catalog and content changes appear on the public site within about five minutes (pages revalidate every 5 min, and
saving in the dashboard triggers an immediate refresh).

### English / Amharic
- Visitors switch language with the **EN / አማ** control in the header; the choice is remembered in their browser.
- Interface text lives in `src/lib/i18n.ts`. Both languages are rendered and CSS shows one, so pages stay static and
  never flash the wrong language. Amharic was drafted for review: have a native speaker check it before launch.
- Product and category names, short descriptions and "good for" tags have Amharic fields in the dashboard.
  Homepage introduction and story text have Amharic fields under **Website content**.
- Privacy and Terms are English only and say so in Amharic.

### Dark mode, sound and motion
- The sun/moon button switches themes (defaults to the visitor's system setting). The admin dashboard stays light.
- Adding to the inquiry list plays a short synthesized grain rattle and a light vibration on phones. Visitors can
  turn sounds off in the footer.
- All animation respects the visitor's "reduce motion" setting.

### Adding nutrition facts later
Nutrition is stored as JSON on `products.nutrition` and shown only when `nutrition_verified = true`. Example:

```sql
update products set nutrition_verified = true, nutrition = '{
  "servingSize": "1/4 cup (42g)", "calories": 150,
  "rows": [{"label":"Total Fat","amount":"0.5g","dailyValue":"1%"}]
}' where slug = 'red-lentils';
```

---

## Project layout

```
src/
  app/
    (site)/            public pages (layout adds header, footer, inquiry drawer)
    admin/             login + dashboard (route group (panel) is auth-protected)
    api/               inquiries, wholesale, contact endpoints
  components/
    site/              storefront components (Hero, Catalog, forms, drawer, grain renderer)
    admin/             dashboard forms
    ui/                shadcn-style primitives
  lib/                 validation, catalog loader, auth, security, email, CSV, references
  middleware.ts        Supabase session refresh for /admin
supabase/
  migrations/          schema + RLS + storage
  seed.sql             starter catalog
  bootstrap-admin.sql  make the first admin
  tests/rls-test.mjs   database security test
public/images/         product photos, logo variants, packaging pattern
tests/                 unit tests
```

## Open items for the business
- Public email, phone and hours (add in **Website content**).
- Real photos of Split Fava Beans, Bulgur Wheat and Beans; package sizes and varieties for Bulgur and Beans.
- Verified ingredients and nutrition facts for each product.
- Whether the ETHIO mark is registered (the concept artwork shows ®).
- A domain name, then Resend domain verification.
- Legal review of the Privacy and Terms drafts.
