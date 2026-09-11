# Scale — Online store

Outcome: Challenge completed
Company hours: 131.7; challenge completed at 131.7
Users: 2029 / 2000 target
Cash: $1626.46
Monthly profit: $2908.31
p99: 96 ms; errors: 0.0%

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
- Hour 0.5: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 2.5: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 3.7: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 5.7: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 7.3: Upgrade MySQL: started. 2 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 9.3: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 10.5: Optimize the query path: started. 36 company hours to deploy. $120 setup cost; engineering burns $600/mo while active.
- Hour 46.5: Optimize the query path: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 48.1: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 49.2: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 51.3: Upgrade the app server: started. 1 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 52.4: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 52.5: Your launch found its audience. Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.
- Hour 131.7: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Balance a fast browsing experience against a growing transactional path.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
