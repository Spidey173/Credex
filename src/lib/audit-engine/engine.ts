import { CompanySpendProfile, AuditResult, AuditRecommendation } from "./types";
import {
  auditUnderutilizedSeats,
  auditOverpayingForTeams,
  auditUnnecessaryEnterprise,
  auditDuplicateTools,
  auditAlternativeOptions,
  auditApiSubscriptionMismatches,
} from "./rules";

/**
 * Executes a full rule-based AI spend audit based on a company's spend profile.
 * Computes deterministic savings and generates strongly-typed recommendations.
 */
export function runSpendAudit(profile: CompanySpendProfile): AuditResult {
  // 1. Roll up total current monthly spend
  const totalSubSpend = profile.subscriptions.reduce((sum, s) => sum + s.monthlySpend, 0);
  const totalApiSpend = profile.apiUsage ? profile.apiUsage.reduce((sum, a) => sum + a.monthlySpend, 0) : 0;
  const totalCurrentSpend = totalSubSpend + totalApiSpend;

  // 2. Gather recommendations from all modules
  const rawRecommendations: AuditRecommendation[] = [
    ...auditUnderutilizedSeats(profile),
    ...auditOverpayingForTeams(profile),
    ...auditUnnecessaryEnterprise(profile),
    ...auditDuplicateTools(profile),
    ...auditAlternativeOptions(profile),
    ...auditApiSubscriptionMismatches(profile),
  ];

  // 3. Deduplicate recommendations and compute precise savings
  // To avoid double-counting savings on the same tool (e.g. idle seats vs alternative tools),
  // we will sort by estimated savings (highest first) and process them.
  // We keep track of how much spend is remaining for each tool to prevent saving more than the tool's cost.
  const spendTracking: Record<string, number> = {};
  for (const sub of profile.subscriptions) {
    spendTracking[sub.toolId] = sub.monthlySpend;
  }
  if (profile.apiUsage) {
    for (const api of profile.apiUsage) {
      spendTracking[api.providerId] = api.monthlySpend;
    }
  }

  const finalRecommendations: AuditRecommendation[] = [];
  let totalEstimatedSavings = 0;

  // Sort: highest savings first
  const sortedRecs = [...rawRecommendations].sort((a, b) => b.estimatedSavings - a.estimatedSavings);

  for (const rec of sortedRecs) {
    const currentSpendLimit = spendTracking[rec.toolId] ?? 0;

    if (currentSpendLimit > 0) {
      // Cap the estimated savings of this recommendation to the remaining tool spend
      const allowedSavings = Math.min(rec.estimatedSavings, currentSpendLimit);

      if (allowedSavings > 0) {
        spendTracking[rec.toolId] -= allowedSavings;
        totalEstimatedSavings += allowedSavings;

        // Push recommendation with capped allowedSavings
        finalRecommendations.push({
          ...rec,
          estimatedSavings: Math.round(allowedSavings * 100) / 100, // round to 2 decimals
        });
      }
    }
  }

  // 4. Compute financial efficiency scoring (0-100)
  let efficiencyScore = 100;
  if (totalCurrentSpend > 0) {
    const savingsRatio = totalEstimatedSavings / totalCurrentSpend;
    efficiencyScore = Math.max(0, Math.min(100, Math.round((1 - savingsRatio) * 100)));
  }

  return {
    companyName: profile.companyName,
    totalCurrentSpend: Math.round(totalCurrentSpend * 100) / 100,
    totalEstimatedSavings: Math.round(totalEstimatedSavings * 100) / 100,
    efficiencyScore,
    recommendations: finalRecommendations,
  };
}
