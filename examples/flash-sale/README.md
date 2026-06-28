# Flash Sale Example

Demonstrates high-throughput event processing under contention.

## Event Flow

```
FlashSaleStarted → FlashSaleProcessor → ReservationMade / SoldOut
                                      → InventoryDecremented
                                      → UserNotified
```

## Key Concepts

- Consumer group contention
- Duplicate delivery handling
- Consumer lag monitoring
- DLQ for failed reservations
