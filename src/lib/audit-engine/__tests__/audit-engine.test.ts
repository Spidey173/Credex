import { describe, it, expect } from "vitest";
import { runSpendAudit } from "../engine";
import { CompanySpendProfile } from "../types";

describe("Credex Rule-Based AI Spend Audit Engine", () => {
  
  // Test 1: Downgrade Logic
  it("should detect suboptimal team plans and enterprise plans to recommend downgrades", () => {
    const profile: CompanySpendProfile = {
      companyName: "Mini Startup",
      companySize: 4,
      workEmail: "hello@startup.io",
      subscriptions: [
        {
          toolId: "claude",
          planId: "business", // Claude Team (minimum 5 seats at $30 = $150)
          seats: 5,
          activeUsers: 3, // 3 active users (bypasses API rule, triggers Claude Team min downgrade)
          monthlySpend: 150,
        },
        {
          toolId: "copilot",
          planId: "enterprise", // Copilot Enterprise at $39
          seats: 3,
          activeUsers: 3,
          monthlySpend: 117,
        }
      ],
    };

    const result = runSpendAudit(profile);

    // 1. Should have recommendations for claude downgrade
    const claudeRec = result.recommendations.find((r) => r.toolId === "claude");
    expect(claudeRec).toBeDefined();
    expect(claudeRec?.category).toBe("tier");
    // Claude Team ($150) downgraded to 3 seats of Pro ($60) => savings of $90
    expect(claudeRec?.estimatedSavings).toBe(90);

    // 2. Should have recommendations for copilot enterprise downgrade
    const copilotRec = result.recommendations.find((r) => r.toolId === "copilot");
    expect(copilotRec).toBeDefined();
    expect(copilotRec?.category).toBe("tier");
    // Copilot Enterprise ($39) downgraded to Copilot Business ($19) => savings of (39-19)*3 = 60
    expect(copilotRec?.estimatedSavings).toBe(60);
  });

  // Test 2: Duplicate Tool Detection
  it("should spot duplicate overlapping tools in the IDE category", () => {
    const profile: CompanySpendProfile = {
      companyName: "Duplicated Devs Inc",
      companySize: 20,
      workEmail: "admin@devs.com",
      subscriptions: [
        {
          toolId: "cursor",
          planId: "pro", // Cursor Pro $20/mo
          seats: 10,
          activeUsers: 10,
          monthlySpend: 200,
        },
        {
          toolId: "windsurf",
          planId: "pro", // Windsurf Pro $15/mo
          seats: 8,
          activeUsers: 8, // overlapping developers using both!
          monthlySpend: 120,
        }
      ],
    };

    const result = runSpendAudit(profile);

    // Should detect redundancy and recommend consolidating Windsurf seats to Cursor
    const overlapRec = result.recommendations.find(
      (r) => r.category === "redundancy" && r.toolId === "windsurf"
    );
    expect(overlapRec).toBeDefined();
    // Overlapping seats = min(10, 8) = 8.
    // Consolidating 8 seats of Windsurf Pro ($15) => savings of $120.
    expect(overlapRec?.estimatedSavings).toBe(120);
  });

  // Test 3: Already Optimized Case
  it("should return high efficiency scores and 0 recommendations for optimized accounts", () => {
    const profile: CompanySpendProfile = {
      companyName: "Lean Labs",
      companySize: 10,
      workEmail: "info@lean.io",
      subscriptions: [
        {
          toolId: "copilot",
          planId: "business", // GitHub Copilot Business $19/seat
          seats: 8,
          activeUsers: 8, // 100% active utilization
          monthlySpend: 152,
        },
        {
          toolId: "chatgpt",
          planId: "business", // ChatGPT Team $30 (min 2 seats = $60)
          seats: 2,
          activeUsers: 2,
          monthlySpend: 60,
        }
      ],
    };

    const result = runSpendAudit(profile);

    expect(result.recommendations.length).toBe(0);
    expect(result.totalEstimatedSavings).toBe(0);
    expect(result.efficiencyScore).toBe(100);
  });

  // Test 4: Savings Calculations
  it("should compute exact seat-level savings for underutilized inactive seats", () => {
    const profile: CompanySpendProfile = {
      companyName: "Wasteful Org",
      companySize: 50,
      workEmail: "ops@wasteful.org",
      subscriptions: [
        {
          toolId: "chatgpt",
          planId: "pro", // ChatGPT Plus is $20
          seats: 40,
          activeUsers: 25, // 15 idle seats!
          monthlySpend: 800,
        }
      ],
    };

    const result = runSpendAudit(profile);

    const rec = result.recommendations.find((r) => r.category === "abandoned");
    expect(rec).toBeDefined();
    // 15 idle seats * $20 unit cost = $300 savings
    expect(rec?.estimatedSavings).toBe(300);
    expect(result.totalEstimatedSavings).toBe(300);
    // Efficiency = (800 - 300) / 800 = 62.5% => rounded to 63%
    expect(result.efficiencyScore).toBe(63);
  });

  // Test 5: Alternative Recommendations
  it("should evaluate alternative, more cost-efficient platform solutions", () => {
    const profile: CompanySpendProfile = {
      companyName: "Cost Cutter LLC",
      companySize: 12,
      workEmail: "save@cutter.com",
      subscriptions: [
        {
          toolId: "cursor",
          planId: "pro", // Cursor Pro at $20/mo
          seats: 6,
          activeUsers: 6,
          monthlySpend: 120,
        }
      ],
    };

    const result = runSpendAudit(profile);

    // Switch Cursor Pro ($20) to Windsurf Pro ($15) => savings of (20 - 15) * 6 = $30
    const rec = result.recommendations.find((r) => r.category === "alternative");
    expect(rec).toBeDefined();
    expect(rec?.estimatedSavings).toBe(30);
  });

});
