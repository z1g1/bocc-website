# Future Work & Open Questions

## Automated Event startDate in Structured Data

The JSON-LD in `_includes/head/custom.html` has a hardcoded `startDate` for the next event occurrence. The `eventSchedule` property with `repeatFrequency: P1W` and `byDay: Tuesday` handles the recurring signal for Google, but `startDate` should ideally stay near-future.

### Recommended approach
GitHub Actions weekly cron + Liquid template to calculate next Tuesday at build time.

### Concerns
1. **Google doesn't crawl on your schedule.** Even with weekly rebuilds, Google may cache old pages for days/weeks. `eventSchedule` is more important than `startDate` for recurring events.
2. **Christmas exclusion logic.** Event skips the last 2 weeks of December. Need to define exact dates (Dec 18-31? Dec 22-31?) — varies by year.
3. **GitHub Actions cron is best-effort.** Not SLA-backed; may be delayed or skipped during high load.
4. **Silent build failures.** If a cron-triggered build fails, the site stays on the old version. Need failure notifications.
5. **Effort vs benefit.** Google uses `eventSchedule` as the primary signal for recurring events. Manual updates once or twice a year may be sufficient.

### Decision
Deferred — `eventSchedule` is doing the heavy lifting. Revisit if Google Search Console shows issues with event rich results.

---

## Needs User Input

### Dual Eventbrite Event IDs (UX R5)
The homepage header CTA links to event `1112864570889` while the embedded widget uses `1983098086761`. Need to confirm which is current and unify.

### Sponsor Contact Form (UX R2)
The same Google Form is used for sponsorship inquiries, Code of Conduct violation reports, and general contact. A separate form for sponsorship would improve professionalism. Requires creating a new Google Form.

### sessionStorage vs localStorage for Check-in (UX R4)
Phase 2 security fixes switched from localStorage to sessionStorage (4-hour TTL). This means returning visitors are never recognized week-to-week. Options:
- Switch back to localStorage with 30-day TTL (better UX, slightly more PII exposure risk on shared devices)
- Store only a non-PII identifier in localStorage and re-fetch from backend (best of both worlds, requires backend work)
- Keep sessionStorage (most private, worst returning-visitor UX)

### Sponsor Redirect After Check-in (UX R7)
The sponsorship page promises a "Redirect link on BOCC's digital Check-in App" but this is not implemented in `checkin.js`. Needs design decision on how to surface sponsor content post-check-in.

### Parking/Transit/Wayfinding Info (UX R13)
Would reduce first-visit friction. Needs someone with local knowledge to write the content.

### Coffee and Code / BOCC Afternoon Events (UX R16)
Check-in pages exist for these events but they are not mentioned anywhere on the main site. Need to confirm if they are active and should be promoted.
