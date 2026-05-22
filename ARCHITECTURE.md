# Credex AI Spend Audit — Architecture System Design

This document details the system design, data flow pipelines, technical stack decisions, and scaling considerations for the Credex AI Spend Audit platform.

---

## 1. System Topology (Mermaid Diagram)

The system operates as a hybrid architecture. The core mathematical audit runs fully on the client for instant responses, while sensitive tasks (e.g., personalized LLM summary generation, lead storage, transactional email dispatches) are processed securely through Next.js Serverless Routes.

```mermaid
graph TD
    %% User Tier
    User["Cold Visitor / Lead"]
    
    subgraph Client Application (React 19 / Zustand)
        Form["DetailedSpendForm (Zod validated)"]
        State["Zustand store (useAuditStore)"]
        LocalStorage["Client localStorage (Draft Persist)"]
        MathEngine["TypeScript Rule Engine (deterministic)"]
        ResultsDashboard["AuditResultsDashboard (UI / Chart)"]
    end

    subgraph Server Infrastructure (Next.js Route Handlers)
        SummaryRoute["/api/generate-summary (POST)"]
        LeadRoute["/api/save-lead (POST)"]
    end

    subgraph Third-Party Cloud Services
        ClaudeAPI["Anthropic Claude 3.5 Sonnet API"]
        Supabase["Supabase Postgres (Lead DB)"]
        Resend["Resend API (Transactional Email)"]
    end

    %% Flow lines
    User -->|Inputs Spend| Form
    Form -->|Validates & Writes| State
    State -->|Saves Draft| LocalStorage
    State -->|Computes Savings| MathEngine
    MathEngine -->|Direct Audit Outputs| ResultsDashboard
    ResultsDashboard -->|Requests Summary| SummaryRoute
    ResultsDashboard -->|Submits Lead| LeadRoute
    
    SummaryRoute -->|Fetches Prompt Context| ClaudeAPI
    LeadRoute -->|Persists Row| Supabase
    LeadRoute -->|Dispatches Audit PDF/Confirm| Resend
```

---

## 2. Core Data Flow: Input to Optimized Audit Result

The pipeline translates user raw input into a mathematically defensible financial diagnostic report in four stages:

1. **Input Ingestion & Validation:**
   - The user inputs active tool subscriptions (seats, tier, actual monthly cost, active users, primary use case).
   - `Zod` schemas validate that number fields are positive, email formats are correct, and all required keys are filled.
   - High-fidelity inputs are immediately persisted into Zustand state and local storage.

2. **Client-Side Financial Diagnostic Scan:**
   - The Zustand store invokes the **TypeScript Audit Engine** (`src/lib/audit-engine/rules.ts`).
   - The engine processes the profile through a matrix of 6 strict rules:
     - **Underutilization Rule:** Detects idle seats (`seats > activeUsers`) and calculates direct waste based on known seat prices.
     - **Team Plan Minimums Rule:** Highlights when tiny cohorts pay for Claude Team or ChatGPT Team but fail to meet minimum seat thresholds (suggesting individual Pro plans).
     - **Enterprise Oversizing Rule:** Detects contracts with <10 seats that are on expensive Enterprise tiers (e.g., Copilot Enterprise, Gemini Enterprise) and suggests downgrading to Business tiers.
     - **Functional Redundancy Rule:** Flags overlapping IDE companions (Cursor vs. Copilot vs. Windsurf) or conversational assistants (Claude vs. ChatGPT vs. Gemini) being licensed to the same active user pool.
     - **Alternative Arbitrage Rule:** Analyzes plan pricing to recommend cheaper alternatives with equal capability (e.g., Cursor Pro $\rightarrow$ Windsurf Pro to trim $5/mo/seat).
     - **API Subscription Mismatches:** Flags high pay-as-you-go API consumption ($> \$300$) and recommends transitioning power users to flat-rate SaaS plans (and vice versa for inactive flat-rate users).
   - Every matched rule returns a structured `AuditRecommendation` with current cost, action steps, direct savings, a confidence score, and clear reasoning.

3. **Aggregate Cost Matrix Formulation:**
   - Total current spend and total estimated savings are aggregated.
   - An **Efficiency Score** is calculated:
     $$\text{Efficiency Score} = \max\left(0, 100 - \left( \frac{\text{Total Savings}}{\text{Total Current Spend}} \times 100 \right)\right)$$
   - The results dashboard renders detailed diagnostic cards, visual bar progress gauges, and highlights the Credex referral panel if monthly savings exceed $500/mo.

4. **Executive AI Summary Generation:**
   - The dashboard makes a POST request to `/api/generate-summary` passing the audit context.
   - The server calls Anthropic's Claude 3.5 Sonnet to draft a ~100-word professional executive summary of the savings, using strict instructions to focus on right-sizing and redundancies.
   - If the API call fails or is throttled, the client seamlessly falls back to a deterministic, high-fidelity local template.

---

## 3. Technology Stack Justification

| Technology | Selection | Strategic Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Provides React 19 server-side rendering for optimal SEO and initial page loads, along with zero-config Serverless API Routes to handle secret environment variables (e.g., API keys, DB credentials). |
| **Styling** | **Tailwind CSS v4** | Enables utility-first rapid layouts with optimized bundle compilation, ensuring page layout speeds conform to high Lighthouse criteria (Performance $\ge 85$). |
| **State** | **Zustand** | Extremely lightweight, boilerplate-free state manager. Handles multi-step form progress, local storage syncing, and calculator triggers without complex React Context re-renders. |
| **Validation** | **Zod** | Guarantees absolute type safety from inputs to server payloads, ensuring corrupt telemetry or invalid emails never reach database triggers. |
| **Testing** | **Vitest** | Outstanding speed and modern ESM compatibility. Runs our core math assertions instantly in a simulated node environment. |

---

## 4. Scaling Strategy: Handling 10,000 Audits / Day

If this application experienced high viral traffic (10k+ audits daily), we would make the following structural updates to ensure 100% availability and ultra-low latencies:

1. **Full Client Math Execution (Already Implemented):**
   - Because the audit calculation engine is 100% client-side TypeScript, scaling the audit computation is virtually free. It scales horizontally via static browser execution.

2. **Distributed Rate Limiting (Upstash / Redis):**
   - Implement IP-based sliding-window rate limiting on `/api/generate-summary` and `/api/save-lead` using an Edge-compatible Redis store (like Upstash). This prevents spam, bot submissions, and Anthropic API billing depletion.

3. **Background Job Queuing for Lead Persistence & Dispatches:**
   - Move database writes and Resend email dispatches from blocking route responses to background serverless queues (e.g., Inngest or BullMQ). The API route should write the lead event immediately to the queue and return HTTP 202 (Accepted), freeing server capacity under heavy loads.

4. **Database Connection Pooling:**
   - Integrate a transaction pooler (e.g., Supabase PgBouncer or Supabase Hyperbeam) to prevent Postgres from exhausting available connection slots under high concurrent spikes.

5. **AI API Rate Limit Caching:**
   - Cache generated AI summaries based on the hashed input profile. If a user resubmits the exact same spending matrix, serve the cached Claude summary instantly from a global Edge KV cache instead of paying for a new LLM token call.
