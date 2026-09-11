# Scale — Tiny SaaS

Outcome: Challenge completed
Company hours: 139.6; challenge completed at 139.6
Users: 1010 / 1000 target
Cash: $2423.72
Monthly profit: $2419.10
p99: 71 ms; errors: 0.0%

## Architecture
App size: 2; instances: 1
Database size: 1; indexing: true; Redis: false
Shards: 1; replicas per primary: 0
Queue: false; stream partitions: 0; workers: 0
Object storage: false; CDN: false; search: false
Connection pool: false; standby region: false; automatic failover: false
Complexity: 0; pending background jobs: 0
Infrastructure: $107.40/month

## Recent decisions and incidents
- Hour 0.0: Tiny SaaS. Repeated dashboard reads, a forgiving budget, and time to learn the basics. Learn when to optimize a query, buy a bigger machine, or add a cache.
- Hour 1.6: Optimize the query path: started. 36 company hours to deploy. $120 setup cost; engineering burns $600/mo while active.
- Hour 37.6: Optimize the query path: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 38.8: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 39.9: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 42.4: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 139.6: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Learn when to optimize a query, buy a bigger machine, or add a cache.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
