# Movement Concurrency

Sprint 3B memperluas concurrency strategy Sprint 3A untuk multi-line movement.

## Strategy

- row lock source balance,
- optimistic version check,
- deterministic lock ordering,
- limited retry pada serialization conflict,
- idempotency key untuk submit, post, dispatch, receive, dan reverse.
