---
date: "2025-10-14"
tags: ["Kafka", "System Design"]
---

Kafka consumer group rebalances are the silent killer of throughput during deploys. Use `session.timeout.ms` and `max.poll.interval.ms` to tune how quickly the group detects a dead consumer vs how long a slow consumer gets before eviction. Default values are too conservative for most production loads.
