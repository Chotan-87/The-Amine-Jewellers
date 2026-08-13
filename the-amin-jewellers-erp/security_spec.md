# Security Specification for Firestore

## Data Invariants
1. **StockItem**: Only authenticated users can manage stock.
2. **Order**: Only authenticated users can manage orders.
3. **Memo**: Only authenticated users can manage sales memos.
4. **Mortgage**: Only authenticated users can manage mortgages.
5. **Artisan**: Only authenticated users can manage artisans.
6. **ArtisanJob**: Only authenticated users can manage artisan jobs.

## The "Dirty Dozen" Payloads (Examples)
1. **Unauthenticated Read**: Attempt to read `/stock/item1` without signing in.
2. **Unauthenticated Write**: Attempt to create `/orders/order1` without signing in.
3. **Identity Spoofing**: Attempt to set `id` of a document to something that doesn't match the path.
4. **Type Poisoning**: Sending a string for `weight` which should be a number.
5. **Size Abuse**: Sending a 2MB string for `itemName`.
6. **Unauthorized Update**: Attempting to change `startDate` of a mortgage after it's been created (if marked immutable).
7. **Phantom Fields**: Adding `isSuperAdmin: true` to an `Artisan` document.
8. **Negative Values**: Setting `principalAmount` to -1000.
9. **Invalid Status**: Setting `status` to 'deleted' in `StockItem` when it's not in the enum.
10. **ID Injection**: Using `../../system/secrets` as a document ID.
11. **Email Spoofing**: Attempting to access data by spoofing an admin email (if admin rules existed).
12. **Query Scraping**: Attempting a blanket `list` read on `mortgages` to see everyone's data (though currently all data is shared among authenticated users).

## Test Runner (Conceptual)
`firestore.rules.test.ts` would verify these return `PERMISSION_DENIED`.
