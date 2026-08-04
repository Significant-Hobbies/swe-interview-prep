# Local SEO audit

Audited the production build on `http://127.0.0.1:4173` on 2026-08-05 with
the Fleet `seo-audit` script.

| Page | Passed | Failed | Warnings | Approx. words |
| --- | ---: | ---: | ---: | ---: |
| System design hub | 17 | 0 | 1 | 1,107 |
| Video streaming platform | 15 | 0 | 0 | 1,646 |
| Notification delivery service | 15 | 0 | 0 | 1,634 |
| Web crawler | 15 | 0 | 0 | 1,654 |
| Cloud file storage | 15 | 0 | 0 | 1,647 |
| Ride-sharing platform | 15 | 0 | 0 | 1,663 |
| Ticket-booking platform | 15 | 0 | 0 | 1,658 |

All page-level checks passed: title, description, canonical, Open Graph,
Twitter card, hreflang handling, JSON-LD, H1, heading hierarchy, image alt,
word count, SSR-leak detection, and internal-link validation.

The hub's only warning is intentional in the local audit: the audited URL uses
the localhost origin while the generated canonical and sitemap use
`https://learn.significanthobbies.com`. The production canonical is present in
the production sitemap; no exception is required after deployment.
