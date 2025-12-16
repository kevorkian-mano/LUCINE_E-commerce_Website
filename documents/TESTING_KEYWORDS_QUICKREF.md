# Testing Keywords Quick Reference

Applies to backend (Vitest) and frontend (Vitest + Cypress).

- `describe(name, fn)`: Group related tests.
- `it/test(name, fn)`: Single test case.
- `beforeAll/afterAll(fn)`: Run once before/after all tests.
- `beforeEach/afterEach(fn)`: Run before/after each test for setup/cleanup.
- `expect(value)`: Assertion entry point.
- Common matchers: `.toBe`, `.toEqual`, `.toStrictEqual`, `.toBeTruthy`, `.toBeFalsy`, `.toBeNull`, `.toBeUndefined`, `.toContain`, `.toHaveLength`, `.toMatchObject`, `.toThrow`, `.rejects`, `.resolves`.
- Asynchronous helpers: `await`, `async`, `return` a promise, or use `done` callback (Vitest/Cypress auto-timeout if not settled).
- Spies/mocks (Vitest): `vi.fn()`, `vi.spyOn()`, `vi.mock()`, `vi.clearAllMocks()`, `vi.resetAllMocks()`.
- Timers (Vitest): `vi.useFakeTimers()`, `vi.advanceTimersByTime(ms)`, `vi.runAllTimers()`, `vi.useRealTimers()`.
- Cypress basics: `cy.visit`, `cy.get`, `cy.contains`, `cy.click`, `cy.type`, `cy.intercept`, `cy.wait`, `cy.fixture`, `cy.request`, `cy.viewport`.
- Cypress assertions: `should`, `and` with chai/jQuery matchers (e.g., `should('be.visible')`, `should('contain', 'text')`).
- Cypress chaining: Commands are enqueued; avoid mixing raw DOM without `cy.wrap`.
- Cleanup pattern: use `afterEach` to restore mocks/stubs or reset DB state in backend tests.
