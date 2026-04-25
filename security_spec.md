# Security Specification: Gumfolio

## 1. Data Invariants
- A `Product` must belong to a specific `User`.
- A `Sale` must belong to a specific `User`.
- `chatHistory` messages are tied to a specific `User`.
- Fields like `createdAt` and `id` must be immutable.
- `role` in `Message` must be one of `['user', 'assistant']`.

## 2. The "Dirty Dozen" Payloads (Examples)
1. Injecting `isAdmin: true` into a `User` profile update.
2. Updating an existing `Sale` (which should be immutable after create).
3. Creating a `Product` without a `price`.
4. Injecting `price: -100` into a `Product`.
5. Creating a message with a future `createdAt` timestamp.
6. Attempting to list all sales across all users.
7. Attempting to get another user's `User` profile document.
8. Updating `product_id` on an existing `Sale`.
9. Sending a 2MB string as `content` in a `Message` (Denial of Wallet).
10. Creating a `User` profile for another UID.
11. Updating `createdAt` on an existing `Product`.
12. Attempting to list sales without `request.auth.uid`.

## 3. Test Runner
(To be implemented in firestore.rules.test.ts)
