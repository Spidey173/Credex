import { create } from "zustand";
import { z } from "zod";
import { runSpendAudit } from "@/lib/audit-engine/engine";
import { CompanySpendProfile, AuditResult, SubscriptionInput, ApiUsageInput } from "@/lib/audit-engine/types";

// Zod schema for instant audit validation
export const AuditFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  monthlySpend: z.coerce.number().min(1, "Please enter a valid monthly spend"),
  email: z.string().email("Please enter a valid work email address"),
});

export type AuditFormValues = z.infer<typeof AuditFormSchema>;

export type AuditStage = "idle" | "connecting" | "scanning" | "analyzing" | "completed";

interface AuditState {
  stage: AuditStage;
  progress: number;
  formData: AuditFormValues | null;
  customProfile: CompanySpendProfile | null;
  auditResult: AuditResult | null;
  error: string | null;
  startAudit: (data: AuditFormValues) => void;
  startDetailedAudit: (profile: CompanySpendProfile) => void;
  resetAudit: () => void;
  setStage: (stage: AuditStage) => void;
  setProgress: (progress: number) => void;
  runEngine: () => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  stage: "idle",
  progress: 0,
  formData: null,
  customProfile: null,
  auditResult: null,
  error: null,

  setStage: (stage) => set({ stage }),
  setProgress: (progress) => set({ progress }),

  startAudit: (data) => {
    const validation = AuditFormSchema.safeParse(data);
    if (!validation.success) {
      set({ error: validation.error.issues[0]?.message || "Invalid inputs" });
      return;
    }

    set({
      stage: "connecting",
      progress: 5,
      formData: validation.data,
      customProfile: null,
      auditResult: null,
      error: null,
    });
  },

  startDetailedAudit: (profile) => {
    set({
      stage: "connecting",
      progress: 5,
      formData: null,
      customProfile: profile,
      auditResult: null,
      error: null,
    });
  },

  runEngine: () => {
    const { formData, customProfile } = get();

    // Case A: If user entered detailed profile directly, run audit on it!
    if (customProfile) {
      const result = runSpendAudit(customProfile);
      set({
        auditResult: result,
        stage: "completed",
        progress: 100,
      });
      return;
    }

    // Case B: Deriving profile in Quick Scan mode
    if (!formData) return;
    const enteredSpend = formData.monthlySpend;

    const cursorSeats = Math.max(2, Math.round((enteredSpend * 0.3) / 40)); // Cursor Business is $40
    const cursorActive = Math.max(1, Math.round(cursorSeats * 0.6)); // 40% idle seats
    const cursorSpend = cursorSeats * 40;

    const claudeSeats = 5; // Claude Team minimum
    const claudeActive = 3; // 3 active users (will trigger team limit)
    const claudeSpend = 150; // $150 minimum

    const copilotSeats = Math.max(2, Math.round((enteredSpend * 0.25) / 39)); // Copilot Enterprise is $39
    const copilotActive = copilotSeats;
    const copilotSpend = copilotSeats * 39;

    const apiSpend = Math.round(enteredSpend * 0.2);

    const subscriptions: SubscriptionInput[] = [
      {
        toolId: "cursor",
        planId: "business",
        seats: cursorSeats,
        activeUsers: cursorActive,
        monthlySpend: cursorSpend,
      },
      {
        toolId: "claude",
        planId: "business",
        seats: claudeSeats,
        activeUsers: claudeActive,
        monthlySpend: claudeSpend,
      },
      {
        toolId: "copilot",
        planId: "enterprise",
        seats: copilotSeats,
        activeUsers: copilotActive,
        monthlySpend: copilotSpend,
      }
    ];

    const apiUsage: ApiUsageInput[] = apiSpend > 100 ? [
      {
        providerId: "openai-api",
        monthlySpend: apiSpend,
        monthlyInputTokens: apiSpend * 1000000,
        monthlyOutputTokens: apiSpend * 250000,
      }
    ] : [];

    const profile: CompanySpendProfile = {
      companyName: formData.companyName,
      companySize: Math.max(5, Math.round(cursorSeats * 3)),
      workEmail: formData.email,
      subscriptions,
      apiUsage,
    };

    const result = runSpendAudit(profile);

    set({
      auditResult: result,
      customProfile: profile,
      stage: "completed",
      progress: 100,
    });
  },

  resetAudit: () => {
    set({
      stage: "idle",
      progress: 0,
      formData: null,
      customProfile: null,
      auditResult: null,
      error: null,
    });
  },
}));
