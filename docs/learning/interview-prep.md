---
title: Interview prep — checklist + where to apply
audited: 2026-06-16
---

# Interview prep

The "Apply" half of the Concept → Drill → Build → Review → **Apply** loop. Pairs with the in-app `/practice` tab.

This page has two parts: (1) a breadth-first checklist of what SWE interviews actually test, and (2) a curated reference of remote-friendly companies to ship that prep into real applications.

---

# Part 1 — The topic checklist

Use this as a self-audit. Walk every row, decide whether you can already explain it to a duck in three sentences. Anything you can't → FSRS queue in `/practice`.

For depth, follow the linked roadmap or canonical source. This page deliberately does not re-author content covered in the dedicated docs.

Source layout adapted from Atul Kumar's [Interview Roadmap sheet](https://www.linkedin.com/in/atul-kumar-58727488/).

| Category | What it covers | Where to learn it |
|---|---|---|
| **Data structures** | Arrays, linked lists, queues, stacks, hash tables, graphs, Bloom filters, trees (binary, BST, B-trees, red-black), heaps, disjoint sets | [MIT 6.006 (OCW)](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) · [NeetCode 150 roadmap](https://neetcode.io/roadmap) · in-app `/learn` → DSA |
| **Mathematics** | Probability, statistics, common series | [Khan Academy — Prob & Stats](https://www.khanacademy.org/math/statistics-probability) · [3Blue1Brown — Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra) |
| **Algorithmic concepts** | Time & space complexity, master theorem, recurrences | [Big-O cheat sheet](https://www.bigocheatsheet.com/) · [MIT 6.006 lecture 2](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) |
| **Algorithms** | Sorting, divide & conquer, DP (1-D and 2-D), greedy, backtracking, NP-complete classes, randomized algorithms | [NeetCode roadmap](https://neetcode.io/roadmap) · [Algorithms (Dasgupta et al.) — free PDF](https://people.eecs.berkeley.edu/~vazirani/algorithms.html) · [CPH (Laaksonen) — free PDF](https://cses.fi/book/book.pdf) |
| **Operating systems** | Process scheduling, sync & deadlocks, memory mgmt, file systems, threading vs processes | [OSTEP (Arpaci-Dusseaus)](https://pages.cs.wisc.edu/~remzi/OSTEP/) · [MIT 6.1810 xv6 labs](https://pdos.csail.mit.edu/6.1810/) |
| **Databases** | Relational algebra, schema design, SQL | [Use The Index, Luke](https://use-the-index-luke.com/) · [SQLBolt](https://sqlbolt.com/) · [DB book](https://www.db-book.com/) |
| **Database use** | ACID, BASE, CAP, partitioning, sharding, indexing, replication, transactions | [CMU 15-445 (Pavlo)](https://15445.courses.cs.cmu.edu/) · [DDIA](https://dataintensive.net/) · [Disk-First DB roadmap](./db-roadmap.md) ⭐ |
| **Networks** | OSI, HTTP/1/2/3, WebSocket, TCP/IP, checksums | [HPBN (Grigorik)](https://hpbn.co/) · [Beej's Guide](https://beej.us/guide/bgnet/) |
| **Distributed systems** | Two-generals, Byzantine failures, consensus (Raft, Paxos), distributed locks, leader election | [MIT 6.824](https://pdos.csail.mit.edu/6.824/) · [DDIA ch. 5/8/9](https://dataintensive.net/) · [Raft paper](https://raft.github.io/raft.pdf) · [Jepsen analyses](https://jepsen.io/analyses) |
| **Compilers** | Compilation lifecycle, JIT, key optimisations | [Crafting Interpreters (Nystrom)](https://craftinginterpreters.com/) · [Engineering a Compiler](https://www.elsevier.com/books/engineering-a-compiler/cooper/978-0-12-088478-0) |
| **OOP & LLD** | Design patterns, SOLID, dependency injection, "design X" problems | [System design (LLD section)](./system-design.md) ⭐ · [Refactoring.guru](https://refactoring.guru/design-patterns) |
| **Programming language** | Closures, futures, monads, type inference, GC, BEAM/JVM/V8 internals | [Runtime roadmap](./runtime-roadmap.md) ⭐ |
| **Microservice architecture** | Decomposition, SAGA, Strangler, sidecar | [microservices.io (Richardson)](https://microservices.io/) · [System design](./system-design.md) |
| **System design (HLD)** | Requirements, capacity, components, deploy, messaging, queues, infra | [System design (HLD section)](./system-design.md) ⭐ · [HelloInterview](https://www.hellointerview.com/learn/system-design) · [DDIA](https://dataintensive.net/) |
| **Caching** | In-memory vs distributed, Redis vs Memcached, write-through/back, eviction (LRU, MRU) | [Redis caching patterns](https://redis.io/docs/manual/client-side-caching/) · [Discord — Trillions of messages](https://discord.com/blog/how-discord-stores-trillions-of-messages) |
| **Load balancing** | L3/L4/L7, API gateway, SSL term, hot keys, DNS | [NGINX upstream](https://nginx.org/en/docs/http/load_balancing.html) · [Envoy listeners & filters](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/intro/arch_overview) |
| **Machine learning** | Supervised/unsupervised basics, neural nets, KFold, inference deployment | [fast.ai](https://course.fast.ai/) · [Karpathy Zero-to-Hero](https://karpathy.ai/zero-to-hero.html) · [ML case studies](./ml-case-studies.md) ⭐ |
| **Miscellaneous** | Latency numbers, MapReduce, serialization, mutex/semaphore, lock-free DS, OT | [Norvig/Dean latency numbers](https://gist.github.com/jboner/2841832) · [Art of Multiprocessor Programming](https://www.elsevier.com/books/the-art-of-multiprocessor-programming/herlihy/978-0-12-415950-1) · [Google SRE book](https://sre.google/books/) |

⭐ = the project's own deeper writeup.

## Behavioural / Leadership

Not in Atul Kumar's roadmap but every loop has at least one round of this.

- [STAR method](https://www.themuse.com/advice/star-interview-method) — the universal answer shape.
- [Manager READMEs catalog](https://managerreadme.com/) — read 5 to internalise what eng managers care about.
- [Lattice — Behavioural interview question bank](https://lattice.com/library/100-behavioral-interview-questions) — practice 10 against your last project.

---

# Part 2 — Remote-friendly companies (where to apply)

A reference for where to look when applying. The canonical PDF this draws from was compiled by [Atul Kumar (LinkedIn)](https://www.linkedin.com/in/atul-kumar-58727488/) — ~500 companies grouped by region, marked as offering remote roles. Treat his PDF as the source of truth for the long tail.

## Where to actually find remote roles in 2026

Job-board indexes change faster than any single PDF. Pair the curated list below with at least two of these:

- [Remote OK](https://remoteok.com/) — high volume, tech-leaning, filterable.
- [We Work Remotely](https://weworkremotely.com/) — oldest large board; volume real, quality mixed.
- [Remotive](https://remotive.com/) — curated, lower volume, higher signal.
- [Wellfound (ex-AngelList Talent)](https://wellfound.com/) — startup-skewed.
- [Hacker News "Who is hiring?" monthly threads](https://news.ycombinator.com/submitted?id=whoishiring) — best signal:noise for senior+.
- [Working Nomads](https://www.workingnomads.com/jobs)
- LinkedIn Jobs with the Remote filter.

## How to use the list

1. **Pick 8–12 target companies**, not 50. Each gets its own research log: what they do, why you'd want to work there, who to reach out to.
2. **Read their engineering blog before the interview** — the [ML system design case studies](./ml-case-studies.md) doc indexes many of them by category.
3. **Track applications in a single sheet** with status (applied / responded / interviewing / closed).
4. **Time-box.** Two months focused beats six months vague.

## Curated subset — fully remote / worldwide

The recognisable ~80 with the broadest geographic eligibility. For the rest of the ~500 (regional or smaller orgs), the source PDF + the job boards above will fill the long tail.

1Password · Aha! · Airbyte · Andela · Articulate · Atlassian · Auth0 · Automattic · Balena · Basecamp · BairesDev · Bandcamp · Buffer · Canonical · Chess.com · CircleCI · Clevertech · ClickUp · Close · Coinbase · Crowdstrike · Customer.io · Datadog · DataStax · Discourse · DNSimple · Doist · DigitalOcean · Dropbox · DuckDuckGo · Elastic · Envato · Epic Games · Etsy · Fastly · Fauna · FingerprintJS · Fly.io · Formstack · Ghost Foundation · GitHub · GitLab · GoDaddy · Graylog · Groove · HashiCorp · Heap · Help Scout · Honeybadger · Hotjar · IBM · Intercom · Invision · IPInfo · Iterative · Kaggle · Kinsta · Komoot · Kraken · Labelbox · Lightbend · Linux Foundation · Litmus · Mapbox · MetaMask · Microsoft · MongoDB · Mozilla · Muck Rack · Mux · Netguru · Nvidia · Octopus Deploy · Okta · Oracle · Percona · Polygon · Prisma · Puppet · QuestDB · Quora · Ramp · Rackspace · ReCharge · Red Hat · Replit · Revolut · Rocket.Chat · Salesforce · Scandit · ScyllaDB · Shopify · Sticker Mule · Strapi · StreamNative · Stripe · SUSE · Toptal · Trello · Turing · Twilio · Udacity · Vercel · VMware · Wikimedia · Wizeline · Wolfram · X-Team · Xapo · Yandex · Zapier.

## Regional standouts

- **North America (US/CA only)**: Discord, Docker, Reddit, Coursera, Khan Academy, PagerDuty, Stitch Fix, Capital One Tech, Astronomer, Modern Health.
- **Europe (incl. UK)**: Cabify (ES), Comet (FR), Lifen (FR/DE/UK), GitBook (FR), Pleo (EU+Africa), MailerLite, Mixcloud, Toggl, SoftwareMill, FactorialHR, FullFabric, OpenZeppelin.
- **Asia / India / Japan**: Mercari (JP), LINE Plus (KR), Flip (ID), Kiprosh, Adaface, Coingape, Inshorts, ChatGen.
- **Latin America (BR mostly)**: StoneCo, XP Inc, Coodesh, Truelogic, Pragma, Superplayer & Co, Zup, ZAMP.

For the full ~500-row list with primary regions per company, refer to the source PDF.

---

# Reference books (one is enough)

- **[Cracking the Coding Interview (McDowell)](https://www.crackingthecodinginterview.com/)** — the DSA / behavioural classic.
- **[Designing Data-Intensive Applications (Kleppmann)](https://dataintensive.net/)** — the one HLD book.
- **[System Design Interview Vol 1 + 2 (Alex Xu)](https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF)** — modern catalogue.
- **[Head First Design Patterns (Freeman & Robson)](https://www.oreilly.com/library/view/head-first-design/9781492077992/)** — the LLD classic.

## Companion docs in this project

- [System design — LLD + HLD](./system-design.md) ⭐ — the deep version of the LLD / HLD rows above.
- [Disk-First DB roadmap](./db-roadmap.md) — for the database rows.
- [Runtime roadmap](./runtime-roadmap.md) — for the programming-language row.
- [ML system design case studies](./ml-case-studies.md) — for the ML row.
- [SE Landscape](./swe-landscape.md) — broader survey of every domain in the table above.

## Maintenance notes

- Company remote policies shift fast. Re-verify on the careers page before assuming a role is remote.
- NeetCode reorganises sporadically; `/roadmap` URL has been stable since 2023.
- CMU 15-445 URL is unversioned (302s to the latest year).
- MIT 6.S081 was renumbered to 6.1810; same materials.
