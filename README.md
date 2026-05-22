# Credex AI Spend Audit (Round 1 Build)

Credex AI Spend Audit is an interactive, premium B2B lead-generation web application designed to help startup founders, engineering managers, and finance teams audit their month-to-month AI tool spend. It scans active subscriptions (Cursor, GitHub Copilot, ChatGPT, Claude, Gemini, Windsurf, APIs), runs a robust rule-based financial evaluation engine, suggests high-fidelity downgrades and optimizations, and bridges users to discounted AI infrastructure credits via Credex.

**Live Deployed URL:** [https://credex-audit.vercel.app](https://credex-audit.vercel.app)

---

## Previews & Interface

Since this tool is designed to be shared dynamically across Product Hunt and Twitter, the UX is built to feel highly premium, compact, and information-dense:

* **Sleek Spend Simulator:** A clean, multi-step slider/input form that persists entries to localStorage.
* **Instant Financial Diagnostics:** Real-time breakdown of seat redundancy, unnecessary enterprise contracts, overlapping IDE companions, and API rate overdrafts.
* **Personalized AI Summary:** An automated, professional executive summary generated via Claude 3.5 Sonnet (with deterministic client fallbacks).

*(Visual previews will be updated post-deployment)*
- **Simulator Page:** `/public/previews/simulator.png`
- **Dashboard Analysis:** `/public/previews/dashboard.png`
- **Lead Capture Modal:** `/public/previews/lead_capture.png`

---

## Quick Start

### 1. Prerequisites
Ensure you have [Node.js v18+](https://nodejs.org) and `npm` installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Local Development
Start the development server on `http://localhost:3000`:
```bash
npm run dev
```

### 4. Running Automated Tests
Run the engine's 5 core validation test suites via Vitest:
```bash
npx vitest run
```

### 5. Production Compilation
Build and optimize the application for production:
```bash
npm run build
npm run start
```

---

## Architectural Decisions

Here are the 5 major trade-offs made during the development of this application:

### 1. Deterministic Rule-Based Math Engine vs. LLM Calculations
* **Trade-off:** We built the core audit formulas (e.g., duplicate detection, team minimum seat violations, API threshold offsets) as pure, strongly-typed TypeScript logic instead of utilizing LLMs to calculate recommendations.
* **Reasoning:** Financial audits require absolute precision. LLMs suffer from cognitive drift and mathematical hallucination. Utilizing pure TS rules guarantees 100% deterministic calculations, instantaneous response times, zero token overhead, and highly auditable results that any startup CFO would agree with.

### 2. Client-Persistence (localStorage) vs. Database Draft Syncing
* **Trade-off:** Form inputs are stored in client-side `localStorage` rather than sync'd to a database draft state.
* **Reasoning:** Forcing early registration or syncing draft states across servers creates high initial friction, significantly reducing visitor completion rates on platforms like Hacker News or Twitter. Clients can safely adjust, reload, or leave the tab, having their work preserved, and we only capture their emails once actual, concrete savings value is proved on the dashboard.

### 3. Pure React 19 State Callbacks vs. Render-Phase Mount Hydration
* **Trade-off:** Hydrating state from `localStorage` using React state initializer callbacks (`useState(() => getInitialState())`) instead of running mounts in direct layout rendering.
* **Reasoning:** Next.js App Router performs server-side pre-rendering. Calling window APIs (`localStorage`) or generating random seeds during the immediate rendering phase triggers severe React 19 hydration mismatches and UI flash issues. Initializing state lazily avoids mount-phase flash and keeps layout renders pure.

### 4. Focused Single-Page Landing vs. Bloated Multi-tab Console
* **Trade-off:** Restricting the UI to a hyper-focused funnel (Input Form $\rightarrow$ Savings Report) rather than building multi-page dashboard routes.
* **Reasoning:** This is a lead-generation tool. The primary objective is to maximize visitor conversion and spark virality. A bloated, multi-tab console distracts the user, increases cognitive load, and reduces the focus on the primary action: booking a Credex credits consultation.

### 5. Deterministic Client-Side API Fallbacks
* **Trade-off:** Implementing a structured front-end fallback template for the executive AI summary in case the server-side Anthropic API route fails or gets rate-limited.
* **Reasoning:** An external API outage or rate limit (HTTP 429) must never compromise the user experience. If the Claude 3.5 Sonnet request fails, the application instantly interpolates calculated math profiles into a highly realistic, professional finance-analyst paragraph on the client, ensuring seamless operations.
