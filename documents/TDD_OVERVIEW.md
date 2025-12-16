# Test-Driven Development (TDD) in This Project

## What
- TDD is a loop of **write a failing test → implement the minimal code → refactor**.
- Tests define expected behavior before code exists, guarding against regressions.

## Why we use it
- Keeps features aligned with requirements (user flows and API contracts).
- Prevents regressions while refactoring shared layers (controllers, services, repositories, React pages).
- Speeds feedback: failing tests highlight breaks before manual QA.

## Where it shows up here
- **Backend**: Vitest unit/integration suites under `backend/tests/**` cover controllers, services, repositories, and middleware.
- **Frontend**: Vitest unit/integration suites under `frontend/tests/**` cover components, hooks, context, and utilities.
- **E2E**: Cypress flows under `frontend/cypress/e2e/**` validate real user journeys (login, checkout, Stripe payment).

## How we practice it
- Start each ticket by writing or updating a test that describes the behavior (API response, UI state, side-effect).
- Implement only enough code to make the new test pass; keep builds and lints green.
- Refactor with tests green to simplify or optimize; add coverage for edge cases found during review.
- When fixing bugs, add a failing test that reproduces the issue, then fix it.

## Quick commands
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E (requires dev servers running)
cd frontend && npm run e2e:open
```
