# Future: Employer Notification on Job Expiry

## Overview
When a job listing expires (30 days after creation/reactivation), notify the employer via WhatsApp and/or SMS so they can reactivate if the position is still open.

## WhatsApp Business API
- Choose provider: Meta Cloud API (direct) vs aggregators (Gupshup, Twilio, Wati)
- Register a WhatsApp Business number
- Create message templates and get them approved
- DLT registration required for India (TRAI compliance)

## SMS Integration
- Choose provider: Twilio, MSG91, or Textlocal (India-friendly)
- Register DLT templates with TRAI for transactional SMS
- Template example: "तुमची '{job_type}' जाहिरात कालबाह्य झाली आहे. पुन्हा सक्रिय करण्यासाठी भेट द्या: {link}"

## Pre-expiry Warnings
- Send reminder 3 days before expiry (day 27)
- Include a deep link to the employer dashboard for one-tap reactivation
- Template: "तुमची जाहिरात 3 दिवसांत कालबाह्य होणार आहे..."

## Reactivation Deep Links
- Generate a tokenized URL: `/employer/{phone}?reactivate={job_id}`
- On visit, auto-reactivate the job and reset the 30-day timer

## Implementation Steps
1. Pick and integrate WhatsApp provider
2. Register DLT templates for both WhatsApp and SMS
3. Replace `notifyEmployerExpired()` stub in `/api/cron/expire-jobs`
4. Add pre-expiry cron (runs daily, checks for jobs expiring in 3 days)
5. Build reactivation deep link handler
