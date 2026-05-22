# Product Analytics & Operational Metrics

This document defines the analytics infrastructure, input drivers, tracking nodes, and the core North Star metric governing the Credex AI Spend Audit platform.

---

## 1. The North Star Metric: Monthly Qualified Consulting Pipeline (MQCP)

Our single North Star metric is **Monthly Qualified Consulting Pipeline (MQCP) in Dollars**.

### Definition:
The sum of potential monthly savings calculated for all leads who complete an audit, show **$> \$500$/month in estimated savings**, and submit their contact details (email opt-in).

### Why This Metric?
Tracking standard SaaS metrics like **Daily Active Users (DAU)** or **Monthly Active Users (MAU)** is a major mistake for a spend audit tool. Founders and engineering leads only audit their software stack once a quarter or during pivot intervals. Tracking DAU would force us to design addictive patterns that waste development capital. 

MQCP measures the actual commercial value being funneled directly into Credex's core sales pipeline. It aligns product value (proving savings to the user) with company economics (funneling high-volume buyers to our credit brokerages).

---

## 2. The 3 Core Input Metrics

The North Star Metric is driven by three specific, trackable input metrics:

1. **Form Completion Rate (FCR):**
   - *Definition:* The percentage of landing page visitors who successfully complete all steps of the spend form and trigger the calculations engine.
   - *Impact:* High FCR ensures we maximize the conversion of organic community traffic.

2. **Lead Capture Efficiency (LCE):**
   - *Definition:* The percentage of completed audits where the user submits their email address on the results dashboard.
   - *Impact:* Evaluates whether the calculated savings screen successfully builds enough trust and value to incentivize lead capture.

3. **High-Savings Ratio (HSR):**
   - *Definition:* The percentage of completed audits that return $> \$500$ in monthly savings.
   - *Impact:* Tracks traffic quality. If our GTM channels drive pre-seed teams who only spend $200/mo, our HSR will be near 0%, indicating we need to refine our targeting towards Seed/Series A teams.

---

## 3. What to Instrument First (Analytics Schema)

We will integrate a lightweight analytics provider (e.g., PostHog or Mixpanel) and instrument these events:

- `Form_Step_Advanced` (Properties: `step_index`, `tool_count`): Tracks wizard drop-offs to optimize input layouts.
- `Audit_Calculations_Run` (Properties: `total_spend`, `total_savings`, `efficiency_score`): Logs the mathematical profiles to track HSR.
- `Lead_Capture_Submitted` (Properties: `role`, `company_size`, `savings_bucket`): Triggers when the user opts-in, verifying our LCE.
- `Consultation_Booked` (Properties: `lead_id`, `savings_total`): Measures downstream conversions into sales meetings.

---

## 4. The Pivot Trigger Number

We will execute a product pivot if:
> **The Audit-to-Lead Capture Conversion Rate (LCE) remains below 10% after 30 days and 500 completed audits.**

### The Logic behind the Pivot:
If founders take the time to fill out the form, discover they are losing $600/month, but **less than 10%** of them are willing to enter their email to receive the full optimization report and unlock Credex discounts, it signals a fundamental trust gap. It implies they do not trust the rule-based calculations, or they are uncomfortable sharing SaaS information with a free online tool.

### The Pivot Strategy:
If this threshold is triggered, we will pivot our acquisition strategy from a self-serve manual questionnaire into an **automated browser extension** or a **Google Workspace OAuth scanner** that automatically aggregates billing receipts from their workspace inbox with 1-click verification. This elevates credibility and removes manual input friction.
