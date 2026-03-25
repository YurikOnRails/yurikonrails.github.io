---
title: Designing Data-Intensive Applications
author: Martin Kleppmann
cover: https://placehold.co/400x600/18181b/a1a1aa?text=DDIA
status: finished
rating: essential
yearRead: 2024
keyIdea: Understand the trade-offs behind every database and distributed system before choosing one.
tags: [engineering, databases, distributed-systems]
---

This is the rare technical book that gets better on re-reads. Kleppmann manages to explain consensus algorithms, replication strategies, and storage engines without dumbing anything down. I keep coming back to the chapters on partitioning and stream processing.

The book convinced me that most teams pick their data stack based on hype rather than understanding the actual guarantees they need. The "exactly-once" section alone saved me from a bad architectural decision at work.

## Quotes

> If the same data needs to be accessed in several different ways, you may need to derive several indexes or materialized views from the same underlying data.

> A system is only as strong as its weakest link, and every additional component is another potential point of failure.

## Notes

- Chapter 7 on transactions is the clearest explanation of isolation levels I have found anywhere.
- The comparison between B-trees and LSM-trees changed how I think about write-heavy workloads.
- Worth pairing with the Jepsen blog posts for real-world failure analysis.
