# Parameterise instead of escaping

> Implement buildQuery(table, filters) returning { text, values }: a parameterised SQL string using $1, $2 … placeholders in order, plus the values array. Column names come from a fixed ALLOWED set — reject anything else by throwing. Never interpolate a value into the string.

Canonical: https://learn.significanthobbies.com/curriculum/drills/parameterise-a-query

Implement buildQuery(table, filters) returning { text, values }: a parameterised SQL string using $1, $2 … placeholders in order, plus the values array. Column names come from a fixed ALLOWED set — reject anything else by throwing. Never interpolate a value into the string.

## The mechanism

Almost every one of these is the same bug: data crossing into a place where it is interpreted as code or as authority. Injection (SQLi, XSS) is untrusted input reaching an interpreter, and the fix is never escaping-by-hand but parameterisation and contextual output encoding. CSRF is different in kind — a confused deputy, where the browser helpfully attaches your cookies to a request your site did not initiate, which is why the defence is an unguessable token or SameSite rather than validation. CORS is not a defence at all; it relaxes the same-origin policy, so a permissive CORS header removes protection rather than adding it.

## Expected evidence

buildQuery('users', {name:'ann', age:30}) -> { text: 'SELECT * FROM users WHERE name = $1 AND age = $2', values: ['ann', 30] }

## Hints

- Values are never concatenated. Identifiers cannot be parameterised, which is exactly why they need an allowlist.
- A value containing a quote must end up in `values` untouched, not escaped into `text`.

## Sources and practice

- [OWASP Cheat Sheet — Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Cheat Sheet — SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Study Web Security Basics](https://learn.significanthobbies.com/curriculum/concepts/web-security-basics)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/parameterise-a-query)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
