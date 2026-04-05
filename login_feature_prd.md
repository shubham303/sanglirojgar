# PRD: User Accounts & Premium Employer Features for MahaJob

## 1. Background & Motivation

MahaJob currently operates as an open job board where:
- **Job seekers** browse jobs and contact employers directly via Call/WhatsApp buttons. No account needed.
- **Employers** post jobs by entering their phone number. They manage their listings at `/my-ads` by entering the same phone number. No authentication.

This simplicity has been intentional for early traction. But now we need to add **optional accounts** for both sides to unlock higher-value features — while keeping the existing open flow fully functional for users who don't want to sign up.

### Core Principle
MahaJob is built to serve small, local businesses first. The platform must remain fully useful for free. Premium features are an optional advantage, not a paywall. Pricing and feature decisions should never make small companies feel left behind in favor of larger staffing agencies.

### Goals
1. **Increase job seeker engagement** — let them save jobs, track applications, and get personalized recommendations.
2. **Increase employer-to-seeker connections** — let employers proactively reach out to interested candidates (not just wait for calls).
3. **Generate revenue** — introduce an affordable premium tier (Rs 199/mo) for employers who want access to applicant data and candidate recommendations.
4. **Validate the premium model** — test with 10-15 companies. Price can increase later as value is proven.

### Non-Goals (Explicitly Out of Scope)
- Payment gateway integration (manual onboarding for now)
- Enterprise plan (noted in plan.txt but explicitly "not planned")
- Chat/messaging system between employers and seekers
- Resume/CV upload functionality
- Mobile app (PWA is sufficient)

---

## 2. User Roles & Access Levels

### 2.1 Job Seeker (3 tiers)

| Tier | Description | Access |
|------|-------------|--------|
| **Anonymous** (existing) | No account. Just browses and contacts employers. | Browse jobs, search/filter, call/WhatsApp employers. Same as today. |
| **Registered** (new) | Creates account with profile & preferences. | Everything anonymous gets + My Jobs page (recommended, applied, liked), profile management, job preferences. |

**Key detail:** When a job seeker creates an account, they **opt in** to letting employers see their contact details. This is the value exchange — seekers get recommendations; employers get access to reach them directly.

### 2.2 Employer (3 tiers)

| Tier | Description | Access |
|------|-------------|--------|
| **Anonymous** (existing) | No account. Posts jobs with phone number. | Post jobs, receive calls/messages, view/edit own postings via phone lookup at `/my-ads`. Same as today. |
| **Authenticated** (new) | Sets a password for their phone number. | Everything anonymous gets + secure login, dashboard with posted jobs. No access to applicant data. |
| **Premium** (new) | Authenticated + active subscription. | Everything authenticated gets + see applicants per job (contact details & preferences), see who liked their jobs, get recommended candidate profiles per job. |

---

## 3. Feature Details

### 3.1 Job Seeker Account

#### 3.1.1 Registration

**Fields:**
| Field | Required | Details |
|-------|----------|---------|
| Name | Yes | Full name |
| WhatsApp Number | Yes | 10-digit Indian mobile number (used as unique identifier / login) |
| Email | No | Optional, for future communication |
| Password | Yes | No complexity constraints (user base is non-technical, any password works) |
| City | Yes | Dropdown from existing district list |
| Job Preferences | Yes | Multi-select from existing `job_types` table (e.g., Driver, Waiter, Electrician) |

**Behavior:**
- Registration is accessible from header/nav but never forced. All existing flows work without login.
- After registration, seeker's contact details become visible to **premium employers** who have relevant job postings.
- The opt-in to employer visibility must be clearly communicated during registration (e.g., "Employers with matching jobs may contact you on WhatsApp").

#### 3.1.2 Login

- Login via WhatsApp number + password.
- Session management via cookie (similar to existing admin auth pattern).
- "Forgot password" is out of scope for v1 — support via admin/WhatsApp.

#### 3.1.3 My Jobs Page (Logged-in Seekers)

Four tabs/sections:

1. **Recommended Jobs** — Jobs matching the seeker's selected job preferences (job_type_ids) and city. Sorted by recency. This is a filtered view of existing jobs, not a separate recommendation engine.

2. **Applied Jobs** — Jobs where the seeker clicked the Call or WhatsApp button. We already track clicks in `job_clicks` table; we just need to associate them with a seeker_id when logged in.

3. **Liked/Saved Jobs** — Seekers can "heart/save" a job for later. New feature requiring a `saved_jobs` table. A "Save" button appears on job cards and detail pages when logged in.

4. **Profile** — View and edit: name, email, city, job preferences, password.

#### 3.1.4 What Changes for Anonymous Seekers?

**Nothing.** The site works exactly as before. The only new UI elements are:
- A "Login / Register" link in the header/nav.
- A "Save" button on job cards that prompts login when clicked by anonymous users.

---

### 3.2 Employer Account

#### 3.2.1 Password Setup (Account Creation)

Employers don't "register" — they already exist in the `employers` table with their phone number. Account creation = **setting a password** for an existing phone number.

**Flow:**
1. Employer visits a "Set Password" page (linked from `/my-ads` or employer dashboard).
2. Enters their phone number.
3. If the phone exists in `employers` table (has posted at least one job), they can set a password.
4. If the phone doesn't exist, they're told to post a job first.

**Fields:**
| Field | Required | Details |
|-------|----------|---------|
| Phone | Yes | Must match an existing employer phone |
| Password | Yes | No complexity constraints |

#### 3.2.2 Employer Login

- Login via phone + password at `/employer/login`.
- Session managed via cookie.
- After login, redirect to employer dashboard.
- Existing `/my-ads` phone-lookup flow remains for employers without accounts.

#### 3.2.3 Employer Dashboard (Authenticated, Non-Premium)

- **My Posted Jobs** — Same as existing `/employer/[phone]` page but behind login. List of all jobs with edit/delete/toggle controls.
- **Account Settings** — Change password.
- No access to applicant data or recommendations (those are premium-only).

#### 3.2.4 Premium Employer Features

Available only to employers with an active premium subscription.

**Upsell UX (critical):** Non-premium employers must see premium features as **locked but visible** on their dashboard. Show blurred/placeholder applicant lists, candidate counts, and recommendation previews with a prominent "Upgrade to Premium — Rs 500/mo" CTA. The employer should immediately understand what they're missing: boosted job visibility + direct access to candidate contacts. This is the primary conversion funnel.

**Feature 1: Applicants per Job**
- For each job, show a list of seekers who clicked Call or WhatsApp on that job.
- Display: Seeker name, WhatsApp number, job preferences, city.
- Only shows data for **registered seekers** (anonymous clicks show as "Anonymous applicant" with no contact info).
- Data source: `job_clicks` table joined with `job_seekers` (enhanced with account data).

**Feature 2: Interested Candidates (Liked)**
- For each job, show seekers who saved/liked that job.
- Same display format as applicants.
- Helps identify candidates who are interested but haven't applied yet.
- Data source: new `saved_jobs` table.

**Feature 3: Recommended Profiles**
- For each job, show registered seekers whose job preferences match the job's `job_type_id` and whose city matches the job's district.
- Ordered by registration recency.
- This helps employers proactively reach out to potential candidates.

---

### 3.3 Premium Subscription Model

#### Pricing

Single tier for v1: **Rs 199/month.** Low entry point to maximize adoption. Price can be raised for new subscribers once value is proven. Higher tiers and job caps can be introduced later if needed.

#### How Premium Works

- **Any employer** (free or premium) can post unlimited jobs.
- **All jobs** from a premium employer get priority ranking in search results + access to applicant lists, liked candidates, and recommended profiles.
- No job caps or marking for v1. Keep it simple.
- **If abuse/spam is observed later:** introduce job posting limits across all tiers (including free). This also acts as spam prevention. For employers who need to post many jobs but don't need premium features, offer a separate low-cost "posting-only" plan that just raises the job limit without unlocking applicant data/recommendations.
- No `is_boosted` flag needed on jobs for now. Premium status is determined entirely by the employer's subscription.

#### Subscription Management (v1)

- **Razorpay payment gateway** for premium subscriptions. No upfront fees — 2% per transaction.
- Employer clicks "Upgrade to Premium" → sees a payment page on the website → pays via UPI/card/netbanking → subscription activated automatically.
- Admin dashboard also has the ability to manually activate/deactivate premium (for test accounts, comps, or edge cases).
- Subscription is monthly (Rs 199/mo). On successful payment: set `is_premium: true`, `premium_expires_at: +30 days`.
- **No auto-renewal for v1.** Employer pays manually each month. When subscription expires, premium features stop. Employer sees a "Renew" prompt.
- Payment verification via Razorpay webhook/signature to prevent tampering.

---

## 4. Data Model Changes

### 4.1 Modified Tables

**`job_seekers`** (existing, needs expansion)
```
+ password_hash    TEXT          -- hashed password
+ email            TEXT          -- optional email
+ city             TEXT          -- district from existing list
+ is_registered    BOOLEAN       -- true if has account (vs just outreach entry)
+ opted_in_for_employer_contact  BOOLEAN DEFAULT true  -- can employers see their details?
```

**`employers`** (existing, needs expansion)
```
+ password_hash    TEXT          -- hashed password (null = no account)
+ is_premium       BOOLEAN DEFAULT false  -- active premium subscription
+ premium_expires_at TIMESTAMP  -- when subscription ends
```

**`job_clicks`** (existing, needs expansion)
```
+ seeker_phone     TEXT          -- links click to a registered seeker (null if anonymous)
```

### 4.2 New Tables

**`seeker_job_preferences`**
```
seeker_phone      TEXT REFERENCES job_seekers(phone)
job_type_id       INTEGER REFERENCES job_types(id)
PRIMARY KEY (seeker_phone, job_type_id)
```

**`saved_jobs`**
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
seeker_phone      TEXT REFERENCES job_seekers(phone)
job_id            UUID REFERENCES jobs(id)
created_at        TIMESTAMP DEFAULT now()
UNIQUE (seeker_phone, job_id)
```

---

## 5. Page & Route Plan

### New Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/seeker/register` | Job seeker registration form | No |
| `/seeker/login` | Job seeker login | No |
| `/seeker/dashboard` | My Jobs page (recommended, applied, liked) | Seeker login |
| `/seeker/profile` | Edit profile & preferences | Seeker login |
| `/employer/login` | Employer login page | No |
| `/employer/register` | Set password for existing phone | No |
| `/employer/dashboard` | Employer dashboard (posted jobs, premium features) | Employer login |
| `/employer/dashboard/job/[id]` | Job detail with applicants/interested/recommended | Employer login + Premium |

### Modified Pages

| Route | Change |
|-------|--------|
| `/` (Home) | Add Login/Register links in header for both seekers and employers |
| `/jobs` | Add "Save" button on job cards (prompts login if not authenticated) |
| `/job/[id]` | Add "Save" button. Track seeker_phone on call/whatsapp clicks if logged in. |
| `/job/new` | If employer is logged in, auto-fill phone/name from session |
| `/admin` | Add premium employer management section |

### New API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/seeker/register` | None | Create seeker account |
| POST | `/api/seeker/login` | None | Login, set session cookie |
| POST | `/api/seeker/logout` | Seeker | Clear session |
| GET | `/api/seeker/me` | Seeker | Get current seeker profile |
| PUT | `/api/seeker/me` | Seeker | Update profile & preferences |
| GET | `/api/seeker/recommended-jobs` | Seeker | Jobs matching preferences |
| GET | `/api/seeker/applied-jobs` | Seeker | Jobs seeker clicked on |
| GET | `/api/seeker/saved-jobs` | Seeker | Liked/saved jobs |
| POST | `/api/seeker/saved-jobs` | Seeker | Save a job |
| DELETE | `/api/seeker/saved-jobs/[jobId]` | Seeker | Unsave a job |
| POST | `/api/employer/register` | None | Set password for phone |
| POST | `/api/employer/login` | None | Login, set session cookie |
| POST | `/api/employer/logout` | Employer | Clear session |
| GET | `/api/employer/me` | Employer | Get employer profile |
| GET | `/api/employer/jobs` | Employer | Get own posted jobs |
| GET | `/api/employer/jobs/[id]/applicants` | Employer + Premium | Get applicants for a job |
| GET | `/api/employer/jobs/[id]/interested` | Employer + Premium | Get seekers who liked |
| GET | `/api/employer/jobs/[id]/recommended` | Employer + Premium | Get matching seeker profiles |
| PUT | `/api/admin/employers/[phone]/premium` | Admin | Set/update premium subscription |

---

## 6. Auth Architecture

### Session Design

Three independent session types (cookies):
1. `admin_session` — existing, unchanged
2. `seeker_session` — new, for job seekers
3. `employer_session` — new, for employers

Each session cookie stores a token. Server-side validation checks the token against the database or a signed JWT.

**Recommended approach for v1:** Simple cookie with signed token (phone number + role + expiry, signed with a secret). No need for a sessions table. Same pattern as existing admin auth but with proper signing.

### Password Hashing

Use `bcrypt` (via `bcryptjs` npm package — pure JS, no native deps). Hash on registration, verify on login.

---

## 7. UI/UX Considerations

### Language
- All new UI must support Marathi and English (existing i18n system).
- Registration/login forms in Marathi-first with English labels.

### Mobile-First
- Target audience uses mobile (mostly Android). All new pages must be mobile-optimized.
- Bottom tab bar already exists — add "My Account" or "Profile" tab for logged-in users.

### Progressive Disclosure
- Don't overwhelm anonymous users. Account features should be discoverable but not intrusive.
- "Save" button on jobs is the main hook to prompt registration.
- Employer premium features shown as locked/blurred with "Upgrade to Premium" CTA.

### Backward Compatibility
- `/my-ads` phone-lookup flow remains fully functional.
- No existing URL breaks.
- Anonymous posting remains the default; login is optional.

---

## 8. Rollout Plan

### Phase 1: Job Seeker Accounts
1. Database schema changes (expand `job_seekers`, create `seeker_job_preferences`, `saved_jobs`).
2. Seeker registration & login (API + pages).
3. "Save" button on job cards and detail pages.
4. My Jobs page (recommended, applied, saved).
5. Profile page.
6. Track `seeker_phone` on clicks when logged in.

### Phase 2: Employer Accounts
1. Database schema changes (expand `employers`).
2. Employer password setup & login (API + pages).
3. Employer dashboard (posted jobs behind login).
4. Admin premium management UI.

### Phase 3: Premium Features
1. Premium job marking by employers.
2. Applicants list per job.
3. Interested candidates list per job.
4. Recommended profiles per job.
5. Premium upsell UI (locked features with CTA).

### Phase 4: Validation & Iteration
1. Onboard 10-15 companies manually.
2. Collect feedback.
3. Iterate on premium features.
4. Plan payment gateway integration based on results.

---

## 9. Open Questions for Discussion

1. **Seeker opt-in wording:** How explicitly should we communicate that employers will see their phone number? Should there be a toggle to opt out later?

2. **"Applied" definition:** Currently, we track Call/WhatsApp clicks. Is a click = an application? Or should we add an explicit "Apply" button alongside Call/WhatsApp?

3. **Password recovery:** For v1, no "forgot password" flow. Should admin handle resets via WhatsApp? Or should we add OTP-based login from the start?

4. **Employer phone verification:** Currently anyone can claim a phone number. Should we add OTP verification when setting an employer password? (Adds complexity but prevents account hijacking.)

5. **Premium job limit enforcement:** When a premium subscription expires, what happens to premium-flagged jobs? Options: (a) auto-remove premium flags, (b) keep flags but stop showing premium data, (c) grace period.

6. **Data privacy:** Showing seeker phone numbers to premium employers — any privacy concerns? Should we add an intermediate step (e.g., employer requests contact, seeker approves)?

7. **Existing `job_seekers` data:** There are already entries from the outreach registration modal. How to handle them — migrate as accounts (they'd need to set passwords) or keep separate?
