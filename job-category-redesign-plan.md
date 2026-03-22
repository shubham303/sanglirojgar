# Job Category + Job Type + Tags Redesign Plan

## Problem Statement

Current system has `industry → job_type` (one-to-one) which causes:
- **Duplicate job types**: Housekeeping exists in both Hospital (id 29) and Hotel (id 42). Cashier exists in Hotel (41), Retail (70), Finance (94) — 3 copies! Shop Assistant duplicated in General (9) and Retail (69). Delivery Boy in General (2) and Transport (76). Warehouse Worker in General (10) and Transport (78). Cook in Hotel (38) and Domestic (97).
- **Forced categorization**: A "Receptionist" at a hospital vs an office are the same job type but must use different IDs.
- **No context**: No way to search "hospital cleaner" vs "hotel cleaner" — both are just "Housekeeping".

---

## Proposed Architecture

```
Job Posting
  └── job_type_id  →  JobType  →  category_id  →  JobCategory
  └── tag_ids[]    →  JobTag[]   (airport, hospital, school, etc.)
```

- **JobCategory** (replaces Industry): Broad bucket — Office, Hotel, Cleaning, Transport, etc.
- **JobType**: Unique role — Cleaner, Driver, Receptionist. Each has ONE primary category.
- **JobTag**: Context about the job location/sector — Hospital, Airport, Government, School.

---

## Current Job Types → New Category Mapping

### Issues Found (Duplicates to Remove)

| Duplicate Type | Current IDs | Keep ID | Remove IDs |
|---|---|---|---|
| Housekeeping | Hospital(29), Hotel(42) | 42 (rename to "Housekeeping") | 29 → remap jobs to 42 |
| Cashier | Hotel(41), Retail(70), Finance(94) | 41 | 70, 94 → remap to 41 |
| Shop Assistant | General(9), Retail(69) | 69 | 9 → remap to 69 |
| Delivery Boy | General(2), Transport(76) | 76 | 2 → remap to 76 |
| Warehouse Worker | General(10), Transport(78) | 78 | 10 → remap to 78 |
| Cook | Hotel(38), Domestic(97) | 38 | 97 → remap to 38 |

### New Category Structure

Replace 12 current industries (skipping id 8) with cleaner categories:

| ID | Marathi | English | Change from current |
|---|---|---|---|
| 1 | ऑफिस | Office | Replaces "सामान्य (General)" |
| 2 | आरोग्यसेवा | Healthcare | Replaces "हॉस्पिटल" |
| 3 | हॉटेल / रेस्टॉरंट | Hotel/Restaurant | Same |
| 4 | उत्पादन | Manufacturing | Same |
| 5 | बांधकाम | Construction | Same |
| 6 | शिक्षण | Education | Same |
| 7 | रिटेल व विक्री | Retail & Sales | Replaces "रिटेल" |
| 8 | वाहतूक | Transport | Was id 9, now using 8 (plug the gap) |
| 9 | सौंदर्य व निगा | Beauty & Wellness | Was id 10 |
| 10 | आयटी व डिजिटल | IT & Digital | Was id 11 |
| 11 | फायनान्स व विमा | Finance & Insurance | Was id 12 |
| 12 | घरगुती सेवा | Domestic Services | Was id 13 |
| 13 | स्वच्छता व साफसफाई | Cleaning & Housekeeping | NEW — for cross-sector cleaners |
| 14 | सुरक्षा | Security | NEW — for security guards |
| 15 | ऑटोमोबाईल | Automobile | NEW (was in new_job_types.md) |
| 16 | कृषी | Agriculture | NEW (was in new_job_types.md) |
| 17 | सरकारी | Government | NEW (was in new_job_types.md) |
| 18 | कॉल सेंटर / बीपीओ | Call Center / BPO | NEW (was in new_job_types.md) |

### Complete Deduplicated Job Types List

**Office (1)** — White-collar, admin, managerial roles
| ID | Marathi | English | Note |
|---|---|---|---|
| 1 | रिसेप्शनिस्ट | Receptionist | moved from General |
| 2 | शिपाई | Peon | moved from General |
| 3 | सुपरवायझर | Supervisor | moved from General |
| 4 | एचआर | HR | moved from General |
| 5 | कॉम्प्युटर ऑपरेटर | Computer Operator | moved from General |
| 6 | ऑफिस सहाय्यक | Office Assistant | moved from General |
| 7 | फील्ड वर्कर | Field Worker | moved from General |
| 8 | इंजिनिअर | Engineer | moved from General |
| 9 | मार्केटिंग | Marketing | moved from General |
| 10 | अकाउंटंट | Accountant | moved from General |
| 11 | हेल्पर | Helper | moved from General |
| 12 | इतर | Other | moved from General |

**Healthcare (2)**
| ID | Marathi | English | Note |
|---|---|---|---|
| 20 | नर्स | Nurse | same |
| 21 | तंत्रज्ञ | Technician | same |
| 22 | आरएमओ | RMO | same |
| 23 | ओटी तंत्रज्ञ | OT Technician | same |
| 24 | कॅथलॅब तंत्रज्ञ | Cathlab Technician | same |
| 25 | परफ्युजनिस्ट | Perfusionist | same |
| 26 | सीएचओ | CHO | same |
| 27 | फार्मासिस्ट | Pharmacist | same |
| 28 | लॅब टेक्निशियन | Lab Technician | same |
| 29 | रेडिओलॉजिस्ट | Radiologist | same |
| 30 | फिजिओथेरपिस्ट | Physiotherapist | same |
| 31 | आहारतज्ज्ञ | Dietician | same |
| 32 | वॉर्ड बॉय | Ward Boy | same |
| 33 | सीएसएसडी तंत्रज्ञ | CSSD Technician | same |
| 34 | डॉक्टर | Doctor | NEW (from new_job_types.md) |
| 35 | एक्स-रे टेक्निशियन | X-Ray Technician | NEW |
| 36 | एम्बुलन्स ड्रायव्हर | Ambulance Driver | NEW |

**Hotel/Restaurant (3)**
| ID | Marathi | English | Note |
|---|---|---|---|
| 40 | स्वयंपाकी | Cook | merged Hotel(38)+Domestic(97) |
| 41 | वेटर | Waiter | same |
| 42 | किचन हेल्पर | Kitchen Helper | same |
| 43 | कॅशियर | Cashier | merged Hotel(41)+Retail(70)+Finance(94) |
| 44 | बार टेंडर | Bartender | same |
| 45 | बेकर | Baker | same |
| 46 | शेफ | Chef | NEW (from new_job_types.md) |
| 47 | फ्रंट डेस्क | Front Desk | NEW |
| 48 | रूम सर्व्हिस | Room Service | NEW |

**Manufacturing (4)**
| ID | Marathi | English | Note |
|---|---|---|---|
| 50 | वेल्डर | Welder | same |
| 51 | मशीन ऑपरेटर | Machine Operator | same |
| 52 | कामगार | Worker | same |
| 53 | फिटर | Fitter | same |
| 54 | टर्नर | Turner | same |
| 55 | क्वालिटी इन्स्पेक्टर | Quality Inspector | same |
| 56 | पॅकिंग कामगार | Packing Worker | same |
| 57 | फोरमन | Foreman | same |
| 58 | सीएनसी ऑपरेटर | CNC Operator | NEW |
| 59 | स्टोअर कीपर | Store Keeper | NEW |
| 60 | प्रोडक्शन सुपरवायझर | Production Supervisor | NEW |

**Construction (5)**
| ID | Marathi | English | Note |
|---|---|---|---|
| 61 | इलेक्ट्रिशियन | Electrician | same |
| 62 | प्लंबर | Plumber | same |
| 63 | सुतार | Carpenter | same |
| 64 | गवंडी | Mason | same |
| 65 | रंगारी | Painter | same |
| 66 | टाइल कामगार | Tile Worker | same |
| 67 | सेंटरिंग कामगार | Centering Worker | same |
| 68 | लोहार | Blacksmith | same |
| 69 | क्रेन ऑपरेटर | Crane Operator | NEW |
| 70 | साइट इंजिनिअर | Site Engineer | NEW |
| 71 | लेबर कॉन्ट्रॅक्टर | Labour Contractor | NEW |

**Education (6)**
| ID | Marathi | English | Note |
|---|---|---|---|
| 72 | शिक्षक | Teacher | same |
| 73 | प्राथमिक शिक्षक | Primary Teacher | same |
| 74 | माध्यमिक शिक्षक | Secondary Teacher | same |
| 75 | लेक्चरर | Lecturer | same |
| 76 | प्रयोगशाळा सहाय्यक | Lab Assistant | same |
| 77 | शाळा क्लर्क | School Clerk | same |
| 78 | स्पोर्ट्स कोच | Sports Coach | same |
| 79 | संगीत शिक्षक | Music Teacher | same |

**Retail & Sales (7)**
| ID | Marathi | English | Note |
|---|---|---|---|
| 80 | सेल्समन | Salesman | moved from General |
| 81 | दुकान सहाय्यक | Shop Assistant | merged General(9)+Retail(69) |
| 82 | स्टॉक कीपर | Stock Keeper | same |
| 83 | शोरूम सेल्समन | Showroom Salesman | same |
| 84 | बिलिंग क्लर्क | Billing Clerk | same |

**Transport (8)** ← was category id 9, now using 8
| ID | Marathi | English | Note |
|---|---|---|---|
| 90 | ड्रायव्हर | Driver | merged General(4)+Transport types |
| 91 | ट्रक ड्रायव्हर | Truck Driver | same |
| 92 | टेम्पो ड्रायव्हर | Tempo Driver | same |
| 93 | डिलिव्हरी बॉय | Delivery Boy | merged General(2)+Transport(76) |
| 94 | लोडिंग कामगार | Loading Worker | same |
| 95 | गोडाउन कामगार | Warehouse Worker | merged General(10)+Transport(78) |

**Beauty & Wellness (9)** ← was id 10
| ID | Marathi | English |
|---|---|---|
| 100 | हेअर स्टायलिस्ट | Hair Stylist |
| 101 | ब्युटिशियन | Beautician |
| 102 | मेहंदी कलाकार | Mehndi Artist |
| 103 | स्पा थेरपिस्ट | Spa Therapist |
| 104 | नेल टेक्निशियन | Nail Technician |

**IT & Digital (10)** ← was id 11
| ID | Marathi | English |
|---|---|---|
| 110 | सॉफ्टवेअर डेव्हलपर | Software Developer |
| 111 | वेब डिझायनर | Web Designer |
| 112 | ग्राफिक डिझायनर | Graphic Designer |
| 113 | डेटा एन्ट्री | Data Entry |
| 114 | सोशल मीडिया मॅनेजर | Social Media Manager |
| 115 | व्हिडिओ एडिटर | Video Editor |

**Finance & Insurance (11)** ← was id 12
| ID | Marathi | English |
|---|---|---|
| 120 | लोन एजंट | Loan Agent |
| 121 | विमा एजंट | Insurance Agent |
| 122 | अकाउंट्स एक्झिक्युटिव | Accounts Executive |
| 123 | फायनान्शियल अॅडव्हायझर | Financial Advisor |
| 124 | बँक कर्मचारी | Bank Staff | moved from General |

**Domestic Services (12)** ← was id 13
| ID | Marathi | English |
|---|---|---|
| 130 | घरकाम | Maid |
| 131 | बेबीसिटर | Babysitter |
| 132 | वृद्ध सेवा | Elder Care |
| 133 | गार्डनर | Gardener |

**Cleaning & Housekeeping (13)** ← NEW category
| ID | Marathi | English | Note |
|---|---|---|---|
| 140 | हाउसकीपिंग | Housekeeping | merged Hospital(29)+Hotel(42) |
| 141 | सफाई कर्मचारी | Cleaner | moved from General |
| 142 | हाउसकीपिंग सुपरवायझर | Housekeeping Supervisor | from new_job_types.md |
| 143 | पॅन्ट्री बॉय | Pantry Boy | from new_job_types.md |

**Security (14)** ← NEW category
| ID | Marathi | English | Note |
|---|---|---|---|
| 150 | सुरक्षा रक्षक | Security Guard | moved from General |

**Automobile (15)** ← NEW
| ID | Marathi | English |
|---|---|---|
| 160 | ऑटो मेकॅनिक | Auto Mechanic |
| 161 | मेकॅनिक | Mechanic | moved from General |
| 162 | सर्व्हिस अॅडव्हायझर | Service Advisor |
| 163 | डेंटिंग-पेंटिंग | Denting-Painting |
| 164 | वॉशिंग बॉय | Washing Boy |
| 165 | स्पेअर पार्ट्स | Spare Parts |
| 166 | इलेक्ट्रिकल टेक्निशियन | Electrical Technician |

**Agriculture (16)** ← NEW
| ID | Marathi | English |
|---|---|---|
| 170 | शेतमजूर | Farm Worker |
| 171 | ट्रॅक्टर चालक | Tractor Driver |
| 172 | पशुपालक | Animal Husbandry |
| 173 | दूध संकलन | Milk Collection |
| 174 | कृषी सल्लागार | Agriculture Consultant |
| 175 | गोडाउन व्यवस्थापक | Godown Manager |

**Government (17)** ← NEW
| ID | Marathi | English |
|---|---|---|
| 180 | तलाठी | Talathi |
| 181 | ग्रामसेवक | Gramsevak |
| 182 | पोलीस भरती | Police Recruitment |
| 183 | अंगणवाडी सेविका | Anganwadi Worker |
| 184 | आशा वर्कर | ASHA Worker |
| 185 | लिपिक | Clerk |
| 186 | शिपाई (सरकारी) | Peon (Government) |

**Call Center / BPO (18)** ← NEW
| ID | Marathi | English | Note |
|---|---|---|---|
| 190 | टेलिकॉलर | Telecaller | moved from General(13) |
| 191 | कस्टमर सपोर्ट | Customer Support | NEW |
| 192 | चॅट सपोर्ट | Chat Support | NEW |
| 193 | टीम लीडर | Team Leader | NEW |
| 194 | बॅक ऑफिस | Back Office | NEW |
| 195 | हेल्प डेस्क | Help Desk | from new_job_types.md |
| 196 | शिफ्ट एक्झिक्युटिव | Shift Executive | from new_job_types.md |

---

## New Tags System

Tags go on the **job posting** (not on job types). They describe the work location/sector context.

| ID | Marathi | English | Use case example |
|---|---|---|---|
| 1 | विमानतळ | Airport | Cleaner/Driver/Security at airport |
| 2 | हॉस्पिटल | Hospital | Cleaner/Security/Receptionist at hospital |
| 3 | शाळा / कॉलेज | School/College | Security/Cleaner/Cook at school |
| 4 | मॉल / शॉपिंग | Mall/Shopping | Security/Cleaner at mall |
| 5 | बँक | Bank | Security/Cashier at bank |
| 6 | कारखाना | Factory | Cleaner/Security/Canteen at factory |
| 7 | सरकारी संस्था | Government Office | Any role at govt office |
| 8 | हॉटेल | Hotel | Specifically hotel property |
| 9 | रेस्टॉरंट | Restaurant | Restaurant/dhaba |
| 10 | बांधकाम साइट | Construction Site | Any role at construction site |
| 11 | आयटी पार्क | IT Park | Any role at IT park |
| 12 | घरगुती | Residential/Home | Domestic work, home-based |

**Example usage:**
- "Hospital Cleaner" → Job Type: Cleaner (Cleaning category), Tags: [Hospital]
- "Airport Security" → Job Type: Security Guard (Security category), Tags: [Airport]
- "Hotel Receptionist" → Job Type: Receptionist (Office category), Tags: [Hotel]
- "School Cook" → Job Type: Cook (Hotel/Restaurant category), Tags: [School/College]

---

## Database Schema Changes

### 1. Rename `industries` → `job_categories`
```sql
ALTER TABLE industries RENAME TO job_categories;
-- Also rename the column references in job_types
ALTER TABLE job_types RENAME COLUMN industry_id TO category_id;
```

### 2. Add `job_tags` table
```sql
CREATE TABLE job_tags (
  id   serial PRIMARY KEY,
  name_mr  text NOT NULL,
  name_en  text NOT NULL,
  slug     text UNIQUE NOT NULL  -- for URL filtering: ?tag=hospital
);
```

### 3. Add `job_posting_tags` junction table
```sql
CREATE TABLE job_posting_tags (
  job_id  uuid REFERENCES jobs(id) ON DELETE CASCADE,
  tag_id  integer REFERENCES job_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, tag_id)
);
CREATE INDEX idx_job_posting_tags_tag_id ON job_posting_tags(tag_id);
CREATE INDEX idx_job_posting_tags_job_id ON job_posting_tags(job_id);
```

### 4. Data Migration
- Remap duplicate job_type_ids in `jobs` table
- Insert new categories (with renumbering)
- Insert deduplicated job types
- Insert job tags
- No job data loss — only foreign key remapping

---

## Code Changes Required

### TypeScript Types (`src/lib/types.ts`)
```typescript
// Replace Industry with JobCategory
interface JobCategory {
  id: number;
  name_mr: string;
  name_en: string;
}

// Update JobType
interface JobType {
  id: number;
  name_mr: string;
  name_en: string;
  category_id: number;  // renamed from industry_id
}

// New
interface JobTag {
  id: number;
  name_mr: string;
  name_en: string;
  slug: string;
}

// Update Job
interface Job {
  // ... existing fields
  tag_ids?: number[];           // optional, from job_posting_tags
  tag_displays?: JobTag[];      // populated via JOIN
}
```

### API Routes
| Current | Change |
|---|---|
| `/api/job-types?grouped=true` | Returns categories instead of industries |
| `/api/admin/industries` | Rename to `/api/admin/job-categories` |
| `/api/admin/job-types` | Update to use `category_id` |
| (NEW) `/api/job-tags` | Public endpoint returning all tags |
| (NEW) `/api/admin/job-tags` | Admin CRUD for tags |
| `/api/jobs` (POST) | Accept `tag_ids?: number[]` |
| `/api/jobs` (GET) | Accept `?tag=hospital` filter |

### DB Layer (`src/lib/db-supabase.ts`)
- Update `getIndustries()` → `getJobCategories()`
- Update `getJobTypes()` — now returns `category_id` instead of `industry_id`
- Add `getJobTags(): Promise<JobTag[]>`
- Update `addJob()` to insert into `job_posting_tags`
- Update `getJobs()` to support `?tag_id=` filter
- Update filtering by industry_id → category_id

### Components
| Component | Change |
|---|---|
| `JobTypePicker.tsx` | Change `industry_id` → `category_id`, rename props |
| `JobForm.tsx` | Add optional tag multi-select below job type picker |
| `JobCardInfo.tsx` | Optionally display tags as chips |
| `job-types-cache.ts` | Update `GroupedJobTypeOption.industry_id` → `category_id` |
| `useJobTypes.ts` | Update to use categories, add `useJobTags()` hook |
| `jobs/page.tsx` | Add tag filter to browse UI |
| `admin/page.tsx` | Update industry filter to category filter |

---

## Issues & Risks

### Issue 1: Duplicate job_type_ids in live jobs
**Problem**: Jobs currently reference duplicate job_type_ids (e.g., Cashier as id 41, 70, or 94). When we deduplicate, some ids will be removed.
**Fix**: Migration must remap all jobs before deleting duplicate job types. Run in a single transaction.

### Issue 2: Category ID renumbering breaks URL params
**Problem**: URLs like `/jobs?industry_id=9` (Transport) will break if Transport moves from id 9 to id 8.
**Fix**: Don't renumber categories. Keep old IDs, just fill in the gap at id 8 with new Transport entry. OR migrate URL params in a backwards-compatible way using slugs (`?category=transport`).
**Recommendation**: Use slugs for category filtering going forward (add `slug` column to `job_categories`).

### Issue 3: Old `industry_id` references in code
**Problem**: `JobType.industry_id` is referenced throughout: `useJobTypes.ts`, `job-types-cache.ts`, `JobTypePicker.tsx`, `db-supabase.ts`, admin pages.
**Fix**: Systematic rename — search `industry_id` and `industry` references. Many can be done with `replace_all`. This is safe since column is being renamed in DB too.

### Issue 4: Tags on existing jobs
**Problem**: Thousands of existing jobs won't have any tags after migration — the tags table will be empty for old postings.
**Fix**: This is acceptable. Tags are optional context. Old jobs work fine without tags. Keyword-based auto-tagging can be done later as an enhancement (e.g., if description contains "hospital" → suggest Hospital tag).

### Issue 5: Tag UI complexity for employers
**Problem**: Adding a tag picker to the job form may confuse less tech-savvy employers.
**Fix**: Make tags optional with a simple "Where will this job be?" step. Show common options as big buttons (Hospital, Hotel, School, Factory, etc.) rather than a text input. Can be added as a collapsible section: "Add location context (optional)".

### Issue 6: Search/trigram index
**Problem**: Current search builds a content string from job type name. Tags should also be searchable.
**Fix**: When building the trigram search content for a job, also append the tag names. Update `_jobTypeContentMap` to be `_jobContentMap` that includes tags.

### Issue 7: Airport industry from new_job_types.md
**Problem**: `new_job_types.md` proposed Airport as a new industry. With the new architecture, Airport is better as a TAG not a category — because airport jobs include cleaners, security, drivers, food counter (all different categories).
**Fix**: Add Airport as a tag. The airport-specific job types (Ground Staff, Baggage Handler, Cabin Crew) can go under a new category or under existing ones (Transport, Security, Office).
**Recommendation**: Add Airport as a tag. Add the unique airport roles (Counter Staff, Cabin Crew, Ground Staff, Baggage Handler, Passport/Immigration Staff) under a new "विमानतळ / एअरपोर्ट (Airport)" category since they are truly airport-specific roles. Other airport jobs (cleaner, security, driver) get the Airport tag.

### Issue 8: Facility Management from new_job_types.md
**Problem**: Facility Management (FM) jobs are cross-sector. An FM company does cleaning, security, helpdesk, etc.
**Fix**: FM-specific roles (Facility Supervisor, Shift Executive, Technical Executive) can go under the Cleaning category. Help Desk under Call Center/BPO. Pantry Boy under Cleaning. Users can add a tag if needed.

---

## Migration Steps (SQL)

The migration SQL should:
1. `BEGIN` transaction
2. Drop FK constraints
3. Remap duplicate job_type_ids in jobs table (CASE statement)
4. `DELETE FROM job_types` and `DELETE FROM industries`
5. `INSERT INTO industries` (now acting as job_categories) with new data
6. `INSERT INTO job_types` with deduplicated, renumbered data
7. Create `job_tags` table
8. Insert job tags
9. Create `job_posting_tags` table
10. Re-add FK constraints
11. Verify: `SELECT COUNT(*) FROM jobs j LEFT JOIN job_types jt ON jt.id = j.job_type_id WHERE jt.id IS NULL`
12. `COMMIT`

---

## Implementation Phases

### Phase 1: Database (1-2 hours)
- Write and test migration SQL
- Run in Supabase SQL editor
- Verify no orphaned job_type_ids

### Phase 2: Backend (2-3 hours)
- Update TypeScript types (`industry` → `category`)
- Update db-supabase.ts methods
- Update API routes (rename, add tags endpoints)
- Update job-types-cache.ts

### Phase 3: Frontend — Job Form (2-3 hours)
- Update JobTypePicker to use categories
- Add TagPicker component for job form
- Update JobForm to submit tag_ids
- Update JobCardInfo to display tags

### Phase 4: Frontend — Browse & Admin (1-2 hours)
- Update browse filters (category filter, tag filter)
- Update admin dashboard filters
- Update admin job types/categories management UI

### Phase 5: Testing (1 hour)
- Verify no existing job data lost
- Test job creation with tags
- Test filtering by category and tag
- Verify search includes tags

---

## Priority Order

1. **Database migration** — deduplicate job types, add tags tables (non-breaking, backward compat)
2. **API updates** — expose new categories and tags endpoints
3. **JobForm** — add tag picker (most user-visible improvement)
4. **Browse filters** — add tag filter to job search
5. **New job types** — Airport, Government, Automobile, Agriculture, Call Center categories
