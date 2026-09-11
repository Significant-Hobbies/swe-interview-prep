# Scale — Tiny SaaS

Outcome: Challenge completed
Company hours: 224.7; challenge completed at 224.7
Users: 1179 / 1000 target
Cash: $3198.68
Monthly profit: $2840.95
p99: 70 ms; errors: 0.0%

Campaign: 2/2 events cleared; 3 attempts; $594 earned; 54 customers lost to service failures.

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
- Hour 0.5: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 0.5: Your launch gets noticed. Ambitious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 0.9: MySQL is under pressure. 63 requests waiting; 62% concurrency utilization. System p99 228ms, 9.2% errors. Organic growth pauses while the service target is missed. Database work is backing up. Compare indexing, read replicas, a larger database, and caching eligible reads. Indexes add write cost; Redis needs time to warm and cannot remove writes.
- Hour 13.0: MySQL is under pressure. 64 requests waiting; 100% concurrency utilization. System p99 486ms, 55.1% errors. Organic growth pauses while the service target is missed. Database work is backing up. Compare indexing, read replicas, a larger database, and caching eligible reads. Indexes add write cost; Redis needs time to warm and cannot remove writes.
- Hour 24.5: Event needs another attempt. Your launch gets noticed: 0.3 healthy hours out of 24. Reward $0. Keep your architecture, improve it, and retry. No reward was paid.
- Hour 24.5: Optimize the query path: started. 36 company hours to deploy. $120 setup cost; engineering burns $600/mo while active.
- Hour 25.0: MySQL is under pressure. 52 requests waiting; 100% concurrency utilization. System p99 489ms, 32.1% errors. Organic growth pauses while the service target is missed. Database work is backing up. Compare indexing, read replicas, a larger database, and caching eligible reads. Indexes add write cost; Redis needs time to warm and cannot remove writes.
- Hour 46.4: MySQL is under pressure. 61 requests waiting; 100% concurrency utilization. System p99 362ms, 3.0% errors. Organic growth pauses while the service target is missed. Database work is backing up. Compare indexing, read replicas, a larger database, and caching eligible reads. Indexes add write cost; Redis needs time to warm and cannot remove writes.
- Hour 58.4: MySQL is under pressure. 51 requests waiting; 100% concurrency utilization. System p99 413ms, 2.8% errors. Organic growth pauses while the service target is missed. Database work is backing up. Compare indexing, read replicas, a larger database, and caching eligible reads. Indexes add write cost; Redis needs time to warm and cannot remove writes.
- Hour 60.5: Optimize the query path: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 62.1: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 63.2: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 65.3: Your launch gets noticed. Ambitious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 89.3: Event cleared. Your launch gets noticed: 24.0 healthy hours out of 24. Reward $450. Review the result and choose the next move.
- Hour 89.3: Maintenance during business hours. Cautious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 89.4: Service interrupted by a component outage. 0 requests waiting; 80% concurrency utilization. System p99 63ms, 9.0% errors. Organic growth pauses while the service target is missed. A component is unavailable. Inspect the failed dependency and its failure domain before adding capacity. A standby application region cannot protect shared data services.
- Hour 113.3: Event cleared. Maintenance during business hours: 19.2 healthy hours out of 24. Reward $144. Review the result and choose the next move.
- Hour 224.7: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Learn when to optimize a query, buy a bigger machine, or add a cache.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
