# User Discussions & Product Feedback

This document records honest, simple feedback and conversations with three friends about how they manage and spend money on AI coding tools, design tools, and API keys.

---

## Discussion 1: A.J. — Student & Hobby Developer
- **Profile**: CS student building personal coding projects.
- **Key Feedback**:
  1. "I got a free GitHub Copilot subscription through the GitHub Student Developer Pack, but then I also paid $20/month for Cursor Pro because I wanted the better model. I realized I was paying for Cursor when Copilot was already free for me, and I also had a ChatGPT Plus subscription that I barely used."
  2. "If an audit tool asks me to sign up or input my email just to see a basic calculation, I close it immediately."

### Surprising Discovery:
Many student and hobby developers pay for premium chat subscriptions (like ChatGPT Plus) even when they already have specialized coding tools (like Cursor Pro) that provide identical model access for their main workflows.

### Design Pivots:
1. **Duplicate tool warning**: Built the overlapping check flagging concurrent ChatGPT Plus, Copilot, and Cursor seats.
2. **Zero-login results**: Let users run the audit and view the detailed savings ledger without any registration wall.

---

## Discussion 2: S.N. — Freelance Web Developer
- **Profile**: Junior freelancer building websites for local clients.
- **Key Feedback**:
  1. "I signed up for a Claude Pro trial to write copy for a client site, forgot to cancel it, and got charged for three months without realizing. I wish there was a checklist that reminded me of these recurring subscriptions."
  2. "I once left an API script running in a loop and got a surprise $80 bill from OpenAI. I didn't set a hard limit on my developer account."

### Surprising Discovery:
Forgotten trials and uncapped API tokens are the primary sources of minor budget leaks for independent creators and freelance developers.

### Design Pivots:
1. **API Cost Guardrail**: Added direct suggestions in the audit details reminding developers to configure hard monthly spend limits on their OpenAI and Anthropic dashboards.
2. **Simple ledger checklist**: Provided a clear checklist layout in the dashboard summarizing what to cancel immediately to stop trial leaks.

---

## Discussion 3: K.M. — Non-Technical Content Creator
- **Profile**: Hobby blogger and digital designer creating marketing content.
- **Key Feedback**:
  1. "I pay for three different AI tools: ChatGPT Plus ($20) for general brainstorming, Claude Pro ($20) because I like its writing style better, and a separate graphics generator tool ($15). I'm spending $55/month when I could probably just use one for everything."
  2. "The pricing pages for these tools are so confusing. They try to hide the cheaper individual tiers behind big enterprise and team package banners."

### Surprising Discovery:
Non-technical users frequently buy multiple general-purpose LLM subscriptions in parallel because they prefer slight variations in writing output, unaware they are paying double for overlapping capabilities.

### Design Pivots:
1. **Consolidation Recommendations**: Tuned our cost analysis engine to suggest consolidating multiple chat-only premium subscriptions onto a single flagship subscription.
2. **Transparent Price Ledgers**: Built a detailed pricing matrix in the dashboard comparing current configuration costs side-by-side with cheaper, optimal alternatives.
