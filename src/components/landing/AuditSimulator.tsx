"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/store/useAuditStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Terminal, Cpu, ArrowRight, RefreshCw, 
  AlertTriangle, Database, Layers, FlameKindling, CheckCircle2
} from "lucide-react";
import DetailedSpendForm from "./DetailedSpendForm";

export default function AuditSimulator() {
  const { stage, startAudit, startDetailedAudit, resetAudit, auditResult, runEngine } = useAuditStore();
  const [internalProgress, setInternalProgress] = React.useState(0);
  const [activeStageText, setActiveStageText] = React.useState("");
  
  // Tab selector mode: "quick" | "detailed"
  const [mode, setMode] = React.useState<"quick" | "detailed">("quick");

  // Local state for simulator values
  const [company, setCompany] = React.useState("");
  const [spend, setSpend] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [localError, setLocalError] = React.useState("");

  // Stage sequence animation control
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    let subTimer: NodeJS.Timeout;

    if (stage === "connecting") {
      setTimeout(() => {
        setInternalProgress(5);
        setActiveStageText("Securing TLS handshake with Cloud APIs & Single Sign-On providers...");
      }, 0);
      
      timer = setTimeout(() => {
        useAuditStore.setState({ stage: "scanning", progress: 40 });
      }, 1400);
    } else if (stage === "scanning") {
      setTimeout(() => {
        setInternalProgress(40);
        setActiveStageText("Mapping active SaaS seat allocations and checking license registries...");
      }, 0);
      
      timer = setTimeout(() => {
        useAuditStore.setState({ stage: "analyzing", progress: 75 });
      }, 1600);
    } else if (stage === "analyzing") {
      setTimeout(() => {
        setInternalProgress(75);
        setActiveStageText("Running deterministic spend auditing engine against mock profiles...");
      }, 0);
      
      timer = setTimeout(() => {
        setTimeout(() => {
          setInternalProgress(100);
          setActiveStageText("Aggregating optimization paths and deduplicating budget ledger...");
        }, 0);
        
        subTimer = setTimeout(() => {
          // Trigger the actual TS rule engine!
          runEngine();
        }, 1000);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(subTimer);
    };
  }, [stage, runEngine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!company) {
      setLocalError("Please enter a company name.");
      return;
    }
    if (!spend || isNaN(Number(spend)) || Number(spend) <= 0) {
      setLocalError("Please enter a valid monthly spend.");
      return;
    }
    if (!email || !email.includes("@")) {
      setLocalError("Please enter a valid business email.");
      return;
    }

    startAudit({
      companyName: company,
      monthlySpend: Number(spend),
      email: email,
    });
  };

  const handleReset = () => {
    setCompany("");
    setSpend("");
    setEmail("");
    setLocalError("");
    setInternalProgress(0);
    resetAudit();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "redundancy": return <Layers className="w-4 h-4 text-violet-400" />;
      case "abandoned": return <Database className="w-4 h-4 text-emerald-400" />;
      case "tier": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "api": return <FlameKindling className="w-4 h-4 text-red-400" />;
      default: return <Cpu className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "redundancy": return <Badge variant="purple">Tool Redundancy</Badge>;
      case "abandoned": return <Badge variant="success">Unused Seats</Badge>;
      case "tier": return <Badge variant="warning">Suboptimal Tier</Badge>;
      case "api": return <Badge className="bg-red-950/40 border-red-900/50 text-red-400">API vs SaaS</Badge>;
      case "alternative": return <Badge variant="outline">Alternative</Badge>;
      default: return <Badge variant="outline">Anomaly</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden bg-neutral-950/40 border border-neutral-900 shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-emerald-500/2 opacity-30 pointer-events-none" />
      
      {/* Simulator Frame Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-900 bg-neutral-950/80">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-800" />
            <span className="w-3 h-3 rounded-full bg-neutral-800" />
            <span className="w-3 h-3 rounded-full bg-neutral-800" />
          </span>
          <span className="text-xs font-mono text-neutral-500 border-l border-neutral-900 pl-3">
            credex-rule-engine-v2.1
          </span>
        </div>
        <div>
          {stage !== "idle" && stage !== "connecting" && stage !== "scanning" && stage !== "analyzing" && stage !== "completed" && (
            <span className="flex items-center gap-2 text-xs font-mono text-violet-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Scanning
            </span>
          )}
          {stage === "completed" && (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Deterministic Scan Successful
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-4 sm:p-6 md:p-8 relative min-h-[440px] sm:min-h-[480px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STAGE 1: IDLE / FORM SUBMISSION */}
          {stage === "idle" && (
            <motion.div
              key="form-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="purple" className="px-3 py-1 font-mono text-xs">
                    Production Audit Engine
                  </Badge>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Audit your AI stack in real-time
                  </h3>
                </div>

                {/* Segmented Mode Selector */}
                <div className="relative flex p-1 bg-neutral-950/80 border border-neutral-900 rounded-lg max-w-[280px] w-full self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setMode("quick")}
                    className={`relative z-10 flex-1 py-1.5 px-4 rounded-md text-xs font-mono transition-all duration-300 ${
                      mode === "quick" ? "text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {mode === "quick" && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-neutral-800/80 border border-neutral-700/30 rounded-md -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    Quick Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("detailed")}
                    className={`relative z-10 flex-1 py-1.5 px-4 rounded-md text-xs font-mono transition-all duration-300 ${
                      mode === "detailed" ? "text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {mode === "detailed" && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-neutral-800/80 border border-neutral-700/30 rounded-md -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    Detailed Ledger
                  </button>
                </div>
              </div>

              <p className="text-sm text-neutral-400 max-w-xl">
                {mode === "quick"
                  ? "Connect simulated developer profiles to find underutilized seats, overlapping SaaS packages, suboptimal tiers, and API inefficiencies using our mathematical engine."
                  : "Declare your exact subscription seat logs, dynamic license counts, use cases, and token usage to build a custom verified budget efficiency score."}
              </p>

              <AnimatePresence mode="wait">
                {mode === "quick" ? (
                  <motion.form
                    key="quick-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 font-sans pl-1">
                        Company Name
                      </label>
                      <Input
                        placeholder="e.g. Vercel Inc"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 font-sans pl-1">
                        Estimated SaaS/API Spend ($/mo)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        value={spend}
                        onChange={(e) => setSpend(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 font-sans pl-1">
                        Work Email
                      </label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {localError && (
                      <div className="col-span-1 md:col-span-3 text-sm text-red-400 pl-1 font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {localError}
                      </div>
                    )}

                    <div className="col-span-1 md:col-span-3 pt-3 flex justify-end">
                      <Button type="submit" variant="default" size="lg" className="w-full md:w-auto gap-2 group">
                        Execute Deterministic Audit
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="detailed-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DetailedSpendForm onComplete={(profile) => startDetailedAudit(profile)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STAGE 2: LOADING / SIMULATING */}
          {(stage === "connecting" || stage === "scanning" || stage === "analyzing") && (
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-8 py-10"
            >
              {/* Spinning Hexagonal Grid Logo Indicator */}
              <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-violet-500/20 border-t-violet-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-emerald-500/10 border-b-emerald-400 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
                <Terminal className="w-7 h-7 text-neutral-300 animate-pulse" />
              </div>

              <div className="text-center space-y-3 max-w-md">
                <h4 className="text-sm font-mono tracking-wider uppercase text-violet-400 font-bold">
                  {stage}
                </h4>
                <p className="text-base text-neutral-200 h-12 flex items-center justify-center">
                  {activeStageText}
                </p>
              </div>

              <div className="w-full max-w-md space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-neutral-500">
                  <span>Auditor Progress</span>
                  <span>{internalProgress}%</span>
                </div>
                <Progress value={internalProgress} />
              </div>
            </motion.div>
          )}

          {/* STAGE 3: COMPLETE / SAVINGS METRICS */}
          {stage === "completed" && auditResult && (
            <motion.div
              key="complete-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Savings Showcase Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 border border-neutral-900 rounded-xl bg-neutral-950/80 relative">
                <div className="absolute inset-0 bg-radial-gradient(ellipse at center, rgba(16,185,129,0.05), transparent 70%) pointer-events-none" />
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
                      Audit Ledger Completed
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-white tracking-tight">
                    Estimated Savings found:{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-black">
                      ${(auditResult.totalEstimatedSavings * 12).toLocaleString()}/yr
                    </span>
                  </h4>
                  <p className="text-xs text-neutral-400 leading-normal">
                    Verified through exact pricing rules. Your current spend profile evaluates to an overall efficiency score of <strong>{auditResult.efficiencyScore}%</strong>.
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center md:items-end justify-center p-4 border-t md:border-t-0 md:border-l border-neutral-900/60">
                  <span className="text-xs text-neutral-500 font-medium">Efficiency Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-white">
                      {auditResult.efficiencyScore}
                    </span>
                    <span className="text-sm font-semibold text-neutral-500">/ 100</span>
                  </div>
                  <Badge variant="purple" className="mt-2 text-[10px] font-mono">
                    ${auditResult.totalEstimatedSavings.toLocaleString()}/mo waste
                  </Badge>
                </div>
              </div>

              {/* Anomaly list */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1">
                  Active Financial Recommendations ({auditResult.recommendations.length})
                </h5>
                <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {auditResult.recommendations.map((rec) => {
                    return (
                      <div
                        key={rec.id}
                        className="flex flex-col p-4 sm:p-5 border border-neutral-900 rounded-lg bg-neutral-950/40 hover:border-neutral-800 transition-all duration-300 group space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0 group-hover:border-neutral-700 transition-colors">
                              {getCategoryIcon(rec.category)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {rec.title}
                                </span>
                                {getCategoryBadge(rec.category)}
                              </div>
                              <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0 pl-1 sm:pl-0">
                            <span className="text-sm font-bold text-emerald-400 block font-mono">
                              -${Math.round(rec.estimatedSavings * 12).toLocaleString()}/yr
                            </span>
                            <span className="text-[10px] text-neutral-500 block font-mono">
                              -${rec.estimatedSavings}/mo
                            </span>
                          </div>
                        </div>

                        {/* Recommendation Sub-Panel */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-neutral-900/60 text-xs font-sans">
                          <div>
                            <span className="text-neutral-500 block">Suggested Action</span>
                            <span className="font-semibold text-neutral-200 mt-0.5 block">
                              {rec.suggestedAction}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Reasoning</span>
                            <span className="text-neutral-300 mt-0.5 block italic text-[11px] leading-relaxed">
                              &ldquo;{rec.reasoning}&rdquo;
                            </span>
                          </div>
                          <div className="sm:col-span-2 md:col-span-1">
                            <div className="flex items-center justify-between text-neutral-500">
                              <span>Confidence Score</span>
                              <span className="font-mono text-neutral-300 font-bold">{rec.confidenceScore}%</span>
                            </div>
                            <Progress value={rec.confidenceScore} className="h-1.5 mt-1.5" indicatorClassName="bg-violet-500" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-between items-center">
                <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 font-mono text-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Audit Sandbox
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none justify-center">
                    Export Audit Ledger
                  </Button>
                  <Button variant="glow" className="flex-1 sm:flex-none justify-center gap-2 group">
                    Automate Savings Now
                    <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
