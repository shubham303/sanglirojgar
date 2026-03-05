-- Migration: Reset industries & job_types with new data
-- Run this in Supabase SQL Editor as a single script
-- Safe to rerun — all steps are idempotent

BEGIN;

-- ============================================
-- STEP 1: Drop all constraints
-- ============================================
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_job_type_id_fkey;
ALTER TABLE job_types DROP CONSTRAINT IF EXISTS job_types_industry_id_fkey;
ALTER TABLE job_types DROP CONSTRAINT IF EXISTS job_types_name_mr_key;
ALTER TABLE job_types DROP CONSTRAINT IF EXISTS job_types_name_mr_industry_id_key;

-- ============================================
-- STEP 2: Remap job_type_id in jobs table
-- (only if old data still exists — skip on rerun)
-- ============================================
UPDATE jobs SET job_type_id = CASE job_type_id
  -- General (industry 1)
  WHEN 1 THEN 1    -- सेल्समन
  WHEN 2 THEN 2    -- डिलिव्हरी बॉय
  WHEN 5 THEN 3    -- सुरक्षा रक्षक
  WHEN 6 THEN 4    -- ड्रायव्हर
  WHEN 7 THEN 5    -- मेकॅनिक
  WHEN 12 THEN 6   -- शिपाई
  WHEN 13 THEN 7   -- सफाई कर्मचारी
  WHEN 14 THEN 8   -- रिसेप्शनिस्ट
  WHEN 15 THEN 9   -- दुकान सहाय्यक
  WHEN 16 THEN 10  -- गोडाउन कामगार
  WHEN 17 THEN 11  -- हेल्पर
  WHEN 18 THEN 12  -- सुपरवायझर
  WHEN 19 THEN 13  -- टेलिकॉलर
  WHEN 20 THEN 14  -- एचआर
  WHEN 21 THEN 15  -- बँक कर्मचारी
  WHEN 22 THEN 16  -- कॉम्प्युटर ऑपरेटर
  WHEN 27 THEN 17  -- ऑफिस सहाय्यक
  WHEN 28 THEN 18  -- फील्ड वर्कर
  WHEN 29 THEN 19  -- इंजिनिअर
  WHEN 31 THEN 20  -- मार्केटिंग
  WHEN 32 THEN 21  -- अकाउंटंट
  WHEN 34 THEN 22  -- इतर
  -- Hospital (industry 2)
  WHEN 24 THEN 23  -- नर्स
  WHEN 25 THEN 24  -- तंत्रज्ञ
  -- Hotel (industry 3)
  WHEN 3 THEN 38   -- स्वयंपाकी
  WHEN 4 THEN 39   -- वेटर
  -- Manufacturing (industry 4)
  WHEN 26 THEN 46  -- मशीन ऑपरेटर
  WHEN 33 THEN 47  -- कामगार
  -- Construction (industry 5)
  WHEN 8 THEN 53   -- इलेक्ट्रिशियन
  WHEN 9 THEN 54   -- प्लंबर
  WHEN 10 THEN 55  -- सुतार
  -- Education (industry 6)
  WHEN 23 THEN 61  -- शिक्षक
  -- IT & Digital (industry 11) — moved from General
  WHEN 30 THEN 90  -- व्हिडिओ एडिटर
  ELSE job_type_id
END
WHERE EXISTS (
  SELECT 1 FROM job_types WHERE id = 43 AND name_mr = 'हाउसकीपिंग'
);

-- ============================================
-- STEP 3: Clear old data
-- ============================================
DELETE FROM job_types;
DELETE FROM industries;

-- ============================================
-- STEP 4: Insert new industries
-- ============================================
INSERT INTO industries (id, name_mr, name_en) VALUES
  (1,  'सामान्य',          'General'),
  (2,  'हॉस्पिटल',        'Hospital'),
  (3,  'हॉटेल',            'Hotel'),
  (4,  'उत्पादन',          'Manufacturing'),
  (5,  'बांधकाम',          'Construction'),
  (6,  'शिक्षण',           'Education'),
  (7,  'रिटेल',            'Retail'),
  (9,  'वाहतूक',           'Transport'),
  (10, 'सौंदर्य व निगा',    'Beauty & Wellness'),
  (11, 'आयटी व डिजिटल',    'IT & Digital'),
  (12, 'फायनान्स व विमा',   'Finance & Insurance'),
  (13, 'घरगुती सेवा',       'Domestic Services');

-- ============================================
-- STEP 5: Insert new job_types
-- ============================================
INSERT INTO job_types (id, name_mr, name_en, industry_id) VALUES
  -- General (1)
  (1,  'सेल्समन',           'Salesman',          1),
  (2,  'डिलिव्हरी बॉय',     'Delivery Boy',      1),
  (3,  'सुरक्षा रक्षक',     'Security Guard',    1),
  (4,  'ड्रायव्हर',          'Driver',            1),
  (5,  'मेकॅनिक',           'Mechanic',          1),
  (6,  'शिपाई',             'Peon',              1),
  (7,  'सफाई कर्मचारी',     'Cleaner',           1),
  (8,  'रिसेप्शनिस्ट',      'Receptionist',      1),
  (9,  'दुकान सहाय्यक',     'Shop Assistant',    1),
  (10, 'गोडाउन कामगार',     'Warehouse Worker',  1),
  (11, 'हेल्पर',            'Helper',            1),
  (12, 'सुपरवायझर',         'Supervisor',        1),
  (13, 'टेलिकॉलर',          'Telecaller',        1),
  (14, 'एचआर',              'HR',                1),
  (15, 'बँक कर्मचारी',      'Bank Staff',        1),
  (16, 'कॉम्प्युटर ऑपरेटर', 'Computer Operator', 1),
  (17, 'ऑफिस सहाय्यक',      'Office Assistant',  1),
  (18, 'फील्ड वर्कर',       'Field Worker',      1),
  (19, 'इंजिनिअर',          'Engineer',          1),
  (20, 'मार्केटिंग',         'Marketing',         1),
  (21, 'अकाउंटंट',          'Accountant',        1),
  (22, 'इतर',               'Other',             1),
  -- Hospital (2)
  (23, 'नर्स',              'Nurse',              2),
  (24, 'तंत्रज्ञ',          'Technician',         2),
  (25, 'आरएमओ',             'RMO',                2),
  (26, 'ओटी तंत्रज्ञ',      'OT Technician',      2),
  (27, 'कॅथलॅब तंत्रज्ञ',   'Cathlab Technician', 2),
  (28, 'परफ्युजनिस्ट',      'Perfusionist',       2),
  (29, 'हाउसकीपिंग',        'Housekeeping',       2),
  (30, 'सीएचओ',             'CHO',                2),
  (31, 'फार्मासिस्ट',       'Pharmacist',         2),
  (32, 'लॅब टेक्निशियन',    'Lab Technician',     2),
  (33, 'रेडिओलॉजिस्ट',      'Radiologist',        2),
  (34, 'फिजिओथेरपिस्ट',     'Physiotherapist',    2),
  (35, 'आहारतज्ज्ञ',        'Dietician',          2),
  (36, 'वॉर्ड बॉय',         'Ward Boy',           2),
  (37, 'सीएसएसडी तंत्रज्ञ', 'CSSD Technician',    2),
  -- Hotel (3)
  (38, 'स्वयंपाकी',         'Cook',           3),
  (39, 'वेटर',              'Waiter',         3),
  (40, 'किचन हेल्पर',       'Kitchen Helper', 3),
  (41, 'कॅशियर',            'Cashier',        3),
  (42, 'हाउसकीपिंग',        'Housekeeping',   3),
  (43, 'बार टेंडर',         'Bartender',      3),
  (44, 'बेकर',              'Baker',          3),
  -- Manufacturing (4)
  (45, 'वेल्डर',            'Welder',            4),
  (46, 'मशीन ऑपरेटर',       'Machine Operator',  4),
  (47, 'कामगार',            'Worker',            4),
  (48, 'फिटर',              'Fitter',            4),
  (49, 'टर्नर',             'Turner',            4),
  (50, 'क्वालिटी इन्स्पेक्टर','Quality Inspector', 4),
  (51, 'पॅकिंग कामगार',      'Packing Worker',    4),
  (52, 'फोरमन',             'Foreman',           4),
  -- Construction (5)
  (53, 'इलेक्ट्रिशियन',     'Electrician',       5),
  (54, 'प्लंबर',            'Plumber',           5),
  (55, 'सुतार',             'Carpenter',         5),
  (56, 'गवंडी',             'Mason',             5),
  (57, 'रंगारी',            'Painter',           5),
  (58, 'टाइल कामगार',       'Tile Worker',       5),
  (59, 'सेंटरिंग कामगार',    'Centering Worker',  5),
  (60, 'लोहार',             'Blacksmith',        5),
  -- Education (6)
  (61, 'शिक्षक',            'Teacher',          6),
  (62, 'प्राथमिक शिक्षक',   'Primary Teacher',  6),
  (63, 'माध्यमिक शिक्षक',   'Secondary Teacher', 6),
  (64, 'लेक्चरर',           'Lecturer',         6),
  (65, 'प्रयोगशाळा सहाय्यक','Lab Assistant',     6),
  (66, 'शाळा क्लर्क',       'School Clerk',     6),
  (67, 'स्पोर्ट्स कोच',     'Sports Coach',     6),
  (68, 'संगीत शिक्षक',      'Music Teacher',    6),
  -- Retail (7)
  (69, 'दुकान सहाय्यक',     'Shop Assistant',     7),
  (70, 'कॅशियर',            'Cashier',            7),
  (71, 'स्टॉक कीपर',        'Stock Keeper',       7),
  (72, 'शोरूम सेल्समन',     'Showroom Salesman',  7),
  (73, 'बिलिंग क्लर्क',     'Billing Clerk',      7),
  -- Transport (9)
  (74, 'ट्रक ड्रायव्हर',    'Truck Driver',      9),
  (75, 'टेम्पो ड्रायव्हर',  'Tempo Driver',      9),
  (76, 'डिलिव्हरी बॉय',     'Delivery Boy',      9),
  (77, 'लोडिंग कामगार',      'Loading Worker',    9),
  (78, 'गोडाउन कामगार',     'Warehouse Worker',  9),
  (79, 'वाहन क्लिनर',       'Vehicle Cleaner',   9),
  -- Beauty & Wellness (10)
  (80, 'हेअर स्टायलिस्ट',   'Hair Stylist',      10),
  (81, 'ब्युटिशियन',        'Beautician',        10),
  (82, 'मेहंदी कलाकार',      'Mehndi Artist',     10),
  (83, 'स्पा थेरपिस्ट',     'Spa Therapist',     10),
  (84, 'नेल टेक्निशियन',    'Nail Technician',   10),
  -- IT & Digital (11)
  (85, 'सॉफ्टवेअर डेव्हलपर', 'Software Developer',    11),
  (86, 'वेब डिझायनर',        'Web Designer',          11),
  (87, 'ग्राफिक डिझायनर',    'Graphic Designer',      11),
  (88, 'डेटा एन्ट्री',      'Data Entry',            11),
  (89, 'सोशल मीडिया मॅनेजर', 'Social Media Manager',  11),
  (90, 'व्हिडिओ एडिटर',     'Video Editor',          11),
  -- Finance & Insurance (12)
  (91, 'लोन एजंट',           'Loan Agent',            12),
  (92, 'विमा एजंट',          'Insurance Agent',       12),
  (93, 'अकाउंट्स एक्झिक्युटिव','Accounts Executive',  12),
  (94, 'कॅशियर',             'Cashier',               12),
  (95, 'फायनान्शियल अॅडव्हायझर','Financial Advisor',   12),
  -- Domestic Services (13)
  (96, 'घरकाम',              'Maid',        13),
  (97, 'स्वयंपाकी',          'Cook',        13),
  (98, 'बेबीसिटर',           'Babysitter',  13),
  (99, 'वृद्ध सेवा',         'Elder Care',  13),
  (100,'गार्डनर',            'Gardener',    13);

-- ============================================
-- STEP 6: Re-add constraints
-- ============================================
ALTER TABLE job_types
  ADD CONSTRAINT job_types_industry_id_fkey
  FOREIGN KEY (industry_id) REFERENCES industries(id);

ALTER TABLE job_types
  ADD CONSTRAINT job_types_name_mr_industry_id_key
  UNIQUE (name_mr, industry_id);

ALTER TABLE jobs
  ADD CONSTRAINT jobs_job_type_id_fkey
  FOREIGN KEY (job_type_id) REFERENCES job_types(id);

-- ============================================
-- STEP 7: Verify — should return 0 rows
-- ============================================
SELECT j.id, j.job_type_id
FROM jobs j
LEFT JOIN job_types jt ON jt.id = j.job_type_id
WHERE jt.id IS NULL AND j.is_deleted = false;

COMMIT;
