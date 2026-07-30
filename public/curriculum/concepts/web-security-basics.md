# Web Security Basics

XSS, CSRF, SQL injection, and CORS — the injection and confused-deputy bugs that keep recurring.

- Difficulty: core
- Tracks: Backend

## Mental model

Almost every one of these is the same bug: data crossing into a place where it is interpreted as code or as authority. Injection (SQLi, XSS) is untrusted input reaching an interpreter, and the fix is never escaping-by-hand but parameterisation and contextual output encoding. CSRF is different in kind — a confused deputy, where the browser helpfully attaches your cookies to a request your site did not initiate, which is why the defence is an unguessable token or SameSite rather than validation. CORS is not a defence at all; it relaxes the same-origin policy, so a permissive CORS header removes protection rather than adding it.

## Where it matters

The OWASP categories that dominate real breaches, and the review checklist for any endpoint that takes user input.

## Common mistakes

- Treating CORS as a security control — it grants access, it does not restrict it
- Escaping output once globally instead of per context; HTML, attribute, URL and JS contexts need different encodings
- Blocklisting dangerous input instead of parameterising the query
- Storing session tokens in localStorage, which is readable by any XSS you ever ship

## Primary sources

- [OWASP Cheat Sheet — Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) (doc)
- [OWASP Cheat Sheet — SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (doc)

## Practice

### Parameterise instead of escaping

Implement buildQuery(table, filters) returning { text, values }: a parameterised SQL string using $1, $2 … placeholders in order, plus the values array. Column names come from a fixed ALLOWED set — reject anything else by throwing. Never interpolate a value into the string.

**Expected evidence:** buildQuery('users', {name:'ann', age:30}) -> { text: 'SELECT * FROM users WHERE name = $1 AND age = $2', values: ['ann', 30] }

## Review prompts

- A reviewer says 'we set CORS headers, so the API is protected from other sites.' Why is that backwards, and what actually defends the endpoint?


## Prerequisites

- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems.html)

## Related concepts

- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design.html)
- [Security & Isolation Boundaries](https://learn.significanthobbies.com/curriculum/concepts/security-isolation-boundaries.html)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w.html)
