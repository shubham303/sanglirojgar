# PRD: सांगली रोजगार (Sangli Rojgar)

## 1. Product Overview

**सांगली रोजगार** is a free, no-login job listing platform for Sangli district, Maharashtra. It connects local employers (shops, small businesses) with workers (drivers, electricians, cleaners, etc.) through a simple post-and-browse model. Communication happens directly via phone calls.

**Tech Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + PostgreSQL (pg) / Supabase PostgreSQL (prod)

---

## 2. Current State

### What Works
- Home page with CTAs for workers and employers
- Browse jobs with server-side pagination and filtering
- Post a job (form with shared validation)
- Edit/delete own jobs via phone number lookup (with delete confirmation, soft-delete)
- Job detail page (`/job/[id]`) with full info, phone call + WhatsApp buttons
- Dynamic job types stored in database, manageable by admin (add/delete)
- Admin panel with login (userid: `shubham`) to manage job types
- Skeleton loading cards on job listing
- Error states with auto-retry (3 attempts) on all data-fetching pages
- SEO meta tags on job detail pages (Open Graph for WhatsApp sharing)
- Nav link for employer page ("माझ्या जाहिराती")
- Search triggers on button press (not on every keystroke)
- Shared validation module (no duplicated logic)
- Dual-database support (PostgreSQL for dev, Supabase for prod)
- Fully Marathi UI
- Responsive layout

### Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/jobs` | Browse, filter & paginate jobs |
| `/job/new` | Post a new job |
| `/job/[id]` | Job detail page (shareable, SEO-ready) |
| `/job/[id]/edit` | Edit a job |
| `/employer/[phone]` | Manage your ads by phone |
| `/admin` | Admin login + manage job types |
| `API: /api/jobs` | GET paginated + filtered, POST new |
| `API: /api/jobs/[id]` | GET one, PUT update, DELETE soft-delete |
| `API: /api/jobs/employer/[phone]` | GET jobs by phone |
| `API: /api/job-types` | GET all job type names (public) |
| `API: /api/admin/login` | POST admin login |
| `API: /api/admin/logout` | POST admin logout |
| `API: /api/admin/job-types` | GET/POST/DELETE job types (admin only) |

---

## 3. Decisions Log

### Deferred — will address when user base grows

| Item | Decision | Reason |
|---|---|---|
| Ownership verification on edit/delete | Deferred | Keeping it simple for now. Will add employer login later. |
| Rate limiting / spam protection | Deferred | No users yet. Will add with login system later. |
| Phone number editable on edit page | Deferred | Security concern, will fix with login system. |
| Admin credentials in env vars | Deferred | Okay for now with hardcoded creds. |

### Deferred — alternative approach planned

| Item | Decision | Reason |
|---|---|---|
| Job expiry | No auto-expiry | Target audience is less tech-savvy. Pagination + newest-first sorting keeps fresh jobs visible. Will manually verify old jobs via phone calls initially, then use voice AI agents + WhatsApp notifications to check if jobs are still active. |

---

## 4. Remaining Gaps

### P1 — Next Priority

| # | Issue | Fix |
|---|---|---|
| 1 | No input sanitization | Add basic content filtering for spam/abusive text |
| 2 | Not-found handling on edit page | Show error if job ID doesn't exist on `/job/[id]/edit` |

### P1.5 — High Priority Enhancement

| # | Issue | Fix |
|---|---|---|
| 3 | Nearby taluka jobs when filtering | When user filters by taluka, show exact-match jobs first, then show jobs from nearby talukas sorted by distance. Store lat/lng for each taluka in `constants.ts` and use haversine distance to sort. API returns `{ jobs: [...], nearbyJobs: [...] }` when taluka filter is active. Frontend shows a "जवळच्या तालुक्यातील नोकऱ्या" section below. |

**Implementation:**
- Add `TALUKA_COORDS` map in `constants.ts` with approximate center lat/lng for each taluka
- Add `haversineDistance(lat1, lng1, lat2, lng2)` utility in a new `src/lib/geo.ts`
- Update `getActiveJobsPaginated` in both DB implementations: when `taluka` filter is set, also fetch jobs from other talukas, compute distance from selected taluka, and return as a separate `nearbyJobs` array sorted by distance
- Update API response shape to include `nearbyJobs` when taluka filter is active
- Update `/jobs` page to render a "जवळच्या तालुक्यातील नोकऱ्या" section after main results

### P2 — Future Enhancements

| # | Issue | Fix |
|---|---|---|
| 4 | No sorting options | Add sort dropdown (newest/oldest) |
| 5 | Admin moderation | View all jobs, remove spam, basic stats |
| 6 | Job reporting | Let users report fake/spam jobs |
| 7 | Analytics dashboard | Track page views, job counts, popular types |
| 8 | PWA support | Manifest + service worker for mobile install |

---

## 5. Non-Functional Requirements

| Requirement | Current | Target |
|---|---|---|
| Page load (jobs) | <1s (paginated, 20 per page) | Achieved |
| Max concurrent jobs | 10,000+ with pagination | Achieved |
| Error handling | Retry 3x, then show error | Achieved |
| Shareability | Per-job URL with OG tags | Achieved |
| Job freshness | Newest first + manual verification | Achieved |
| Testing | 0 tests | Unit tests for validation + API (future) |
| Monitoring | None | Basic error logging (future) |

---

## 6. Out of Scope

- User accounts / login system (intentional — keep it simple until user base grows)
- Payment / premium listings
- Multi-language support (Marathi-only is correct for the target audience)
- Mobile app (PWA is sufficient)
- Complex matching algorithms
- Auto job expiry (manual + AI verification approach instead)
