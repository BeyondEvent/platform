# Payment Failure Example

Demonstrates retry logic, DLQ routing, and failure injection.

## Event Flow

```
PaymentRequested → PaymentProcessor → PaymentSucceeded
                                   → PaymentFailed → RetryScheduled
                                                   → DLQ (exhausted)
```

## Key Concepts

- Retry with exponential backoff
- Dead-letter queue (DLQ)
- Failure injection (chaos)
- Trace replay after failure
