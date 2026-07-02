# Implementation Roadmap: Anedya JS Frontend SDK Production Readiness (Streamlined)

## 1. Executive Summary

* **Current Maturity:** Early-stage (v0.0.1). Structurally sound and highly secure.
* **Context:** **Fresh SDK with zero current integrations.** This allows us to bypass all backward compatibility concerns and deprecation cycles.
* **Biggest Weaknesses:** Non-idiomatic naming (PascalCase factory methods) and high developer friction (mandatory Request class instantiation).
* **Biggest Strengths:** Robust security/signing architecture, excellent TypeScript foundation, and a world-class real-time streaming subscription model.
* **Strategy:** "Correctness First." We will implement the ideal, idiomatic API immediately. There is no need to support the "incorrect" version.
* **Estimated Effort:** ~6–8 weeks (3-4 focused Sprints) to reach a stable v1.0.0.

---

## 2. Overall Roadmap

The roadmap follows a "Correctness $\rightarrow$ Ergonomics $\rightarrow$ Hardening $\rightarrow$ Release" progression. We will establish the ideal API foundation immediately, then focus on making it effortless to use.

---

## 3. Priority Matrix

| Improvement | Category | Priority | Complexity | Risk | Impact |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Correct Naming (camelCase)** | Public API | **P0** | Low | None | High |
| **Support Plain Object Arguments** | DX | **P0** | Medium | Low | High |
| **Standardize Error Handling (Throw pattern)** | Error Handling | **P1** | High | Medium | High |
| **Eliminate `any` types in Models/Services** | TypeScript | **P1** | Medium | Low | Medium |
| **Refine `isDataAvailable` Logic** | API Design | **P1** | Low | Low | Medium |
| **Add Framework-specific Examples** | Examples | **P2** | Low | Low | High |
| **Advanced Reconnection/Retry Logic (REST)** | Architecture | **P2** | High | Medium | Medium |

---

## 4. Dependency Graph

1.  **Phase 1 (Foundational Correctness)** $\rightarrow$ *Must complete before Phase 2.*
2.  **Phase 2 (Ergonomics)** $\rightarrow$ *Depends on refined TypeScript Interfaces from Phase 1.*
3.  **Phase 3 (Reliability & Hardening)** $\rightarrow$ *Depends on finalized API signatures from Phase 2.*
4.  **Phase 4 (Launch Prep)** $\rightarrow$ *Parallel tasks: Documentation, CI/CD, and Final Audit.*

---

## 5. Sprint Plan

### Sprint 1: The Clean Foundation (Identity & Typing)
* **Goal:** Establish the correct, idiomatic, and type-safe API.
* **Tasks:**
    * Rename all factory methods to `camelCase` (`newClient`, `newNode`, etc.).
    * Refactor `models.ts` and `services/` to eliminate all `any` types.
    * Standardize response shapes across all service modules.
    * Fix the `isDataAvailable` logic to be consistent.
* **Deliverables:** v0.1.0 (The "Correct" API).
* **Acceptance Criteria:** SDK is 100% type-safe; naming follows JS industry standards.

### Sprint 2: The Frictionless SDK (Developer Experience)
* **Goal:** Minimize boilerplate and maximize ergonomics.
* **Tasks:**
    * Update `Node` methods to accept plain objects (e.g., `node.getData({ variable: 'temp' })`).
    * Ensure TypeScript provides perfect IntelliSense for both `Req` classes and plain objects.
    * Standardize internal service calls to use these new signatures.
* **Deliverables:** v0.2.0.
* **Acceptance Criteria:** Typical user task code is reduced by >40%.

### Sprint 3: The Industrial SDK (Reliability & Error Handling)
* **Goal:** Move from "Return Error Object" to "Throw Error" and harden connectivity.
* **Tasks:**
    * Introduce `AnedyaError` subclasses (e.g., `AuthenticationError`, `NetworkError`).
    * Refactor services to `throw` on failure, enabling standard `try/catch` usage.
    * Implement exponential backoff for REST API retries (mirroring WebSocket strategy).
* **Deliverables:** v0.5.0 (Release Candidate).
* **Acceptance Criteria:** Standard `try/catch` blocks successfully capture and categorize all failure modes.

### Sprint 4: The Professional Launch (Hardening & Documentation)
* **Goal:** Final validation and ecosystem readiness.
* **Tasks:**
    * Complete framework-specific examples (React, Vite, Next.js).
    * Conduct full bundle size and tree-shaking audit.
    * Finalize all documentation (README, API Reference, Quick Start).
    * Complete the "Final Release Checklist."
* **Deliverables:** v1.0.0 (Stable Production Release).

---

## 6. Detailed Task Breakdown (Sample)

### Task: Support Plain Object Arguments
* **Problem:** High boilerplate; users must import and instantiate `Req` classes for every call.
* **Why it matters:** Increases friction and code verbosity.
* **Current implementation:** `node.getData(new AnedyaGetDataReq(...))`
* **Desired implementation:** `node.getData({ variable: 'temp', from: 123, to: 456 })`
* **Files likely affected:** `src/node.ts`, `src/models.ts`, `src/services/*.ts`
* **Public API impact:** Additive/Non-breaking (supports both).
* **Internal architecture impact:** Services must now validate plain objects against interfaces.
* **Estimated implementation time:** 1 week.

---

## 7. Testing Strategy

* **Unit Testing:** 100% coverage on `src/services/` and `src/stream_client.ts`.
* **Integration Testing:** Mocked API calls to ensure `AnedyaError` is thrown correctly.
* **Browser Compatibility:** Test WebSocket reconnection and `crypto.subtle` in Chrome, Firefox, and Safari.
* **TypeScript Tests:** Verify that providing incorrect plain objects results in compile-time errors.
* **Performance:** Benchmark bundle size using `rollup-plugin-visualizer`.

---

## 8. Documentation Strategy

* **README:** Update with the new, ergonomic API usage.
* **API Reference:** Automate via TypeDoc to ensure it stays in sync with the code.
* **Quick Start:** Add a "Get Started in 30 Seconds" section using the new object-based API.
* **Framework Guides:** Create `/docs/frameworks/react.md` and `/docs/frameworks/vite.md`.

---

## 9. Release Roadmap

1.  **v0.1.0 (The Correct API):** Fix naming, clean up types.
2.  **v0.2.0 (The Ergonomic API):** Support plain objects.
3.  **v0.5.0 (The Robust API):** Error handling redesign (Throw pattern), improved retries.
4.  **v1.0.0 (The Stable API):** Final cleanup, full documentation, stable release.

---

## 10. Final Release Checklist

- [ ] Public APIs follow `camelCase` convention.
- [ ] All `any` types removed from public interfaces.
- [ ] `try/catch` pattern works for all error scenarios.
- [ ] `npm install` and `npm run build` pass in clean environments.
- [ ] Bundle size is < 30KB (gzipped).
- [ ] TypeScript `strict: true` enabled and passing.
- [ ] All examples in `examples/` are functional and updated.
- [ ] Documentation includes a clear Migration Guide (even if just for internal reference).

---

## 11. Success Metrics

* **Zero `any` types** in the public API surface.
* **Lines of Code Reduction:** 40% reduction in typical user "Setup & Fetch" code blocks.
* **Bundle Size:** < 30KB gzipped.
* **Type Safety:** 100% IntelliSense coverage for all method parameters.
* **Community Feedback:** Zero "Naming" or "Boilerplate" complaints in GitHub issues.

---

## 12. Estimated Timeline

* **Total Duration:** 8 Weeks.
* **Sprint 1:** Weeks 1-2.
* **Sprint 2:** Weeks 3-4.
* **Sprint 3:** Weeks 5-6.
* **Sprint 4:** Weeks 7-8.