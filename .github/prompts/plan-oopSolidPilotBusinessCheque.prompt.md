# Plan: OOP/SOLID Pilot — Repository + Domain Entity + Typed Errors (Business + Cheque)

## TL;DR

Codebase audit found services are static-method "namespace" classes (no DI, no inheritance,
zero interfaces/polymorphism), domain types are plain interfaces with no behavior, errors are
bare `throw error` rethrows, and hooks duplicate CRUD/optimistic-update boilerplate. React
components stay 100% functional (correct/idiomatic — NOT in scope to convert to classes).

User decisions (from Q&A):

- Scope: business logic layer only (services, domain models, error handling) + hook dedup as later phase.
- Services: full redesign to instantiable classes with constructor-injected repository (real DI, mockable).
- Introduce Repository interfaces + Supabase implementations (decouples services from Supabase directly).
- Domain entities: give types like Cheque real behavior (encapsulation of data+behavior).
- Typed error hierarchy (AppError base + NotFoundError/ValidationError/ConflictError/DatabaseError), surfaced to UI/toasts.
- Rollout: PILOT on 2 services (Business = simple CRUD baseline, Cheque = richest domain behavior) + 1 domain entity (Cheque), validate, THEN roll out to remaining 8 services. Hook-factory dedup (useCrudList<T>, useOptimisticMutation<T>) is Phase 4, deferred.
- Tests required (vitest) for all new classes.

## Confirmed architecture facts (audit results)

- Services dir: account/auth/bank/business/cheque/monetization/party/report .service.ts use
  `class X { static async ... }`; profile.service.ts & storage.service.ts use plain object literals.
  Zero `extends`/`implements` anywhere. `if (error) throw error` duplicated 28x. `createClient()`
  duplicated at module scope in 6 files, inside methods in 2 (monetization, profile).
- src/types/index.ts: plain interfaces only (Profile, Business, Party, Bank, Account, Cheque,
  ChequeWithRelations, AccountWithRelations), ChequeStatus/ChequeType type aliases. No behavior.
- src/lib/cheque-state.ts: standalone `getInitialChequeStatus(type)` fn, covered by
  src/lib/cheque-state.test.ts (vitest exists in repo already).
- src/validators/index.ts: zod schemas (businessSchema, partySchema, accountSchema, chequeSchema) —
  used only in forms, NOT called from services.
- src/lib/supabase/client.ts: `createClient()` factory (createBrowserClient wrapper) — reuse in repos.
- src/lib/logger.ts: existing good Adapter pattern (pino + Sentry) — reuse for error logging if useful.
- UI status-transition rule already enforced client-side in src/components/cheque-card.tsx (lines ~59-93):
  once `cheque.status` is 'Cleared' or 'Bounced', status buttons are disabled; only transitions offered
  are Issued/Received -> Cleared or Bounced. This CONFIRMS the `canTransition` domain rule to encode
  (terminal states: Cleared, Bounced; non-terminal: Issued, Received can move to Cleared/Bounced).
- use-create-cheque.ts (~lines 115-140) manually checks `error.code === '23505'` (Postgres unique
  violation) to show a "duplicate cheque" toast vs generic error toast — concrete before/after example
  for typed ConflictError.
- Call-site inventory for pilot (BusinessService./ChequeService. usages — 26 matches / 14 files):
  - src/app/onboarding/page.tsx (BusinessService.create)
  - src/hooks/use-account-detail.ts (ChequeService.getAll, updateStatus)
  - src/hooks/use-business-detail.ts (BusinessService.getById, ChequeService.getAll)
  - src/hooks/use-business.tsx (BusinessService.getAll)
  - src/hooks/use-businesses-page.ts (BusinessService.delete, ChequeService.getAll)
  - src/hooks/use-cheque-actions.ts (ChequeService.updateStatus, delete)
  - src/hooks/use-cheque-detail.ts (ChequeService.getById, updateStatus)
  - src/hooks/use-cheques.ts (ChequeService.getAll, updateStatus, delete)
  - src/hooks/use-create-business.ts (BusinessService.create)
  - src/hooks/use-create-cheque.ts (ChequeService.create)
  - src/hooks/use-edit-business.ts (BusinessService.getById, update, delete)
  - src/hooks/use-edit-cheque.ts (ChequeService.getById, update, delete)
  - src/hooks/use-parties.ts (ChequeService.getAll)
  - src/hooks/use-party-detail.ts (ChequeService.getAll, updateStatus)

## Steps

### Phase 0: Shared infra (no behavior change)

1. `src/lib/errors.ts` — new file. `AppError` abstract base class extends Error (fields: `code`,
   `cause?`); subclasses `NotFoundError`, `ValidationError`, `ConflictError` (Postgres 23505),
   `DatabaseError` (catch-all). Export `mapSupabaseError(error): AppError` — inspects
   `error.code`/`PGRST116` etc. and returns the right subclass.
2. `src/repositories/base.repository.ts` — new file. Generic `Repository<T, CreateDTO, UpdateDTO>`
   interface (getAll/getById/create/update/delete signatures vary per entity — keep loose/optional).
   Abstract `SupabaseRepository` base class: `protected supabase = createClient()` (from
   `@/lib/supabase/client`) + `protected async handle<R>(promise: PromiseLike<{data:R,error:any}>): Promise<R>`
   helper applying `mapSupabaseError`.

### Phase 1: Pilot — Business (_depends on Phase 0_)

3. `src/repositories/business.repository.ts` — `IBusinessRepository` interface +
   `SupabaseBusinessRepository extends SupabaseRepository implements IBusinessRepository`, porting
   the 5 methods from current business.service.ts using `this.handle(...)`.
4. Rewrite `src/services/business.service.ts` — instantiable `class BusinessService` with
   `constructor(private repo: IBusinessRepository = new SupabaseBusinessRepository())`; methods
   delegate to `this.repo`. Export `export const businessService = new BusinessService()` singleton
   AND keep `export class BusinessService` for test injection.
5. Update call sites: onboarding/page.tsx, use-business-detail.ts, use-business.tsx,
   use-businesses-page.ts, use-create-business.ts, use-edit-business.ts —
   `BusinessService.x(...)` -> `businessService.x(...)`.
6. `src/services/business.service.test.ts` — unit test with mock `IBusinessRepository`.

### Phase 2: Pilot — Cheque (_depends on Phase 0, parallel with Phase 1_)

7. `src/domain/cheque.entity.ts` — `Cheque` class:
   - Wraps a raw `ChequeWithRelations`-shaped object; getters mirror every existing field
     (id, status, amount, cheque_date, type, party, account, ...) so existing component prop
     access (`cheque.status`, `cheque.amount`, etc.) keeps working unchanged.
   - `static initialStatusFor(type: ChequeType): ChequeStatus` — ports logic from
     `src/lib/cheque-state.ts` (Inward -> Received, else Issued).
   - `canTransition(next: ChequeStatus): boolean` — terminal states Cleared/Bounced cannot
     transition further; Issued/Received can move to Cleared or Bounced. (Matches existing UI rule
     in cheque-card.tsx.)
   - `isOverdue(asOf = new Date()): boolean` — true if status is Issued/Received and cheque_date < asOf.
   - `static fromRow(row: ChequeWithRelations): Cheque` factory.
   - Delete `src/lib/cheque-state.ts` and migrate `src/lib/cheque-state.test.ts` ->
     `src/domain/cheque.entity.test.ts` (covers initialStatusFor, canTransition, isOverdue).
8. `src/repositories/cheque.repository.ts` — `IChequeRepository` (getAll(businessId), getById,
   create, update, updateStatus, delete) + `SupabaseChequeRepository`.
9. Rewrite `src/services/cheque.service.ts` — instantiable `ChequeService(repo: IChequeRepository = new SupabaseChequeRepository())`;
   methods map raw rows to `Cheque` via `Cheque.fromRow` before returning. `updateStatus(id, status)`
   fetches/validates via `canTransition` and throws `ValidationError` on illegal transition before
   calling the repo. Export singleton `chequeService`.
10. Update call sites: use-account-detail.ts, use-cheque-actions.ts, use-cheque-detail.ts,
    use-cheques.ts, use-create-cheque.ts, use-edit-cheque.ts, use-parties.ts, use-party-detail.ts,
    use-businesses-page.ts — `ChequeService.x` -> `chequeService.x`. Adjust local types from
    `ChequeWithRelations` to `Cheque` where hooks store/return the fetched data.
11. `src/hooks/use-create-cheque.ts` (~lines 115-140): replace manual
    `error.code === '23505'` check with `error instanceof ConflictError` typed check.
12. `src/domain/cheque.entity.test.ts` (see step 7) + `src/services/cheque.service.test.ts`
    (mock repository; assert delegation + that invalid status transition throws `ValidationError`
    and valid transition calls repo).

### Phase 3 (deferred — gated on pilot review): Roll out to remaining services

Apply the identical Phase 1 template (repository interface + Supabase impl + instantiable service +
singleton + tests) to: account, auth, bank, monetization, party, profile, report, storage. Not
built in this pass — explicitly requires a follow-up go-ahead after Phase 1/2 land.

### Phase 4 (deferred): Hook duplication cleanup

Generic `useCrudList<T>()` and `useOptimisticMutation<T>()` factories to de-duplicate list/create/edit
hooks, applied first to the hooks touched in Phase 1/2, expanded later to the rest.

## Relevant files

- `src/lib/errors.ts` — new: AppError hierarchy + mapSupabaseError
- `src/repositories/base.repository.ts` — new: generic Repository interface + SupabaseRepository base
- `src/repositories/business.repository.ts` — new
- `src/repositories/cheque.repository.ts` — new
- `src/domain/cheque.entity.ts` — new: Cheque domain class
- `src/domain/cheque.entity.test.ts` — new (replaces cheque-state.test.ts)
- `src/services/business.service.ts` — rewrite to instantiable class + singleton
- `src/services/business.service.test.ts` — new
- `src/services/cheque.service.ts` — rewrite to instantiable class + singleton, returns Cheque entities
- `src/services/cheque.service.test.ts` — new
- `src/lib/cheque-state.ts` — delete (logic moved to Cheque.initialStatusFor)
- 14 hook/page call sites listed above — update `BusinessService.`/`ChequeService.` static calls to singleton instance calls

## Verification

1. `npx vitest run` — all existing + new tests green.
2. `get_errors` on all touched/new files — zero new TS errors.
3. Manual smoke test in dev server: create/edit/delete a business; create/edit/delete a cheque;
   attempt to change status of an already-Cleared/Bounced cheque via any non-UI path (e.g. directly
   calling chequeService.updateStatus) confirms ValidationError is thrown.
4. Confirm duplicate-cheque-number creation still shows the same "duplicate cheque" toast (now via
   `instanceof ConflictError`).

## Decisions

- UI components remain 100% functional React (no class components) — out of scope by design.
- Cheque entity mirrors ChequeWithRelations shape via getters to avoid component-layer rewrites.
- Remaining 8 services and hook-factory dedup explicitly deferred to Phase 3/4, pending sign-off.
- cheque-state.ts removed entirely in favor of Cheque.initialStatusFor (single source of truth).
