# Unit Economics & $1M ARR Scaling Plan

This document details the financial unit economics, customer acquisition costs (CAC), conversion thresholds, and the 18-month roadmap to scale the Credex AI Spend Audit platform.

---

## 1. Converted Lead Lifetime Value (LTV) to Credex

Credex operates as a broker for discounted AI infrastructure credits (e.g., Cursor, Claude Enterprise, OpenAI tokens). Startups buy these credits through Credex at a 25% discount, which Credex sources from pivot/overforecast companies at a 50% discount.

### Representative Startup Unit Math:
- **Average Annual AI Infrastructure Credit Spend:** $20,000 (retail value)
- **Discounted Price Paid by Startup to Credex (25% discount):** $15,000
- **Cost of Sourcing Credits Paid by Credex (50% discount):** $10,000
- **Annual Gross Profit Margin per Client:** $15,000 - $10,000 = **$5,000**
- **Average Client Contract Retention:** 2 Years
- **Client Lifetime Value (LTV):** $5,000 × 2 Years = **$10,000**

---

## 2. Customer Acquisition Cost (CAC) by Channel

Since our GTM relies on organic, zero-dollar community seeding, our direct advertising spend is $0. However, we factor in the labor cost of our team to manage campaigns:

### A. Direct Cold DM Outreach
- **Labor Rate (SDR):** $30/hour
- **Time Required per Client Acquisition:** 4 hours of outreach (finding 30 prospects, drafting 12 DMs, booking 3 pitches to close 1).
- **CAC:** 4 Hours × $30 = **$120**

### B. Community Seeding (Lenny's Slack / CTO Craft)
- **Labor Rate (Founder/Evangelist):** $50/hour
- **Time Required per Post & Engagement:** 2 hours to write the analytical post, engage in comments, and run manual audits in threads.
- **Conversions per Seeding:** Avg. 1.5 converted clients.
- **CAC:** (2 Hours × $50) / 1.5 = **$67**

### C. Show HN / Product Hunt Launch
- **Labor Rate (Founder):** $50/hour
- **Time Required for Launch Materials:** 3 hours to prepare technical assets and monitor the launch thread.
- **Conversions per Launch:** Avg. 2.5 converted clients.
- **CAC:** (3 Hours × $50) / 2.5 = **$60**

---

## 3. Funnel Conversion Model & Profitability Thresholds

Let's model the operational efficiency of a cohort containing **1,000 unique cold visitors** landing on the Spend Audit platform:

```
  1,000 Visitors
        │
        ▼ (35.0% Form Completion Rate)
     350 Completed Audits
        │
        ▼ (35.0% Lead Capture Opt-in)
     122 Email Leads Captured
        │
        ▼ (10.0% Consultation Booking Rate)
      12 Booked consultations
        │
        ▼ (25.0% Pitch to Close Rate)
       3 Credit Purchases (Closed Clients)
```

### Operational Cost of the 1,000-Visitor Cohort:
- **Serverless Hosting & DB Overhead:** $20/month = ~$0.66/day
- **Claude 3.5 Sonnet Summary API Tokens:** 350 audits completed × $0.005/token call = $1.75
- **Labor to conduct 12 Booked Pitches:** 12 calls × 30 minutes = 6 Hours × $50/hour = $300
- **Total Operational Cost:** **$302.41**

### Financial Return of the Cohort:
- **Conversions:** 3 Closed Clients
- **First-Year Gross Profit:** 3 × $5,000 = **$15,000**
- **First-Year Return on Investment (ROI):** 
  $$\text{Net Profit} = \$15,000 - \$302.41 = \$14,697.59$$
  $$\text{ROI} = \frac{\$14,697.59}{\$302.41} \times 100 \approx \mathbf{4,860\%}$$

### Profitability Breakeven Threshold:
Because the tool relies on highly cost-effective serverless architecture and organic traffic, **the audit-to-closed-client conversion rate can drop as low as 0.02% (1 closed client out of 5,000 audits)** and the tool will still remain entirely profitable.

---

## 4. The Roadmap to $1M ARR in 18 Months

To drive **$1,000,000 in Annual Recurring Revenue (ARR)** through our credit brokerage (representing $1M in gross margin at $5,000 per startup), Credex needs:
- **Target Converted Clients:** 200 active startup clients.
- **Monthly Run Rate over 18 Months:** Acquire **11.1 new startup clients per month** (approx. 3 new clients per week).

### Monthly Funnel Inputs Required:
To consistently close 11.1 startups per month, the audit pipeline must process:

| Stage | Conversion | Target Monthly Volume |
| :--- | :--- | :--- |
| **New Closed Clients** | 25% of Booked Pitches | **11.1 new startups** |
| **Booked Consultations** | 10% of Email Leads | **44.4 scheduled pitches** |
| **Captured Leads (Email)**| 35% of Audits | **444 captured profiles** |
| **Completed Audits** | 35% of Traffic | **1,268 completed audits** |
| **Landing Page Traffic** | Organic visitors | **3,622 unique visitors** |

### Critical Dependencies (What must be true?):
1. **VC Accelerator Integration:** We must secure partnerships with Techstars and YC portfolio platform managers to onboard entire batches (e.g., 60 startups in one go) onto our audit platform.
2. **Viral loop coefficient ($K \ge 0.15$):** At least 15% of founders who run their audit must share a screenshot of their savings on X or Slack, driving new organic visits without ad spending.
3. **Credit Sourcing Liquidity:** As the demand for credits scales, Credex must actively secure a steady pipeline of pivoted or downsized companies looking to offload their excess subscription commitments.
