# Scale — AI gateway

Outcome: Challenge completed
Company hours: 172.1; challenge completed at 172.1
Users: 1036 / 1000 target
Cash: $1152.85
Monthly profit: $2294.89
p99: 241 ms; errors: 0.0%

Campaign: 2/2 events cleared; 2 attempts; $293 earned; 0 customers lost to service failures.

## Architecture
App size: 4; instances: 2
Database size: 4; indexing: true; Redis: false
Shards: 1; replicas per primary: 0
Queue: false; stream partitions: 0; workers: 0
Object storage: false; CDN: false; search: false
Connection pool: false; standby region: false; automatic failover: false
Complexity: 2; pending background jobs: 0
Infrastructure: $1851.49/month

## Recent decisions and incidents
- Hour 0.0: AI gateway. Slow request processing, little cache reuse, and a rapidly growing client base. Diagnose application concurrency before scaling the database. Provider quotas, token economics, streaming and model routing are not modeled yet.
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
- Hour 53.1: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 54.2: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 54.3: Add an app instance: started. 8 company hours to deploy. $60 setup cost; engineering burns $600/mo while active.
- Hour 62.4: Add an app instance: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 63.9: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 63.9: Your launch gets noticed. Cautious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 87.9: Event cleared. Your launch gets noticed: 24.0 healthy hours out of 24. Reward $180. Review the result and choose the next move.
- Hour 87.9: Maintenance during business hours. Ambitious approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.
- Hour 87.9: Safer operating mode. Extra traffic was curtailed or maintenance was rolled back. Maximum event reward reduced to a quarter; ordinary engineering and recovery remain available.
- Hour 111.9: Event cleared. Maintenance during business hours: 24.0 healthy hours out of 24. Reward $113. Review the result and choose the next move.
- Hour 172.1: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Diagnose application concurrency before scaling the database. Provider quotas, token economics, streaming and model routing are not modeled yet.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
