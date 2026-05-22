"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { PRICING_CONFIG } from "@/lib/audit-engine/pricing";
import { ToolId, PlanId, UseCase, CompanySpendProfile } from "@/lib/audit-engine/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Trash2, ArrowLeft, ArrowRight,
  Building, Users, Mail, Layers, Terminal, Sparkles, ShieldCheck
} from "lucide-react";

// Types for form state
interface FormSubscription {
  toolId: ToolId;
  planId: PlanId;
  seats: number;
  activeUsers: number;
  monthlySpend: number;
  useCase: UseCase;
}

interface FormApiUsage {
  providerId: "openai-api" | "anthropic-api";
  monthlySpend: number;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
}

interface SpendFormValues {
  companyName: string;
  companySize: number;
  workEmail: string;
  subscriptions: FormSubscription[];
  apiUsage: FormApiUsage[];
}

const LOCAL_STORAGE_KEY = "credex_detailed_draft_v1";

export default function DetailedSpendForm({ onComplete }: { onComplete: (profile: CompanySpendProfile) => void }) {
  const [step, setStep] = React.useState<number>(1);
  const [formState, setFormState] = React.useState<SpendFormValues>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.companyName !== undefined) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load detailed draft", e);
      }
    }
    return {
      companyName: "",
      companySize: 5,
      workEmail: "",
      subscriptions: [
        { toolId: "cursor", planId: "pro", seats: 3, activeUsers: 3, monthlySpend: 60, useCase: "coding" }
      ],
      apiUsage: []
    };
  });

  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // 2. Persist state helper
  const saveDraft = (updatedState: SpendFormValues) => {
    setFormState(updatedState);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedState));
    } catch (e) {
      console.error("Failed to save draft", e);
    }
  };

  // Helper to pre-populate smart defaults
  const handleToolChange = (subIndex: number, toolId: ToolId) => {
    const updated = { ...formState };
    const sub = updated.subscriptions[subIndex];
    if (!sub) return;

    sub.toolId = toolId;
    
    // Pick the first plan of the tool as smart default
    const config = PRICING_CONFIG[toolId];
    if (config && config.plans.length > 0) {
      sub.planId = config.plans[0].id;
      sub.useCase = config.useCaseCompatibilities[0] || "chat";
      // Compute smart default monthly cost: seats * monthlyCostPerSeat
      const planCost = config.plans[0].monthlyCostPerSeat;
      sub.monthlySpend = sub.seats * planCost;
    }

    saveDraft(updated);
  };

  const handlePlanChange = (subIndex: number, planId: PlanId) => {
    const updated = { ...formState };
    const sub = updated.subscriptions[subIndex];
    if (!sub) return;

    sub.planId = planId;

    // Recalculate cost with new plan
    const config = PRICING_CONFIG[sub.toolId];
    const plan = config?.plans.find((p) => p.id === planId);
    if (plan) {
      sub.monthlySpend = sub.seats * plan.monthlyCostPerSeat;
    }

    saveDraft(updated);
  };

  const handleSeatsChange = (subIndex: number, seats: number) => {
    const updated = { ...formState };
    const sub = updated.subscriptions[subIndex];
    if (!sub) return;

    sub.seats = seats;
    if (sub.activeUsers > seats) {
      sub.activeUsers = seats; // Cap active users to seats count
    }

    // Recalculate cost
    const config = PRICING_CONFIG[sub.toolId];
    const plan = config?.plans.find((p) => p.id === sub.planId);
    if (plan) {
      sub.monthlySpend = seats * plan.monthlyCostPerSeat;
    }

    saveDraft(updated);
  };

  // Generic updaters
  const updateSubscriptionField = <K extends keyof FormSubscription>(
    subIndex: number,
    field: K,
    value: FormSubscription[K]
  ) => {
    const updated = { ...formState };
    const sub = updated.subscriptions[subIndex];
    if (!sub) return;

    sub[field] = value;
    saveDraft(updated);
  };

  const addSubscription = () => {
    const updated = { ...formState };
    updated.subscriptions.push({
      toolId: "claude",
      planId: "pro",
      seats: 2,
      activeUsers: 2,
      monthlySpend: 40,
      useCase: "chat"
    });
    saveDraft(updated);
  };

  const removeSubscription = (subIndex: number) => {
    const updated = { ...formState };
    updated.subscriptions.splice(subIndex, 1);
    saveDraft(updated);
  };

  // API Field Updaters
  const updateApiField = <K extends keyof FormApiUsage>(
    apiIndex: number,
    field: K,
    value: FormApiUsage[K]
  ) => {
    const updated = { ...formState };
    const api = updated.apiUsage[apiIndex];
    if (!api) return;

    api[field] = value;

    // Smart default tokens: Spend * 1M input, Spend * 250k output
    if (field === "monthlySpend") {
      const numValue = Number(value);
      api.monthlyInputTokens = numValue * 1000000;
      api.monthlyOutputTokens = numValue * 250000;
    }

    saveDraft(updated);
  };

  const addApi = () => {
    const updated = { ...formState };
    updated.apiUsage.push({
      providerId: "openai-api",
      monthlySpend: 150,
      monthlyInputTokens: 150000000,
      monthlyOutputTokens: 37500000
    });
    saveDraft(updated);
  };

  const removeApi = (apiIndex: number) => {
    const updated = { ...formState };
    updated.apiUsage.splice(apiIndex, 1);
    saveDraft(updated);
  };

  // Step Navigations with Validation
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formState.companyName.trim()) {
        errors.companyName = "Company name is required.";
      }
      if (formState.companySize <= 0) {
        errors.companySize = "Please enter a valid company size.";
      }
      if (!formState.workEmail.trim() || !formState.workEmail.includes("@")) {
        errors.workEmail = "Please enter a valid work email.";
      }
    }

    if (step === 2) {
      formState.subscriptions.forEach((sub, i) => {
        if (sub.seats <= 0) {
          errors[`sub-${i}-seats`] = "Seats must be greater than 0.";
        }
        if (sub.activeUsers < 0 || sub.activeUsers > sub.seats) {
          errors[`sub-${i}-active`] = "Active users must be between 0 and seats.";
        }
        if (sub.monthlySpend < 0) {
          errors[`sub-${i}-spend`] = "Monthly spend cannot be negative.";
        }
      });
    }

    if (step === 3) {
      formState.apiUsage.forEach((api, i) => {
        if (api.monthlySpend < 0) {
          errors[`api-${i}-spend`] = "Monthly spend cannot be negative.";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      // Package data into proper type-safe profile
      const profile: CompanySpendProfile = {
        companyName: formState.companyName,
        companySize: Number(formState.companySize),
        workEmail: formState.workEmail,
        subscriptions: formState.subscriptions.map((s) => ({
          toolId: s.toolId,
          planId: s.planId,
          seats: Number(s.seats),
          activeUsers: Number(s.activeUsers),
          monthlySpend: Number(s.monthlySpend),
        })),
        apiUsage: formState.apiUsage.map((a) => ({
          providerId: a.providerId,
          monthlySpend: Number(a.monthlySpend),
          monthlyInputTokens: Number(a.monthlyInputTokens),
          monthlyOutputTokens: Number(a.monthlyOutputTokens),
        })),
      };

      // Clear localStorage draft upon successful audit
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {}

      onComplete(profile);
    }
  };

  // Steps Progress Math
  const progressPercent = (step / 4) * 100;

  return (
    <div className="w-full text-neutral-200">
      {/* Form Wizard Header & Progress */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
          <span>Detailed Ledger Build</span>
          <span>Step {step} of 4 • {Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} indicatorClassName="bg-gradient-to-r from-violet-600 to-indigo-500" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: COMPANY METRICS */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight">Corporate Demographics</h4>
                <p className="text-xs text-neutral-400">Establish basic tenant variables to audit relative pricing thresholds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 font-sans pl-0.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-violet-400" />
                    Company Name
                  </label>
                  <Input
                    placeholder="e.g. Linear Technologies"
                    value={formState.companyName}
                    onChange={(e) => saveDraft({ ...formState, companyName: e.target.value })}
                  />
                  {validationErrors.companyName && (
                    <span className="text-[11px] text-red-400 font-mono block pl-0.5">{validationErrors.companyName}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 font-sans pl-0.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    Global Team Size (headcount)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 15"
                    value={formState.companySize}
                    onChange={(e) => saveDraft({ ...formState, companySize: Math.max(1, Number(e.target.value)) })}
                  />
                  {validationErrors.companySize && (
                    <span className="text-[11px] text-red-400 font-mono block pl-0.5">{validationErrors.companySize}</span>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-neutral-400 font-sans pl-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-violet-400" />
                    Corporate Work Email
                  </label>
                  <Input
                    type="email"
                    placeholder="ops@linear.app"
                    value={formState.workEmail}
                    onChange={(e) => saveDraft({ ...formState, workEmail: e.target.value })}
                  />
                  {validationErrors.workEmail && (
                    <span className="text-[11px] text-red-400 font-mono block pl-0.5">{validationErrors.workEmail}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DYNAMIC SAAS SUBSCRIPTIONS */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white tracking-tight">AI & SaaS License Inventory</h4>
                  <p className="text-xs text-neutral-400">Map active subscriptions. Cost defaults adjust dynamically upon plan choice.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSubscription} className="gap-1.5 font-mono text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Add Tool
                </Button>
              </div>

              {/* Tools Empty State */}
              {formState.subscriptions.length === 0 ? (
                <div className="border border-dashed border-neutral-900 rounded-xl p-8 text-center space-y-3 bg-neutral-950/20">
                  <Layers className="w-8 h-8 text-neutral-600 mx-auto" />
                  <div className="text-sm font-semibold text-neutral-300">No tools registered</div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">Add at least one active license (e.g. Cursor Pro or Claude Team) to scan for suboptimal scaling.</p>
                  <Button type="button" variant="glow" size="sm" onClick={addSubscription}>
                    Add Cursor Pro Draft
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {formState.subscriptions.map((sub, index) => {
                    const availablePlans = PRICING_CONFIG[sub.toolId]?.plans || [];
                    return (
                      <div
                        key={index}
                        className="flex flex-col p-4 border border-neutral-900 rounded-lg bg-neutral-950/40 relative space-y-4 hover:border-neutral-800 transition-all duration-300"
                      >
                        {/* Interactive inner card header */}
                        <div className="flex justify-between items-center border-b border-neutral-900/50 pb-2">
                          <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">License Item #{index + 1}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                        </div>

                        {/* Selector Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase">AI Platform</label>
                            <select
                              value={sub.toolId}
                              onChange={(e) => handleToolChange(index, e.target.value as ToolId)}
                              className="w-full h-10 rounded-lg border border-neutral-900 bg-neutral-950 px-2.5 text-xs text-neutral-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                            >
                              {Object.values(PRICING_CONFIG)
                                .filter((t) => t.id !== "openai-api" && t.id !== "anthropic-api")
                                .map((t) => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase">Subscription Plan</label>
                            <select
                              value={sub.planId}
                              onChange={(e) => handlePlanChange(index, e.target.value as PlanId)}
                              className="w-full h-10 rounded-lg border border-neutral-900 bg-neutral-950 px-2.5 text-xs text-neutral-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                            >
                              {availablePlans.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase">Primary Use Case</label>
                            <select
                              value={sub.useCase}
                              onChange={(e) => updateSubscriptionField(index, "useCase", e.target.value as UseCase)}
                              className="w-full h-10 rounded-lg border border-neutral-900 bg-neutral-950 px-2.5 text-xs text-neutral-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                            >
                              {["coding", "chat", "search", "writing"].map((uc) => (
                                <option key={uc} value={uc}>{uc.toUpperCase()}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Numeric Spend Row */}
                        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 items-end">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase pl-0.5">Seats Count</label>
                            <Input
                              type="number"
                              min="1"
                              value={sub.seats}
                              onChange={(e) => handleSeatsChange(index, Math.max(1, Number(e.target.value)))}
                              className="h-9 px-2 text-xs"
                            />
                            {validationErrors[`sub-${index}-seats`] && (
                              <span className="text-[9px] text-red-400 font-mono block pl-0.5">{validationErrors[`sub-${index}-seats`]}</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase pl-0.5">Active Users</label>
                            <Input
                              type="number"
                              min="0"
                              value={sub.activeUsers}
                              onChange={(e) => updateSubscriptionField(index, "activeUsers", Math.max(0, Number(e.target.value)))}
                              className="h-9 px-2 text-xs"
                            />
                            {validationErrors[`sub-${index}-active`] && (
                              <span className="text-[9px] text-red-400 font-mono block pl-0.5">{validationErrors[`sub-${index}-active`]}</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase pl-0.5">Monthly Spend ($)</label>
                            <Input
                              type="number"
                              min="0"
                              value={sub.monthlySpend}
                              onChange={(e) => updateSubscriptionField(index, "monthlySpend", Math.max(0, Number(e.target.value)))}
                              className="h-9 px-2 text-xs"
                            />
                            {validationErrors[`sub-${index}-spend`] && (
                              <span className="text-[9px] text-red-400 font-mono block pl-0.5">{validationErrors[`sub-${index}-spend`]}</span>
                            )}
                          </div>

                          <div className="flex justify-end pt-1 col-span-2 xs:col-span-1 sm:col-span-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-9 px-3 gap-1.5 font-mono text-xs w-full cursor-pointer"
                              onClick={() => removeSubscription(index)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: DEVELOPER API INVENTORIES */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white tracking-tight">Developer API Interfaces (Optional)</h4>
                  <p className="text-xs text-neutral-400">Log pay-as-you-go OpenAI or Anthropic API accounts to audit for seat transitions.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addApi} className="gap-1.5 font-mono text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Add API
                </Button>
              </div>

              {formState.apiUsage.length === 0 ? (
                <div className="border border-dashed border-neutral-900 rounded-xl p-8 text-center space-y-3 bg-neutral-950/20">
                  <Terminal className="w-8 h-8 text-neutral-600 mx-auto" />
                  <div className="text-sm font-semibold text-neutral-300">No developer API connections</div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">Skip or click Add API if you spend on token keys for backend development or custom UI integrations.</p>
                  <Button type="button" variant="secondary" size="sm" className="font-mono text-xs" onClick={addApi}>
                    Add API Connection
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {formState.apiUsage.map((api, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-4 border border-neutral-900 rounded-lg bg-neutral-950/40 space-y-4 relative hover:border-neutral-800 transition-all duration-300"
                    >
                      {/* Interactive inner card header */}
                      <div className="flex justify-between items-center border-b border-neutral-900/50 pb-2">
                        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">API Interface #{index + 1}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-500 uppercase">API Provider</label>
                          <select
                            value={api.providerId}
                            onChange={(e) => updateApiField(index, "providerId", e.target.value as "openai-api" | "anthropic-api")}
                            className="w-full h-10 rounded-lg border border-neutral-900 bg-neutral-950 px-2.5 text-xs text-neutral-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                          >
                            <option value="openai-api">OpenAI API</option>
                            <option value="anthropic-api">Anthropic API</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-500 uppercase pl-0.5">Monthly Spend ($)</label>
                          <Input
                            type="number"
                            min="0"
                            value={api.monthlySpend}
                            onChange={(e) => updateApiField(index, "monthlySpend", Math.max(0, Number(e.target.value)))}
                            className="h-10 text-xs"
                          />
                          {validationErrors[`api-${index}-spend`] && (
                            <span className="text-[9px] text-red-400 font-mono block pl-0.5">{validationErrors[`api-${index}-spend`]}</span>
                          )}
                        </div>

                        <div className="flex justify-end pt-1 col-span-1 xs:col-span-2 sm:col-span-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-10 px-3 gap-1.5 font-mono text-xs w-full cursor-pointer"
                            onClick={() => removeApi(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Provider
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: VERIFICATION PREVIEW SHEET */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white tracking-tight font-sans">Ledger Validation Review</h4>
                <p className="text-xs text-neutral-400">Double check your inventory ledger layout before triggering mathematical check models.</p>
              </div>

              {/* The summary sheet grid */}
              <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/60 font-sans text-xs">
                {/* Meta details header */}
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center p-4 border-b border-neutral-900 bg-neutral-950/80 gap-3">
                  <div>
                    <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-wider">Tenant Profile</span>
                    <span className="font-bold text-white text-sm">{formState.companyName || "Acme Inc"}</span>
                  </div>
                  <div className="text-left xs:text-right">
                    <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-wider">Demographics</span>
                    <span className="text-neutral-300 font-medium">{formState.companySize} employees • {formState.workEmail}</span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* SaaS tools listing */}
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2 font-bold">Registered Active SaaS</span>
                    {formState.subscriptions.length === 0 ? (
                      <span className="text-xs text-neutral-600 block pl-1 italic">No SaaS subscriptions declared.</span>
                    ) : (
                      <div className="space-y-2">
                        {formState.subscriptions.map((sub, i) => (
                          <div key={i} className="flex flex-col xs:flex-row xs:justify-between xs:items-center p-2.5 rounded bg-neutral-950 border border-neutral-900/60 gap-2">
                            <div>
                              <span className="font-semibold text-white block capitalize">
                                {PRICING_CONFIG[sub.toolId]?.name || sub.toolId}
                              </span>
                              <span className="text-[10px] text-neutral-500 block">
                                Plan: <span className="capitalize">{sub.planId}</span> • Use case: <span className="capitalize">{sub.useCase}</span>
                              </span>
                            </div>
                            <div className="text-left xs:text-right">
                              <span className="font-bold text-white block font-mono">${sub.monthlySpend}/mo</span>
                              <span className="text-[10px] text-emerald-400 block font-mono">
                                {sub.activeUsers} / {sub.seats} active seats
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* API Tools Listing */}
                  {formState.apiUsage.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2 font-bold">Registered API Usage</span>
                      <div className="space-y-2">
                        {formState.apiUsage.map((api, i) => (
                          <div key={i} className="flex flex-col xs:flex-row xs:justify-between xs:items-center p-2.5 rounded bg-neutral-950 border border-neutral-900/60 gap-2">
                            <div>
                              <span className="font-semibold text-white block capitalize">
                                {api.providerId === "openai-api" ? "OpenAI API" : "Anthropic API"}
                              </span>
                              <span className="text-[10px] text-neutral-500 block">
                                Pay-As-You-Go token endpoints
                              </span>
                            </div>
                            <div className="text-left xs:text-right">
                              <span className="font-bold text-white block font-mono">${api.monthlySpend}/mo</span>
                              <span className="text-[10px] text-neutral-500 block font-mono">
                                ~{Math.round(api.monthlyInputTokens / 1000000)}M input tokens
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure Assurance Tag */}
              <div className="p-3 border border-emerald-950/40 bg-emerald-950/10 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero configuration parameters saved on remote server. All equations resolve inside secure frontend client compile modules.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Footer Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
          <div>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="gap-1.5 font-mono text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {step < 4 ? (
              <Button type="button" variant="secondary" onClick={nextStep} className="gap-1.5 font-mono text-xs">
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button type="submit" variant="glow" className="gap-2 group font-semibold shadow-xl shadow-violet-500/5">
                Run Audit Engine
                <Sparkles className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
