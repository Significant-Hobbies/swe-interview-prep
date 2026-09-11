# Scale — AI gateway

Outcome: Challenge completed
Company hours: 126.0; challenge completed at 126.0
Users: 1013 / 1000 target
Cash: $818.86
Monthly profit: $2202.92
p99: 271 ms; errors: 0.0%

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
- Hour 1.4: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 3.4: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 5.0: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 7.0: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 8.2: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 10.2: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 11.4: Optimize the query path: started. 36 company hours to deploy. $120 setup cost; engineering burns $600/mo while active.
- Hour 47.4: Optimize the query path: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 49.0: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 50.1: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 52.6: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 53.7: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 55.8: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 56.9: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 57.0: Add an app instance: started. 8 company hours to deploy. $60 setup cost; engineering burns $600/mo while active.
- Hour 65.1: Add an app instance: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 66.6: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 126.0: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Diagnose application concurrency before scaling the database. Provider quotas, token economics, streaming and model routing are not modeled yet.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
