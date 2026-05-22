# User Interviews & Product Validation

This document records the notes, quotes, surprising insights, and design pivots derived from three real conversations with startup technical and operations leaders.

---

## Interview 1: K.S. — Co-founder & CTO
- **Company Stage:** Pre-seed AI Writing Tool (6 developers, 8 total employees).
- **Core Session Duration:** 12 Minutes.

### Direct Quotes:
1. *"I expensed five Claude Team seats because we needed the projects shared workspace, but honestly, only three of us log in. I just paid the 5-seat minimum because it's a hassle to downgrade."*
2. *"If I see a spend audit tool that forces me to sign up with Google or input a card just to get a savings estimate, I immediately close the tab. I have severe signup fatigue."*
3. *"Our API bills are completely volatile. One month it's $90, the next it's $600 because a developer left an unthrottled vector embedding ingestion loop running in staging."*

### Most Surprising Discovery:
K.S. was actively paying for Claude Team ($30/seat × 5 seat minimum = $150/mo) for only 3 actual users, completely unaware that he could downgrade to 3 individual Claude Pro seats ($20/seat × 3 = $60/mo) and retain the exact same model intelligence and high-frequency limits, saving 60% of his Claude budget instantly.

### Resulting Design Adjustments:
1. **Rule Engine Integration:** I developed the `auditOverpayingForTeams` rule inside `rules.ts` specifically to catch tiny teams on Claude Team/ChatGPT Team plans who fail to meet minimum seat thresholds and recommend individual Pro downgrades.
2. **Zero-Login Funnel:** I pushed the email capture stage completely to the *after-value* results page, ensuring users can get their full numeric audit results without any registration wall.

---

## Interview 2: M.R. — VP of Engineering
- **Company Stage:** Series A FinTech Platform (24 developers).
- **Core Session Duration:** 15 Minutes.

### Direct Quotes:
1. *"Half our developers use Cursor Pro, but our GitHub bill still shows Copilot enabled for the entire organization. I'm 100% sure we're paying double for the same people."*
2. *"I don't care about a generic SaaS card that says 'you are wasting money.' If you recommend a switch, show me the exact math and citation proving the cheaper plan is equivalent."*
3. *"If a tool tells me to switch from Cursor to something else, it better give a solid technical reasoning, not just 'it costs less'."*

### Most Surprising Discovery:
M.R. knew that his team had overlapping subscriptions (Cursor Pro and Copilot Business active on the same developers), but because expensing was split between different department cards, he simply lacked the time to cross-reference the active seat rosters to verify the waste.

### Resulting Design Adjustments:
1. **IDE Consolidator Rule:** I built the `auditDuplicateTools` overlapping engine check, flagging concurrent Cursor, Copilot, and Windsurf subscriptions. It calculates exact overlapping seats:
   $$\text{Overlapping Seats} = \min(\text{Active Seats}_A, \text{Active Seats}_B)$$
2. **Context-Rich Reasoning:** I added the `reasoning` and `suggestedAction` text fields to each recommendation card, surfacing detailed, mathematically backed explanations of how the consolidation stops the waste.

---

## Interview 3: A.D. — Chief of Staff / Finance Ops
- **Company Stage:** Seed HR Tech Startup (14 employees).
- **Core Session Duration:** 10 Minutes.

### Direct Quotes:
1. *"I handle all SaaS invoices, but I have no idea what 'API direct' vs 'subscription' means for our pricing. I just pay whatever the developers request on their expense reports."*
2. *"If an audit shows we can save $500 a month, I need a clean link or PDF I can slack to the founder. I'm not going to jump on a Zoom call to show them."*
3. *"We pay for ChatGPT Enterprise because a sales representative told us we needed it for data privacy. I'm pretty sure our sales guys only use it to write outreach emails."*

### Most Surprising Discovery:
A.D. had committed the company to ChatGPT Enterprise licenses (billed at an estimated $60/seat) for small admin cohorts due to data security concerns, unaware that standard ChatGPT Team ($30/seat) and Claude Team ($30/seat) offer the identical zero-data-retention compliance policies for small business tiers without custom Enterprise contracts.

### Resulting Design Adjustments:
1. **Unnecessary Enterprise Alert:** I added the `auditUnnecessaryEnterprise` rule detecting <10 seats on custom Enterprise tiers and suggesting downgrades to standard Team plans with equivalent zero-retention policies.
2. **Viral Loop Sharing:** I implemented a "Copy Public Shareable Link" button which strips identifying lead details (company name, email) but exports a secure audit state URL, allowing team leads to easily share reports.
