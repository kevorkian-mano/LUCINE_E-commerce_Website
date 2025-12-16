# Testing Summary (Backend & Frontend)

## Scope
- Backend: Unit + integration (Vitest)
- Frontend: Unit + integration (Vitest)
- E2E: Cypress user flows

## Counts (current known totals)
- Backend tests: ~200+ specs (unit + integration)
- Frontend tests: ~110+ specs (unit + integration)
- E2E: 8 suites (Cypress) including authenticated purchase and real-user Stripe flow

## Highlights
- Backend coverage spans controllers, services, repositories, middleware, and observers.
- Frontend coverage spans components, hooks/context, utilities, and page flows.
- E2E covers critical user journeys: login, browse products, cart, checkout, Stripe payment.

## How to run
```bash
# Backend unit+integration
cd backend && npm test

# Frontend unit+integration
cd frontend && npm test

# E2E (requires dev servers running)
cd frontend && npm run e2e:open
```
