# Queue backpressure

> Producer 10k msg/s, consumer 2k msg/s. Queue depth grows 8k/s. When shed load — at depth 50k or consumer lag 60s?

Canonical: https://learn.significanthobbies.com/curriculum/drills/queue-backpressure

Producer 10k msg/s, consumer 2k msg/s. Queue depth grows 8k/s. When shed load — at depth 50k or consumer lag 60s?

## The mechanism

A queue decouples producer speed from consumer speed and turns a sync call into a durable, retryable message. 'Exactly once' is mostly a myth — design for at-least-once delivery plus idempotent consumers.

## Expected evidence

Alert on lag and depth; shed at SLA breach; scale consumers or throttle producer.

## Hints

- Queues are buffers, not infinite.
- Dead-letter poison messages.

## Sources and practice

- [Message queue (Wikipedia)](https://en.wikipedia.org/wiki/Message_queue)
- [Apache Kafka documentation](https://kafka.apache.org/documentation/)
- [Study Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/queue-backpressure)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
