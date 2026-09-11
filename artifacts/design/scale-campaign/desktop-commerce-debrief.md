# Scale — Online store

Outcome: Challenge completed
Company hours: 179.8; challenge completed at 179.8
Users: 2038 / 2000 target
Cash: $2003.63
Monthly profit: $2927.22
p99: 90 ms; errors: 0.0%

Campaign: 2/2 events cleared; 2 attempts; $293 earned; 0 customers lost to service failures.

## Architecture
App size: 3; instances: 1
Database size: 4; indexing: true; Redis: false
Shards: 1; replicas per primary: 0
Queue: false; stream partitions: 0; workers: 0
Object storage: false; CDN: false; search: false
Connection pool: false; standby region: false; automatic failover: false
Complexity: 0; pending background jobs: 0
Infrastructure: $1150.08/month

## Recent decisions and incidents
- Hour 0.0: Online store. Catalog reads can be cached. Checkout writes keep reaching the database. Balance a fast browsing experience against a growing transactional path.
- Hour 1.1: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 3.1: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 4.3: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 6.3: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 7.5: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 9.5: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 11.1: Optimize the query path: started. 36 company hours to deploy. $120 setup cost; engineering burns $600/mo while active.
- Hour 47.1: Optimize the query path: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 48.3: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 49.4: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 49.9: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 51.0: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 53.1: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 53.1: Your launch gets noticed. Cautious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 77.1: Event cleared. Your launch gets noticed: 24.0 healthy hours out of 24. Reward $180. Review the result and choose the next move.
- Hour 77.1: Maintenance during business hours. Ambitious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 77.1: Safer operating mode. Extra traffic was curtailed or maintenance was rolled back. Maximum event reward reduced to a quarter; ordinary engineering and recovery remain available.
- Hour 101.1: Event cleared. Maintenance during business hours: 24.0 healthy hours out of 24. Reward $113. Review the result and choose the next move.
- Hour 179.8: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Balance a fast browsing experience against a growing transactional path.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
