# BookEasely - Refactoring Plan

## Phase 1: Security (CRITICAL) - COMPLETE
- [x] 1.1 Add authorization checks to web server actions (booking/actions.ts)
- [x] 1.2 Add authorization checks to web worker actions (workers/actions.ts)
- [x] 1.3 Add authorization checks to web booking status actions (bookings/actions.ts)
- [x] 1.4 Add Zod input validation to all server actions

## Phase 2: Type Safety (HIGH) - COMPLETE
- [x] 2.1 Create Supabase query response types and eliminate `as unknown as` casts (web)
- [x] 2.2 Create Supabase query response types and eliminate `as unknown as` casts (mobile)
- [x] 2.3 Fix `as never` route pushes in mobile

## Phase 3: Error Handling (HIGH) - COMPLETE
- [x] 3.1 Add error handling to all mobile Supabase queries
- [x] 3.2 Add error handling to web search hook
- [x] 3.3 Add try/catch to mobile booking slot fetching
- [x] 3.4 Add isMounted unmount guards to mobile async operations

## Phase 4: Next.js Architecture (MEDIUM) - ALREADY COMPLETE
- [x] 4.1 error.tsx boundaries already exist at key routes
- [x] 4.2 loading.tsx already exists at dashboard routes
- [x] 4.3 Suspense boundaries already in dashboard layout

## Phase 5: Mobile Performance (MEDIUM) - COMPLETE
- [x] 5.1 Extract AppointmentCard as React.memo from renderItem
- [x] 5.2 Add useMemo for schedule grid: businessHoursMap, availabilityMap, blockedDatesSet, weekDateInfo
- [x] 5.3 Memoize section filtering in bookings and appointments
- [x] 5.4 Wrap BookingCard with React.memo and memoize Date objects
- [x] 5.5 Memoize ownerIsWorker and sections in workers screen

## Phase 6: Mobile Component Splits (MEDIUM) - COMPLETE
- [x] 6.1 Extract WorkerCard into components/workers/worker-card.tsx
- [x] 6.2 Extract InvitationCard into components/workers/invitation-card.tsx

## Phase 7: Styling & Consistency (LOW) - COMPLETE
- [x] 7.1 Add semantic color tokens (successDark, infoDark, dangerDark, status colors, accents)
- [x] 7.2 Replace 20+ hardcoded hex colors with theme tokens across 9 files
- [x] 7.3 Update constants.ts to reference theme tokens
