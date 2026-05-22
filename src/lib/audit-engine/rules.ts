import { CompanySpendProfile, AuditRecommendation, ToolId, PlanId } from "./types";
import { PRICING_CONFIG } from "./pricing";

// Helper to calculate exact seat cost
export function getUnitCost(toolId: ToolId, planId: PlanId, actualSpend: number, seats: number): number {
  const config = PRICING_CONFIG[toolId];
  const plan = config?.plans.find((p) => p.id === planId);
  if (plan && plan.monthlyCostPerSeat > 0) {
    return plan.monthlyCostPerSeat;
  }
  return seats > 0 ? actualSpend / seats : 0;
}

/**
 * 1. Underutilized Seats Rule
 * Detects if a company is paying for seats that are inactive.
 */
export function auditUnderutilizedSeats(profile: CompanySpendProfile): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];

  for (const sub of profile.subscriptions) {
    if (sub.seats > sub.activeUsers && sub.seats > 0) {
      const unitCost = getUnitCost(sub.toolId, sub.planId, sub.monthlySpend, sub.seats);
      const idleSeats = sub.seats - sub.activeUsers;
      const monthlySavings = idleSeats * unitCost;

      if (monthlySavings > 0) {
        const toolName = PRICING_CONFIG[sub.toolId]?.name || sub.toolId;
        recommendations.push({
          id: `idle-${sub.toolId}`,
          toolId: sub.toolId,
          category: "abandoned",
          title: `Unused ${toolName} Seats`,
          description: `You have ${sub.seats} provisioned seats for ${toolName} but only ${sub.activeUsers} active users were detected over the last 30 days.`,
          suggestedAction: `Reduce seat allocation by ${idleSeats} seats.`,
          currentSpend: sub.monthlySpend,
          estimatedSavings: monthlySavings,
          confidenceScore: 98,
          reasoning: `Direct telemetry shows ${idleSeats} seats have zero logins or interactions. Reducing seat counts instantly stops the billing waste without affecting active operations.`,
        });
      }
    }
  }

  return recommendations;
}

/**
 * 2. Overpaying for Team Plans Rule
 * Claude Team requires minimum 5 seats ($150/mo), ChatGPT Team requires 2 seats ($60/mo).
 * If a small team has fewer active users than the minimum seat requirements, Pro is cheaper.
 */
export function auditOverpayingForTeams(profile: CompanySpendProfile): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];

  for (const sub of profile.subscriptions) {
    // Case A: Claude Team
    if (sub.toolId === "claude" && sub.planId === "business") {
      const activeUsers = Math.max(1, sub.activeUsers);
      if (activeUsers < 5) {
        const currentClaudeTeamCost = Math.max(sub.monthlySpend, 5 * 30); // minimum $150
        const suggestedProCost = activeUsers * 20; // $20 per seat for Claude Pro
        const monthlySavings = currentClaudeTeamCost - suggestedProCost;

        if (monthlySavings > 0) {
          recommendations.push({
            id: `team-min-claude`,
            toolId: "claude",
            category: "tier",
            title: "Suboptimal Claude Team Tier",
            description: `You are on Claude Team (minimum 5 seats at $30/seat) but only have ${activeUsers} active users.`,
            suggestedAction: `Downgrade to ${activeUsers} individual Claude Pro seats.`,
            currentSpend: sub.monthlySpend,
            estimatedSavings: monthlySavings,
            confidenceScore: 95,
            reasoning: `Claude Team billing enforces a 5-seat minimum ($150/mo). By moving ${activeUsers} active users to individual Claude Pro licenses ($20/seat), you save $${monthlySavings}/mo while keeping identical model usage limits.`,
          });
        }
      }
    }

    // Case B: ChatGPT Team
    if (sub.toolId === "chatgpt" && sub.planId === "business") {
      const activeUsers = Math.max(1, sub.activeUsers);
      if (activeUsers === 1) {
        const currentChatTeamCost = Math.max(sub.monthlySpend, 2 * 30); // minimum $60
        const suggestedProCost = 1 * 20; // $20 for ChatGPT Plus
        const monthlySavings = currentChatTeamCost - suggestedProCost;

        if (monthlySavings > 0) {
          recommendations.push({
            id: `team-min-chatgpt`,
            toolId: "chatgpt",
            category: "tier",
            title: "Suboptimal ChatGPT Team Tier",
            description: `You are paying for a ChatGPT Team plan (minimum 2 seats at $30/seat) for only 1 active user.`,
            suggestedAction: `Downgrade to 1 ChatGPT Plus subscription ($20/mo).`,
            currentSpend: sub.monthlySpend,
            estimatedSavings: monthlySavings,
            confidenceScore: 95,
            reasoning: `ChatGPT Team requires a 2-seat minimum. A single user can operate on ChatGPT Plus for $20/mo instead of paying $60/mo for a two-seat team workspace.`,
          });
        }
      }
    }
  }

  return recommendations;
}

/**
 * 3. Unnecessary Enterprise Plans Rule
 * Small teams (<10 seats) rarely need custom Enterprise contracts (e.g. Copilot Enterprise, ChatGPT Enterprise).
 */
export function auditUnnecessaryEnterprise(profile: CompanySpendProfile): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];

  for (const sub of profile.subscriptions) {
    if (sub.planId === "enterprise" && sub.seats <= 10 && sub.seats > 0) {
      let businessCostPerSeat = 0;
      let actionPlan = "";

      if (sub.toolId === "copilot") {
        businessCostPerSeat = 19; // Copilot Business
        actionPlan = "GitHub Copilot Business";
      } else if (sub.toolId === "chatgpt") {
        businessCostPerSeat = 30; // ChatGPT Team
        actionPlan = "ChatGPT Team";
      } else if (sub.toolId === "gemini") {
        businessCostPerSeat = 20; // Gemini Business
        actionPlan = "Gemini Business";
      }

      if (businessCostPerSeat > 0) {
        const unitCost = getUnitCost(sub.toolId, sub.planId, sub.monthlySpend, sub.seats);
        const currentSeatCost = Math.max(unitCost, businessCostPerSeat + 10); // Assume Enterprise costs more
        const monthlySavings = (currentSeatCost - businessCostPerSeat) * sub.seats;

        if (monthlySavings > 0) {
          const toolName = PRICING_CONFIG[sub.toolId]?.name || sub.toolId;
          recommendations.push({
            id: `enterprise-${sub.toolId}`,
            toolId: sub.toolId,
            category: "tier",
            title: `Excessive ${toolName} Enterprise Tier`,
            description: `Your small team of ${sub.seats} is on ${toolName} Enterprise. Business/Team tiers offer identical core capabilities for smaller deployments.`,
            suggestedAction: `Downgrade seats to the ${actionPlan} plan.`,
            currentSpend: sub.monthlySpend,
            estimatedSavings: monthlySavings,
            confidenceScore: 88,
            reasoning: `Enterprise packages usually add model fine-tuning and specialized compliance tools which smaller engineering organizations rarely leverage. Switching to the standard Business/Team package saves substantial capital while retaining GPT-4o/Claude access.`,
          });
        }
      }
    }
  }

  return recommendations;
}

/**
 * 4. Overlapping Tools Rule
 * Detects if the company is paying for multiple tools with high functional overlap:
 * - IDE Coding tools: Cursor, GitHub Copilot, Windsurf
 * - Writing/Chat tools: ChatGPT, Claude, Gemini
 */
export function auditDuplicateTools(profile: CompanySpendProfile): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];

  // Group subscriptions by category
  const ideTools = profile.subscriptions.filter(
    (s) => s.toolId === "cursor" || s.toolId === "copilot" || s.toolId === "windsurf"
  );
  const chatTools = profile.subscriptions.filter(
    (s) => s.toolId === "chatgpt" || s.toolId === "claude" || s.toolId === "gemini"
  );

  // Case A: IDE Overlaps
  if (ideTools.length > 1) {
    // Suggest consolidating to the one with the most active seats or standard Cursor
    ideTools.sort((a, b) => b.activeUsers - a.activeUsers);
    const primary = ideTools[0];
    const secondaryList = ideTools.slice(1);

    for (const sec of secondaryList) {
      const secName = PRICING_CONFIG[sec.toolId]?.name || sec.toolId;
      const primName = PRICING_CONFIG[primary.toolId]?.name || primary.toolId;
      const overlappingSeats = Math.min(primary.activeUsers, sec.activeUsers);
      const unitCost = getUnitCost(sec.toolId, sec.planId, sec.monthlySpend, sec.seats);
      const monthlySavings = overlappingSeats * unitCost;

      if (monthlySavings > 0) {
        recommendations.push({
          id: `overlap-ide-${sec.toolId}`,
          toolId: sec.toolId,
          category: "redundancy",
          title: `Overlapping IDE Copilots (${secName} & ${primName})`,
          description: `You are paying for both ${secName} and ${primName} coding companions. These services serve identical developer IDE roles.`,
          suggestedAction: `Consolidate overlapping developer seats onto ${primName}.`,
          currentSpend: sec.monthlySpend,
          estimatedSavings: monthlySavings,
          confidenceScore: 90,
          reasoning: `Both tools serve identical IDE assistant use cases. Consolidating ${overlappingSeats} developers onto a single companion environment prevents paying double for AI code completion.`,
        });
      }
    }
  }

  // Case B: Chat/Assistant Overlaps
  if (chatTools.length > 1) {
    chatTools.sort((a, b) => b.activeUsers - a.activeUsers);
    const primary = chatTools[0];
    const secondaryList = chatTools.slice(1);

    for (const sec of secondaryList) {
      const secName = PRICING_CONFIG[sec.toolId]?.name || sec.toolId;
      const primName = PRICING_CONFIG[primary.toolId]?.name || primary.toolId;
      const overlappingSeats = Math.min(primary.activeUsers, sec.activeUsers);
      const unitCost = getUnitCost(sec.toolId, sec.planId, sec.monthlySpend, sec.seats);
      const monthlySavings = overlappingSeats * unitCost;

      if (monthlySavings > 0) {
        recommendations.push({
          id: `overlap-chat-${sec.toolId}`,
          toolId: sec.toolId,
          category: "redundancy",
          title: `Overlapping Chat Tools (${secName} & ${primName})`,
          description: `You are paying for both ${secName} and ${primName} workspace subscriptions for the same user cohorts.`,
          suggestedAction: `Consolidate chat licenses onto ${primName}.`,
          currentSpend: sec.monthlySpend,
          estimatedSavings: monthlySavings,
          confidenceScore: 85,
          reasoning: `General-purpose chat assistants have huge functional parity. Selecting a single tool (e.g. ${primName}) and canceling overlapping ${secName} seats prevents license bloat.`,
        });
      }
    }
  }

  return recommendations;
}

/**
 * 5. Alternative Recommendations Rule
 * Recommends cheaper comparable tools.
 * E.g., Cursor Pro ($20) vs Windsurf Pro ($15), or Cursor Business ($40) vs Windsurf Business ($30)
 */
export function auditAlternativeOptions(profile: CompanySpendProfile): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];

  for (const sub of profile.subscriptions) {
    // Check if Cursor can be switched to Windsurf for direct savings
    if (sub.toolId === "cursor") {
      const unitCost = getUnitCost(sub.toolId, sub.planId, sub.monthlySpend, sub.seats);
      
      if (sub.planId === "pro" && unitCost >= 20) {
        const potentialSavings = (unitCost - 15) * sub.seats; // Windsurf Pro is $15
        if (potentialSavings > 0) {
          recommendations.push({
            id: `alt-cursor-windsurf-pro`,
            toolId: "cursor",
            category: "alternative",
            title: "Cheaper IDE Alternative: Windsurf Pro",
            description: `You are currently paying $20/seat for Cursor Pro. Windsurf Pro offers comparable multi-file AI reasoning for $15/seat.`,
            suggestedAction: "Evaluate switching developer seats to Windsurf Pro.",
            currentSpend: sub.monthlySpend,
            estimatedSavings: potentialSavings,
            confidenceScore: 75,
            reasoning: `Windsurf Pro provides full multi-file coding agents (Cascades) at a lower entry rate ($15/mo) compared to Cursor ($20/mo), representing a 25% lower direct subscription overhead.`,
          });
        }
      } else if (sub.planId === "business" && unitCost >= 40) {
        const potentialSavings = (unitCost - 30) * sub.seats; // Windsurf Business is $30
        if (potentialSavings > 0) {
          recommendations.push({
            id: `alt-cursor-windsurf-biz`,
            toolId: "cursor",
            category: "alternative",
            title: "Cheaper IDE Alternative: Windsurf Business",
            description: `You are paying $40/seat for Cursor Business. Windsurf Business provides central admin and privacy security filters for $30/seat.`,
            suggestedAction: "Downgrade seats to Windsurf Business.",
            currentSpend: sub.monthlySpend,
            estimatedSavings: potentialSavings,
            confidenceScore: 75,
            reasoning: `Choosing Windsurf Business preserves core team admin tools, SSO options, and strict privacy clauses while trimming seat licensing fees from $40/mo down to $30/mo.`,
          });
        }
      }
    }
  }

  return recommendations;
}

/**
 * 6. API vs Subscription Inefficiencies Rule
 * Case A: Company is paying high API bills for conversational tasks when a capped SaaS subscription would save money.
 * Case B: Company has low subscription usage where a pay-as-you-go API would cost pennies.
 */
export function auditApiSubscriptionMismatches(profile: CompanySpendProfile): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];

  // Case A: High API spend on conversational/coding tasks
  if (profile.apiUsage) {
    for (const api of profile.apiUsage) {
      if (api.monthlySpend > 300) {
        // Estimate developer seat equivalence: if they have e.g. 5 developers queries
        // If they spend $300 on Claude/OpenAI API primarily for human tools, we can suggest licensing.
        // Assuming ~5-8 users. Let's make a solid, deterministic recommendation
        const assumedUsersCount = Math.max(1, Math.round(profile.companySize * 0.15));
        const costOfSub = assumedUsersCount * 30; // ChatGPT Team or Claude Team at $30
        const potentialSavings = api.monthlySpend - costOfSub;

        if (potentialSavings > 100) {
          const providerName = api.providerId === "openai-api" ? "OpenAI API" : "Anthropic API";
          const subName = api.providerId === "openai-api" ? "ChatGPT Team" : "Claude Team";
          
          recommendations.push({
            id: `api-to-sub-${api.providerId}`,
            toolId: api.providerId,
            category: "api",
            title: `High ${providerName} Pay-As-You-Go Overdraft`,
            description: `Your monthly pay-as-you-go ${providerName} bill is $${api.monthlySpend}. This suggests high human chat utilization or unthrottled playground activity.`,
            suggestedAction: `Migrate active human power users to fixed-rate ${subName} subscriptions.`,
            currentSpend: api.monthlySpend,
            estimatedSavings: potentialSavings,
            confidenceScore: 82,
            reasoning: `If team members use direct developer APIs for daily human queries and writing tasks, they suffer uncapped usage costs. Fixed-fee workspace plans ($30/mo) offer soft-capped high-frequency messaging, capping budgeting risk.`,
          });
        }
      }
    }
  }

  // Case B: Inactive subscriptions where API key is cheaper
  for (const sub of profile.subscriptions) {
    if (sub.activeUsers <= 2 && sub.seats > 0 && sub.monthlySpend >= 100) {
      // Suggest moving to direct API keys for tiny teams that barely load the UI
      const potentialSavings = sub.monthlySpend - 15; // Assume API costs $15/mo for minimal utilization

      if (potentialSavings > 50) {
        const toolName = PRICING_CONFIG[sub.toolId]?.name || sub.toolId;
        const apiName = sub.toolId === "claude" ? "Anthropic API" : "OpenAI API";
        recommendations.push({
          id: `sub-to-api-${sub.toolId}`,
          toolId: sub.toolId,
          category: "api",
          title: `Low-Utilization ${toolName} Licenses`,
          description: `You are paying $${sub.monthlySpend} for ${sub.seats} seats of ${toolName} SaaS, but active utilization is extremely minimal.`,
          suggestedAction: `Downgrade SaaS licenses and implement pay-as-you-go ${apiName} keys.`,
          currentSpend: sub.monthlySpend,
          estimatedSavings: potentialSavings,
          confidenceScore: 80,
          reasoning: `For small groups with occasional workflow needs, paying recurring flat-rate subscriptions ($30/seat) creates heavy waste. Accessing models via direct developer pay-as-you-go API keys caps costs at actual penny consumption.`,
        });
      }
    }
  }

  return recommendations;
}
