# Credex AI Spend Audit — Automated Tests Manifest

This document registers all automated tests written to validate the mathematical precision and decision thresholds of the Credex Rule-Based AI Spend Audit Engine.

---

## 1. Test Architecture Summary

- **Testing Framework:** [Vitest v4.1.7](https://vitest.dev)
- **Suite Target:** `src/lib/audit-engine/rules.ts` and `src/lib/audit-engine/engine.ts`
- **Execution Environment:** Node.js, utilizing clean, isolated ECMAScript Modules (ESM) imports.

---

## 2. Tested Components and Files

### File: [audit-engine.test.ts](file:///Users/spidey./Desktop/Credex/src/lib/audit-engine/__tests__/audit-engine.test.ts)
The test suite validates 5 core financial logic categories:

| Test Case # | Description | Coverage Target | Key Assertions |
| :--- | :--- | :--- | :--- |
| **Test 1** | **Downgrade Logic Evaluation** | Seat min requirements & Enterprise contracts | Assert Claude Team ($150) downgrades to Claude Pro ($20/seat) for 3 active users (saves $90/mo). Assert Copilot Enterprise ($39) downgrades to Business ($19/seat) for 3 seats (saves $60/mo). |
| **Test 2** | **Duplicate Tool Detection** | Workspace tool overlaps (coding/chat) | Assert overlapping Cursor Pro and Windsurf Pro developers are consolidated onto Cursor, recovering the secondary license fee completely ($120/mo savings). |
| **Test 3** | **Already Optimized State** | Hyper-efficient startup spent layouts | Assert lean startups operating with 100% active seat utilization return `0` recommendations, `$0` savings, and an **Efficiency Score of 100%**. |
| **Test 4** | **Seat underutilization Math** | Inactive seat waste analysis | Assert 15 idle ChatGPT Pro seats out of 40 allocated result in exactly $300/mo savings, and recalculates the aggregate **Efficiency Score to 63%**. |
| **Test 5** | **Alternative Platform Arbitrage** | Competitive pricing switches | Assert a startup with 6 Cursor Pro seats is suggested a high-fidelity switch to Windsurf Pro, trimming $5/seat/mo ($30/mo savings). |

---

## 3. How to Run Automated Tests

Make sure you are in the project's root directory, then run any of the following command patterns:

### Standard One-Time Test Run
```bash
npx vitest run
```

### Hot-Reloading Watch Mode (For local development)
```bash
npx vitest
```

### Run Tests with Coverage Breakdown
```bash
npx vitest run --coverage
```
