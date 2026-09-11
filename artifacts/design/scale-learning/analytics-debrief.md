# Scale — Event analytics

Outcome: Challenge completed
Company hours: 372.8; challenge completed at 372.8
Users: 2517 / 2250 target
Cash: $1959.29
Monthly profit: $4216.89
p99: 279 ms; errors: 0.0%

## Architecture
App size: 2; instances: 1
Database size: 2; indexing: false; Redis: false
Shards: 2; replicas per primary: 0
Queue: false; stream partitions: 0; workers: 0
Object storage: false; CDN: false; search: false
Connection pool: false; standby region: false; automatic failover: false
Complexity: 4; pending background jobs: 0
Infrastructure: $314.40/month

## Recent decisions and incidents
- Hour 94.3: Shard the database: started. 72 company hours to deploy. $400 setup cost; engineering burns $600/mo while active.
- Hour 97.0: MySQL is under pressure. 63 requests waiting; 100% concurrency utilization. System p99 504ms, 51.8% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 109.1: MySQL is under pressure. 63 requests waiting; 100% concurrency utilization. System p99 488ms, 50.3% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 121.2: MySQL is under pressure. 63 requests waiting; 100% concurrency utilization. System p99 504ms, 53.1% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 133.3: MySQL is under pressure. 59 requests waiting; 100% concurrency utilization. System p99 496ms, 50.9% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 145.4: MySQL is under pressure. 62 requests waiting; 100% concurrency utilization. System p99 499ms, 47.4% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 157.5: MySQL is under pressure. 61 requests waiting; 100% concurrency utilization. System p99 495ms, 48.9% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 166.3: Shard the database: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 168.1: Primary application region unavailable. A 12-hour application outage began. A standby region can take over after its routing delay; shared data dependencies remain unprotected.
- Hour 169.6: MySQL is under pressure. 0 requests waiting; 11% concurrency utilization. System p99 480ms, 100.0% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 180.2: Primary application region restored. The primary app tier is reachable again. Check whether backlog and errors have recovered.
- Hour 188.4: MySQL is under pressure. 64 requests waiting; 100% concurrency utilization. System p99 452ms, 2.6% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 200.5: MySQL is under pressure. 62 requests waiting; 100% concurrency utilization. System p99 506ms, 8.3% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 212.6: MySQL is under pressure. 58 requests waiting; 100% concurrency utilization. System p99 484ms, 13.8% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 224.7: MySQL is under pressure. 63 requests waiting; 100% concurrency utilization. System p99 496ms, 6.3% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 236.8: MySQL is under pressure. 60 requests waiting; 100% concurrency utilization. System p99 491ms, 5.5% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 248.9: db-1 is under pressure. 62 requests waiting; 100% concurrency utilization. System p99 516ms, 14.2% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 260.9: db-1 is under pressure. 57 requests waiting; 100% concurrency utilization. System p99 501ms, 11.4% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 272.9: db-1 is under pressure. 62 requests waiting; 100% concurrency utilization. System p99 497ms, 5.5% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 284.9: db-1 is under pressure. 63 requests waiting; 100% concurrency utilization. System p99 527ms, 12.9% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 289.9: Upgrade MySQL: started. 3 company hours to deploy. $40 setup cost; engineering burns $600/mo while active.
- Hour 292.9: Upgrade MySQL: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 295.5: Upgrade the app server: started. 2 company hours to deploy. $20 setup cost; engineering burns $600/mo while active.
- Hour 296.9: App server is under pressure. 1 requests waiting; 94% concurrency utilization. System p99 504ms, 0.0% errors. Organic growth pauses while the service target is missed. Requests are waiting at the app tier. Compare a larger app machine with another instance. Both add compute capacity, but neither removes database work.
- Hour 297.5: Upgrade the app server: deployed. The change is live. Compare throughput, waiting requests and tail latency.
- Hour 336.0: Primary application region unavailable. A 12-hour application outage began. A standby region can take over after its routing delay; shared data dependencies remain unprotected.
- Hour 336.1: MySQL is under pressure. 0 requests waiting; 98% concurrency utilization. System p99 205ms, 11.7% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 348.0: Primary application region restored. The primary app tier is reachable again. Check whether backlog and errors have recovered.
- Hour 348.1: db-1 is under pressure. 7 requests waiting; 0% concurrency utilization. System p99 53ms, 95.3% errors. Organic growth pauses while the service target is missed. Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.
- Hour 372.8: Challenge completed. Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
Read optimizations can make a write-heavy system more expensive without fixing it.
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
