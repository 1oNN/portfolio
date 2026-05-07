# Changelog

## Version 1.0.0 — 2026-04-26

Full security audit and hardening pass. All 34 identified issues resolved.

---

### Security — Critical

**[FIX] Remove ADMIN_PASSWORD from next.config.js env block**
- `next.config.js` — removed `env: { ADMIN_PASSWORD }`. Server-side env vars work without this block; including it exposed the secret to the client JS bundle.

**[FIX] Replace btoa-based auth with HMAC-SHA256 session tokens**
- Created `lib/auth.ts` — `createAdminToken()` signs a session token using `HMAC-SHA256(SESSION_SECRET, "admin-v1")`. Verification uses `crypto.timingSafeEqual` to prevent timing attacks.
- `middleware.ts` — rewrote to use Web Crypto API (`crypto.subtle`) for HMAC verification in Edge Runtime. Removed `btoa` and the `"admin123"` default fallback.
- `app/api/admin/login/route.ts` — replaced btoa token generation with `createAdminToken()`. Added timing-safe password verification via `verifyPassword()`.
- `app/api/blog/route.ts` — removed inline `isAdmin()` using btoa; now imports `isAdmin` from `lib/auth`.
- `app/api/blog/[id]/route.ts` — same as above.

**[FIX] Remove "admin123" fallback password**
- All four locations that had `process.env.ADMIN_PASSWORD ?? "admin123"` now throw a server error if `ADMIN_PASSWORD` or `SESSION_SECRET` are unset. No insecure defaults.

**[FIX] Rate limit admin login (5 attempts / 15 min / IP)**
- `app/api/admin/login/route.ts` — added in-memory rate limiter returning 429 after 5 failed attempts per IP per 15-minute window.

**[FIX] Rate limit contact endpoint (5 messages / hour / IP)**
- `app/api/contact/route.ts` — added equivalent in-memory rate limiter.

**[FIX] XSS in markdown rendering**
- `lib/markdown.ts` — complete rewrite. Code blocks and inline code are extracted with placeholders before any transformation. The remaining input is fully HTML-escaped via `escapeHtml()` before markdown rules run. Link hrefs are validated against `^(https?://|mailto:)`. This eliminates the XSS vector in blog post rendering and admin preview.

**[FIX] XSS in SES email body (email field)**
- `app/api/contact/route.ts` line 141 — `${email}` was not sanitized before HTML insertion. Changed to `${safeEmail}` using the existing `sanitize()` function.

**[FIX] Remove PII from server logs**
- `app/api/contact/route.ts` — removed `console.info` that logged `name`, `email`, `subject` when AWS was not configured.

**[FIX] Security headers — CSP, HSTS, COOP, CORP**
- `next.config.js` — added:
  - `Content-Security-Policy` with locked-down directives
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
  - Removed deprecated `X-XSS-Protection: 1; mode=block`

---

### Security — Dependencies

**[FIX] Remove vulnerable and unused dependencies**
- `package.json` — removed `nodemailer` (high severity, 4 CVEs, unused since switch to AWS SES), `@types/nodemailer`, `@anthropic-ai/sdk` (installed but never imported anywhere).

**[FIX] Fix uuid version**
- Changed `"uuid": "^13.0.0"` → `"uuid": "^11.0.0"` (v13 does not exist; v11 is current stable with built-in TypeScript declarations).
- Removed `@types/uuid` (bundled in uuid v11+).

**[FIX] Allow Next.js patch updates**
- Changed `"next": "15.3.0"` → `"^15.3.0"` so `npm install` picks up security patches within 15.x.

> **ACTION REQUIRED:** Run `npm install` after these dependency changes.
> **ACTION REQUIRED:** Rotate the GROQ API key in `.env.local` — it was present in the working directory. Generate a new key at console.groq.com and update Amplify environment variables.
> **ACTION REQUIRED:** Add `SESSION_SECRET` (min 32 random chars) to `.env.local` and Amplify Console.

---

### High Priority — Broken / Dead Code

**[FIX] Remove useless loading screen**
- `app/page.tsx` — `const [loaded] = useState(true)` caused the loading animation to render for 0ms (immediately `done`). Removed `LoadingScreen` component and `loaded` state entirely. Page now fades in directly via Framer Motion.

**[FIX] Delete dead components**
- `components/interactive/CustomCursor.tsx` — deleted (never imported anywhere).
- `components/ui/ProjectCard.tsx` — deleted (orphaned; both `BentoProjects` and `ProjectsView` defined their own inline cards).
- `delete_me.md`, `text.md` — deleted dev artifacts.

**[FIX] blog-db.ts: production guard on filesystem fallback**
- `lib/blog-db.ts` — reads/writes now check `NODE_ENV === "production"`. In production without DynamoDB: read operations return empty (`[]` / `null`), write operations throw an explicit error. The ephemeral Lambda disk can no longer silently swallow blog posts.
- Also cached the `DynamoDBDocumentClient` instance at module scope to avoid re-creating it on every request.

**[FIX] agent/route.ts: cache DynamoDB client**
- `app/api/agent/route.ts` — moved `DynamoDBDocumentClient` construction to a module-scoped singleton to avoid repeated cold-start overhead.

---

### Medium — Quality / Features

**[FIX] Add sitemap and robots**
- `app/sitemap.ts` — dynamic sitemap including static routes + all published blog posts.
- `app/robots.ts` — disallows `/admin` and `/api`, includes sitemap URL.

**[FIX] Add 404, error boundary, loading pages**
- `app/not-found.tsx` — styled 404 page matching site design with "← Back to home" link.
- `app/error.tsx` — client error boundary with reset button.
- `app/loading.tsx` — loading skeleton with animated bar.

**[FIX] Add JSON-LD Person structured data**
- `app/layout.tsx` — added `application/ld+json` script with `schema.org/Person` markup including `jobTitle`, `alumniOf`, and `sameAs` social links.

**[FIX] Add OG image and favicon**
- `public/og-image.svg` — 1200×630 branded OG image (replace with PNG for best social card compatibility).
- `public/favicon.svg` — SVG favicon with `ha.` monogram.
- `app/layout.tsx` — updated favicon link to `favicon.svg`, OG image to `og-image.svg`.

---

### Low — Deployment / Config

**[FIX] Remove `output: "standalone"` for Amplify Hosting**
- `next.config.js` — removed `output: "standalone"`. AWS Amplify Hosting natively supports Next.js SSR App Router without standalone output; the combination caused build conflicts.

**[FIX] amplify.yml — standard Next.js build**
- Removed `postBuild` `cp` commands that copied standalone artifacts.
- Changed `baseDirectory` from `.next/standalone` to `.next`.
- Added documented list of required Amplify Console environment variables.

**[FIX] docker-compose.yml — correct environment variables**
- Removed legacy SMTP vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL`) that referred to the old nodemailer setup.
- Added AWS SES + DynamoDB vars: `ADMIN_PASSWORD`, `SESSION_SECRET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM_EMAIL`, `DYNAMODB_BLOG_TABLE`, `DYNAMODB_CONTACTS_TABLE`, `DYNAMODB_AGENT_TABLE`, `GROQ_API_KEY`.
- Updated healthcheck to use `/api/health`.

**[FIX] Add health endpoint**
- `app/api/health/route.ts` — `GET /api/health` returns `{ status: "ok", timestamp }`. Used by Docker healthcheck and ALB target group health checks.

**[FIX] Add .nvmrc**
- `.nvmrc` — specifies Node 20 for consistent local and CI environments.

**[FIX] Remove test blog post**
- `data/blog-posts.json` — cleared the `{ "title": "sad", "slug": "sad" }` test entry.

---

### AWS Deployment — Setup Checklist

Before deploying to Amplify:

1. **Create DynamoDB tables** in `eu-west-2` (or your region):
   - `portfolio-blog` — partition key `id` (String), enable TTL if desired
   - `portfolio-contacts` — partition key `id` (String)
   - `portfolio-agent-logs` — partition key `id` (String)

2. **Verify SES domain/email** — go to SES console, add and verify `SES_FROM_EMAIL` address.

3. **Set Amplify Console environment variables**:
   ```
   ADMIN_PASSWORD=<strong-password>
   SESSION_SECRET=<32+-char-random-string>
   AWS_REGION=eu-west-2
   AWS_ACCESS_KEY_ID=<iam-key>
   AWS_SECRET_ACCESS_KEY=<iam-secret>
   SES_FROM_EMAIL=<verified-email>
   DYNAMODB_BLOG_TABLE=portfolio-blog
   DYNAMODB_CONTACTS_TABLE=portfolio-contacts
   DYNAMODB_AGENT_TABLE=portfolio-agent-logs
   GROQ_API_KEY=<new-rotated-key>
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

4. **IAM permissions** — the Amplify service role / IAM user needs:
   - `ses:SendEmail` on `SES_FROM_EMAIL` resource
   - `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Scan` on the three tables

5. **Add CV files** to `public/cv/`:
   - `Hammad_Ahmad_AI_CV.pdf`
   - `Hammad_Ahmad_SE_CV.pdf`
   - `Hammad_Ahmad_CV.pdf`

6. **Replace OG image** — `public/og-image.svg` works but social crawlers prefer PNG. Export `public/og-image.png` at 1200×630 and update `app/layout.tsx`.

7. **Run `npm install`** to apply dependency changes (uuid, removed packages, Next.js patch updates).

---

---

## Version 1.1.0 — 2026-04-26

Design, visual, and feature pass.

---

### #14 — Real bento grid layout

**[FIX] `components/sections/BentoProjects.tsx`** — Rebuilt as a proper bento grid:
- Large card (`bentoSize: "large"`) spans 2 columns on md+
- Medium cards are side-by-side
- `PipelineDiagramView` wired in: large card shows diagram at 18% opacity (30% on hover) on the right half; medium cards reveal diagram background on hover

### #18 — Inline styles → Tailwind (blog listing)

**[FIX] `app/blog/BlogListing.tsx`** — Converted all structural/layout inline styles to Tailwind classes. CSS variable references (`var(--surface)` etc.) remain as inline styles since Tailwind can't interpolate runtime CSS vars without a plugin.

### #20 — README updated

**[FIX] `README.md`** — Changed "Next.js 14" → 15, "Vercel" → AWS Amplify Hosting, updated env var list (added `ADMIN_PASSWORD`, `SESSION_SECRET`, DynamoDB tables), added AWS setup section, corrected script docs.

### #21–#28 — Visual upgrades and new features

**[FIX] PipelineDiagram wired in everywhere**
- `BentoProjects.tsx` — pipeline visible as decorative background (see #14)
- `app/projects/ProjectsView.tsx` — pipeline diagram revealed on hover for each project card

**[NEW] Per-project detail pages — `app/projects/[slug]/page.tsx`**
- Routes: `/projects/finlaw-uk`, `/projects/ai-voice-agent`, `/projects/diabetes-risk`
- Full long description, all highlights, metrics panel, pipeline architecture diagram at 320px height, complete tech stack
- `generateStaticParams` from `PROJECTS` array — statically generated
- "Details" / "Deep dive" link buttons added to both `BentoProjects` and `ProjectsView` cards

**[NEW] Reading time — `lib/reading-time.ts`**
- `readingTime(content)` — word count ÷ 200 WPM, minimum 1 minute
- Added to blog listing cards and individual blog post header

**[NEW] JSON-LD BlogPosting — `app/blog/[slug]/page.tsx`**
- `schema.org/BlogPosting` structured data on every post page
- Includes `headline`, `description`, `datePublished`, `dateModified`, `author`, `url`, `keywords`
- Also added `openGraph.type: "article"` with published/modified times to page metadata

### #33 — Date-bomb removed

**[FIX] `components/sections/Contact.tsx`** — Removed hardcoded "October 2026" PhD/postdoc date. Changed to "later this year" to avoid a stale date in production.

### #34 — Header nav active state for route pages

**[FIX] `components/layout/Header.tsx`** — Replaced `window.location.pathname` (SSR-unsafe, causes hydration mismatch) with `usePathname()` from `next/navigation`. Both desktop and mobile menus now correctly highlight `/projects` when on that route. Logo click also handles non-home pages by navigating back to `/`.

### CI Pipeline

**[NEW] `.github/workflows/ci.yml`**
- Runs on push to `main` and all PRs
- Jobs: `npm ci` → `npm run type-check` → `npm run build`
- Stub secrets for build (`ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`)

---

### Pending (v1.2 backlog)

- Syntax highlighting in blog code blocks (Shiki — needs package install)
- `prefers-reduced-motion` media query in `StarField` and Framer Motion variants
- DynamoDB-backed rate limiting for AI agent endpoint (replace in-memory Map)
- Replace SVG OG image with PNG (1200×630) for correct social card rendering
- Streaming agent responses (Server-Sent Events)
- RSS feed (`/blog/rss.xml`)
- Light-mode StarField visibility fix (currently opacity-0 in light mode)
