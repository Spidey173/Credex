import { ToolConfig } from "./types";

export const PRICING_CONFIG: Record<string, ToolConfig> = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    useCaseCompatibilities: ["coding"],
    plans: [
      {
        id: "pro",
        name: "Pro",
        monthlyCostPerSeat: 20,
        features: ["Unlimited fast GPT-4o/Claude 3.5 Sonnet", "Composer mode", "Local context index"],
      },
      {
        id: "business",
        name: "Business",
        monthlyCostPerSeat: 40,
        features: ["SSO/SAML", "Centralized billing", "Zero data retention policy"],
      },
    ],
  },
  copilot: {
    id: "copilot",
    name: "GitHub Copilot",
    useCaseCompatibilities: ["coding"],
    plans: [
      {
        id: "pro",
        name: "Individual",
        monthlyCostPerSeat: 10,
        features: ["Inline code suggestions", "Chat in IDE"],
      },
      {
        id: "business",
        name: "Business",
        monthlyCostPerSeat: 19,
        features: ["Organizational license management", "IP indemnity", "Privacy controls"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCostPerSeat: 39,
        features: ["Custom model training fine-tuning", "Docs indexing", "Advanced security controls"],
      },
    ],
  },
  claude: {
    id: "claude",
    name: "Claude AI",
    useCaseCompatibilities: ["chat", "writing"],
    plans: [
      {
        id: "pro",
        name: "Pro",
        monthlyCostPerSeat: 20,
        features: ["Access to Claude 3.5 Sonnet & Opus", "High usage limits", "Projects & Artifacts"],
      },
      {
        id: "business",
        name: "Team",
        monthlyCostPerSeat: 30,
        minSeats: 5,
        features: ["Centralized billing", "Higher usage caps", "Administrative workspace console"],
      },
    ],
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    useCaseCompatibilities: ["chat", "search", "writing"],
    plans: [
      {
        id: "pro",
        name: "Plus",
        monthlyCostPerSeat: 20,
        features: ["Access to GPT-4o & o1", "GPT builder", "Advanced voice mode"],
      },
      {
        id: "business",
        name: "Team",
        monthlyCostPerSeat: 30,
        minSeats: 2,
        features: ["SSO", "Shared workspace", "Zero training on business chats"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCostPerSeat: 60,
        features: ["Unlimited fast GPT-4o", "SSO/SAML", "Advanced analytics dashboards"],
      },
    ],
  },
  "openai-api": {
    id: "openai-api",
    name: "OpenAI API",
    useCaseCompatibilities: ["coding", "chat", "search", "writing"],
    plans: [
      {
        id: "pay-as-you-go",
        name: "Pay As You Go",
        monthlyCostPerSeat: 0,
        features: ["Usage-based billing", "Custom rate limits", "GPT-4o fine-tuning"],
      },
    ],
  },
  "anthropic-api": {
    id: "anthropic-api",
    name: "Anthropic API",
    useCaseCompatibilities: ["coding", "chat", "writing"],
    plans: [
      {
        id: "pay-as-you-go",
        name: "Pay As You Go",
        monthlyCostPerSeat: 0,
        features: ["Usage-based billing", "Claude Sonnet/Haiku fine-tuning"],
      },
    ],
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    useCaseCompatibilities: ["chat", "search", "writing"],
    plans: [
      {
        id: "pro",
        name: "Advanced",
        monthlyCostPerSeat: 20,
        features: ["Access to 1.5 Pro", "2TB Google One storage"],
      },
      {
        id: "business",
        name: "Business",
        monthlyCostPerSeat: 20,
        features: ["Gemini in Workspace (Docs, Gmail)", "Administrative panel"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCostPerSeat: 30,
        features: ["Full enterprise encryption", "Uncapped usage in Workspace"],
      },
    ],
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    useCaseCompatibilities: ["coding"],
    plans: [
      {
        id: "pro",
        name: "Pro",
        monthlyCostPerSeat: 15,
        features: ["Cascades mode", "Super-fast AI autocomplete", "Unified Chat"],
      },
      {
        id: "business",
        name: "Business",
        monthlyCostPerSeat: 30,
        features: ["SSO integration", "Team usage analytics", "Zero data retention"],
      },
    ],
  },
};
