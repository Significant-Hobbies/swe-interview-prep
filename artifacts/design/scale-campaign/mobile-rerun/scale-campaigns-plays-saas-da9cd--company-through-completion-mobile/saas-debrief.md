# Scale — Tiny SaaS

Outcome: Challenge completed
Company hours: 186.5; challenge completed at 186.5
Users: 1015 / 1000 target
Cash: $2809.79
Monthly profit: $2431.33
p99: 74 ms; errors: 0.0%

Campaign: 2/2 events cleared; 2 attempts; $293 earned; 0 customers lost to service failures.

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
- Hour 2.8: Optimize the query path: started. 36 company hours to deploy. $120 setup cost; engineering burns $600/mo while active.
- Hour 38.8: Optimize the query path: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 40.8: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 41.9: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 42.4: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 42.4: Your launch gets noticed. Cautious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 66.4: Event cleared. Your launch gets noticed: 24.0 healthy hours out of 24. Reward $180. Review the result and choose the next move.
- Hour 66.4: Maintenance during business hours. Ambitious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 66.4: Safer operating mode. Extra traffic was curtailed or maintenance was rolled back. Maximum event reward reduced to a quarter; ordinary engineering and recovery remain available.
- Hour 90.4: Event cleared. Maintenance during business hours: 24.0 healthy hours out of 24. Reward $113. Review the result and choose the next move.
- Hour 186.5: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Learn when to optimize a query, buy a bigger machine, or add a cache.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
