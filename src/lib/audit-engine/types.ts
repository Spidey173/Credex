export type ToolId =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "openai-api"
  | "anthropic-api"
  | "gemini"
  | "windsurf";

export type PlanId = "pro" | "business" | "enterprise" | "pay-as-you-go";

export type UseCase = "coding" | "chat" | "search" | "writing";

export interface ToolPlan {
  id: PlanId;
  name: string;
  monthlyCostPerSeat: number;
  minSeats?: number;
  features: string[];
}

export interface ToolConfig {
  id: ToolId;
  name: string;
  plans: ToolPlan[];
  useCaseCompatibilities: UseCase[];
}

export interface SubscriptionInput {
  toolId: ToolId;
  planId: PlanId;
  seats: number;
  activeUsers: number;
  monthlySpend: number;
}

export interface ApiUsageInput {
  providerId: "openai-api" | "anthropic-api";
  monthlySpend: number;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
}

export interface CompanySpendProfile {
  companyName: string;
  companySize: number;
  subscriptions: SubscriptionInput[];
  apiUsage?: ApiUsageInput[];
  workEmail: string;
}

export interface AuditRecommendation {
  id: string;
  toolId: ToolId;
  category: "redundancy" | "abandoned" | "tier" | "api" | "alternative";
  title: string;
  description: string;
  suggestedAction: string;
  currentSpend: number;
  estimatedSavings: number;
  confidenceScore: number; // 0 to 100
  reasoning: string;
}

export interface AuditResult {
  companyName: string;
  totalCurrentSpend: number;
  totalEstimatedSavings: number;
  efficiencyScore: number; // 0 to 100
  recommendations: AuditRecommendation[];
}
