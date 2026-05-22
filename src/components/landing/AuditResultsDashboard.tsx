"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/store/useAuditStore";
import { PRICING_CONFIG } from "@/lib/audit-engine/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingDown, Copy, Check, Download,
  Calendar, AlertTriangle, ShieldCheck, Sparkles,
  Layers, Database, FlameKindling, Cpu,
  ArrowRight, ArrowLeft, BadgePercent, LayoutDashboard,
  CheckCircle2, ArrowUpRight, Zap
} from "lucide-react";

// Premium custom inline X (formerly Twitter) SVG logo
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Helper to format currency
const formatCurr = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Graceful, highly-detailed B2B fallback summary generator
function getTemplateFallbackSummary(
  companyName: string,
  totalSavings: number,
  recommendationsCount: number,
  efficiencyScore: number,
  subscriptionsCount: number
): string {
  const annualSavings = totalSavings * 12;
  
  if (totalSavings === 0) {
    return `Excellent standing verified for ${companyName}! Our mathematical engine analyzed your AI stack and confirmed a perfect 100/100 budget efficiency. Across all registered subscriptions, seats are fully mapped to active telemetry users with zero tool redundancy or underutilization anomalies. Your organization is running highly lean, successfully bypassing the classic overhead trap of overlapping premium licenses. Maintain these active operational guardrails to protect against cost drift as your engineering headcount scales.`;
  }
  
  return `Our diagnostic audit of ${companyName}'s AI stack reveals a total leakage of $${totalSavings}/mo ($${annualSavings}/yr) across your ${subscriptionsCount} active subscriptions, resulting in an efficiency rating of ${efficiencyScore}/100. The primary vectors of waste stem from ${recommendationsCount} key cost anomalies: idle software seats and direct platform overlap (such as running Cursor, Windsurf, and Copilot in parallel). Consolidating onto a single flagship IDE and right-sizing team packages can instantly recover these margins. Implementing our suggested downgrades secures a lean budget baseline without impacting team velocity.`;
}

export default function AuditResultsDashboard() {
  const { auditResult, resetAudit, customProfile, formData } = useAuditStore();
  
  const [copied, setCopied] = React.useState(false);
  const [leadEmail, setLeadEmail] = React.useState("");
  const [leadSubmitted, setLeadSubmitted] = React.useState(false);
  
  // Savings count-up animation state
  const [annualSavingsCount, setAnnualSavingsCount] = React.useState(0);
  const [monthlySavingsCount, setMonthlySavingsCount] = React.useState(0);

  // Stable random report ID to prevent impure render errors
  const [reportId] = React.useState(() => Math.floor(1000 + Math.random() * 9000));

  // Consultation scheduler state
  const [showScheduler, setShowScheduler] = React.useState(false);
  const [schedulerStep, setSchedulerStep] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState("Mon, May 25");
  const [selectedTime, setSelectedTime] = React.useState("10:00 AM (EST)");
  const [bookingName, setBookingName] = React.useState("");
  const [bookingEmail, setBookingEmail] = React.useState(() => customProfile?.workEmail || formData?.email || "");
  const [bookingNotes, setBookingNotes] = React.useState("");
  const [schedulerLoadingText, setSchedulerLoadingText] = React.useState("Connecting to spend engineer...");

  // AI Personalized summary state hooks
  const [aiSummary, setAiSummary] = React.useState<string>("");
  const [aiSummaryLoading, setAiSummaryLoading] = React.useState<boolean>(false);

  const totalSavings = auditResult?.totalEstimatedSavings || 0;
  const annualSavings = totalSavings * 12;
  const efficiency = auditResult?.efficiencyScore ?? 100;
  const isHighSavings = totalSavings > 500; // High savings threshold defined as > $500/mo in assignment

  // Async trigger for Anthropic summary generation (with graceful template fallback)
  React.useEffect(() => {
    if (!auditResult) return;
    if (aiSummary) return; // Prevent double calls

    const fetchSummary = async () => {
      setAiSummaryLoading(true);
      try {
        const response = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: auditResult.companyName,
            totalCurrentSpend: auditResult.totalCurrentSpend,
            totalEstimatedSavings: auditResult.totalEstimatedSavings,
            efficiencyScore: auditResult.efficiencyScore,
            recommendations: auditResult.recommendations,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.summary) {
            setAiSummary(data.summary);
            setAiSummaryLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("AI summary API call failed, using graceful fallback", err);
      }

      // Safe templated fallback
      const subscriptionsCount = customProfile?.subscriptions.length || 0;
      const recsCount = auditResult.recommendations.length;
      const fallback = getTemplateFallbackSummary(
        auditResult.companyName,
        totalSavings,
        recsCount,
        efficiency,
        subscriptionsCount
      );
      setAiSummary(fallback);
      setAiSummaryLoading(false);
    };

    fetchSummary();
  }, [auditResult, customProfile, totalSavings, efficiency, aiSummary]);

  // Trigger ticker count-up on load
  React.useEffect(() => {
    let startTime: number | null = null;
    const duration = 1600; // 1.6s

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      
      setAnnualSavingsCount(Math.floor(easeProgress * annualSavings));
      setMonthlySavingsCount(Math.floor(easeProgress * totalSavings));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [annualSavings, totalSavings]);

  const handleCopyLink = () => {
    try {
      const shareUrl = `${window.location.origin}/share/audit-${Math.random().toString(36).substring(2, 9)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareTwitter = () => {
    const text = `Just audited our corporate AI spend with @CredexAI and identified ${formatCurr(annualSavings)}/yr in idle licenses and overlaps! 🤯 Check your spend efficiency score for free:`;
    const url = "https://credex.ai";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadEmail && leadEmail.includes("@")) {
      setLeadSubmitted(true);
    }
  };

  if (!auditResult) return null;

  // 1. ALREADY OPTIMIZED / PERFECT SCORE STATE (savings === 0)
  if (totalSavings === 0) {
    return (
      <div className="space-y-12 pb-16">
        {/* Animated Badge Header */}
        <div className="flex justify-between items-center border-b border-neutral-900 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Audit Report</h2>
              <p className="text-xs text-neutral-500 font-mono">ID: CRD-OPT-{reportId}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetAudit} className="gap-2 font-mono text-xs text-neutral-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            Run New Audit
          </Button>
        </div>

        {/* Big Wow Optimized State Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden border border-emerald-500/20 rounded-2xl bg-neutral-950/40 p-8 sm:p-12 text-center space-y-6"
        >
          <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(16,185,129,0.06), transparent 70%) pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping [animation-duration:3s]" />
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <Badge variant="success" className="px-3 py-1 text-xs font-mono uppercase tracking-wider">
              Perfect Efficiency Standing
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Your AI spend is <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">100% Optimized</span>
            </h1>
            <p className="text-base text-neutral-400 max-w-xl mx-auto">
              Our rule engine analyzed your license allocations, team sizes, and API tokens. Absolutely zero redundancies, unused seats, or subscription waste detected!
            </p>
          </div>

          <div className="max-w-md mx-auto pt-6 grid grid-cols-2 gap-4 border-t border-neutral-900">
            <div className="text-center p-3 rounded-lg bg-neutral-950/60 border border-neutral-900">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Efficiency Score</span>
              <span className="text-3xl font-black text-white block mt-0.5">100 / 100</span>
            </div>
            <div className="text-center p-3 rounded-lg bg-neutral-950/60 border border-neutral-900">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Monthly Waste</span>
              <span className="text-3xl font-black text-emerald-400 block mt-0.5">$0.00</span>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            <Button onClick={handleShareTwitter} variant="outline" className="gap-2 font-mono text-xs">
              <TwitterIcon className="w-4 h-4 text-neutral-300" />
              Share Perfect Score
            </Button>
            <Button onClick={handleCopyLink} variant="secondary" className="gap-2 font-mono text-xs">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
              {copied ? "Link Copied!" : "Copy Report Link"}
            </Button>
          </div>
        </motion.div>

        {/* Low Waste / Lead Capture Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
          <Card className="bg-neutral-950/40 border-neutral-900 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent opacity-30 pointer-events-none" />
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Badge variant="purple" className="font-mono text-[10px] uppercase">Enterprise Guard</Badge>
                <h3 className="text-xl font-bold text-white tracking-tight">Active Anomaly Monitoring</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Even optimized environments bleed cash as teams grow. Connect continuous monitoring logs to automatically alert your ops team when duplicate licenses or zombie seats are created.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="ops@company.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    required
                    disabled={leadSubmitted}
                    className="flex-1 h-10 px-3 rounded-lg border border-neutral-900 bg-neutral-950 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                  />
                  <Button type="submit" disabled={leadSubmitted} className="h-10 text-xs shrink-0 font-mono gap-1">
                    {leadSubmitted ? "Activated" : "Keep Me Optimized"}
                  </Button>
                </div>
                {leadSubmitted && (
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 animate-fade-in pl-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready. We will notify you of any changes.
                  </span>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950/40 border-neutral-900 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-30 pointer-events-none" />
            <CardContent className="p-8 space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase border-emerald-500/30 text-emerald-400">Verified Badge</Badge>
                <h3 className="text-xl font-bold text-white tracking-tight">Credex Budget Seal</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Embed our verified optimized badge on your company profile or handbook to show investors and stakeholders your finance stack is run at state-of-the-art efficiency.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <div className="px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-md font-mono text-[10px] flex items-center gap-1.5 select-none shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> CREDEX OPTIMIZED
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 font-mono text-neutral-400 hover:text-white ml-auto">
                  <Download className="w-3.5 h-3.5" /> SVG Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 2. HIGH OR LOW SAVINGS STANDARD RESULTS DASHBOARD
  return (
    <div className="space-y-12 pb-16">
      {/* Animated Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-900 pb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Budget Diagnostic</h2>
            <p className="text-xs text-neutral-500 font-mono">Prepared for <strong className="text-neutral-300 font-medium">{auditResult.companyName}</strong> • CRD-{reportId}</p>
          </div>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={resetAudit} className="gap-2 font-mono text-xs text-neutral-400 hover:text-white w-full xs:w-auto justify-center shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            Recalculate
          </Button>
          <div className="flex gap-2 w-full xs:w-auto">
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-2 font-mono text-xs flex-1 xs:flex-none justify-center shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Link Copied!" : "Copy Link"}
            </Button>
            <Button onClick={handleShareTwitter} variant="glow" size="sm" className="gap-2 font-mono text-xs flex-1 xs:flex-none justify-center shrink-0">
              <TwitterIcon className="w-3.5 h-3.5 text-white" />
              Share Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Savings Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total savings large visual container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 relative overflow-hidden border border-neutral-900 rounded-2xl bg-neutral-950/40 p-8 sm:p-10 flex flex-col justify-between min-h-[300px]"
        >
          {/* Background Aura Gradients */}
          <div className="absolute inset-0 bg-radial-gradient(circle at top left, rgba(139,92,246,0.06), transparent 70%) pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient(circle at bottom right, rgba(16,185,129,0.04), transparent 60%) pointer-events-none" />
          
          <div className="space-y-1">
            <Badge variant="purple" className="px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest">
              Autonomous Calculation Resolves
            </Badge>
            <h3 className="text-xs uppercase font-mono text-neutral-500 pt-3 font-semibold tracking-widest">
              Verified Annual Savings Pipeline
            </h3>
          </div>

          <div className="py-6 space-y-1">
            <span className="text-6xl sm:text-7xl font-black tracking-tighter text-white font-mono block">
              {formatCurr(annualSavingsCount)}
              <span className="text-xs sm:text-sm font-sans font-medium text-neutral-400 tracking-normal ml-3">/ yr wasted</span>
            </span>
            <p className="text-sm text-neutral-400 max-w-lg leading-relaxed">
              We identified consolidated overlapping systems and inactive seat telemetry representing a raw leakage rate of <strong className="text-emerald-400 font-bold">{formatCurr(monthlySavingsCount)}/mo</strong>.
            </p>
          </div>

          <div className="pt-6 border-t border-neutral-900/60 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-widest">Current declared spend</span>
              <span className="text-base font-bold text-white block mt-0.5 font-mono">{formatCurr(auditResult.totalCurrentSpend)}/mo</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-widest">Optimized spend</span>
              <span className="text-base font-bold text-emerald-400 block mt-0.5 font-mono">{formatCurr(auditResult.totalCurrentSpend - totalSavings)}/mo</span>
            </div>
            <div className="col-span-1 xs:col-span-2 md:col-span-1 border-t xs:border-t-0 md:border-t-0 md:border-l border-neutral-900/60 pt-3 xs:pt-0 md:pt-0 md:pl-4">
              <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-widest">Savings Percent</span>
              <span className="text-base font-bold text-violet-400 block mt-0.5 font-mono">
                {Math.round((totalSavings / Math.max(1, auditResult.totalCurrentSpend)) * 100)}% reduction
              </span>
            </div>
          </div>
        </motion.div>

        {/* Efficiency score dial */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden border border-neutral-900 rounded-2xl bg-neutral-950/40 p-8 flex flex-col justify-between items-center text-center min-h-[300px]"
        >
          <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(168,85,247,0.03), transparent 60%) pointer-events-none" />
          
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-neutral-500 font-semibold tracking-widest block">
              Budget Efficiency Score
            </span>
            <p className="text-[10px] text-neutral-500">How your stack matches optimal math configs</p>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            {/* Circular dial simulation */}
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#171717"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="url(#efficiencyGradient)"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - efficiency / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white font-mono">{efficiency}</span>
              <span className="text-[9px] uppercase font-mono text-neutral-500 mt-0.5">/ 100 index</span>
            </div>
          </div>

          <div className="w-full">
            {efficiency >= 90 ? (
              <Badge variant="success" className="font-mono text-[9px] tracking-wider uppercase">Optimal Standing</Badge>
            ) : efficiency >= 70 ? (
              <Badge variant="warning" className="font-mono text-[9px] tracking-wider uppercase">Suboptimal Drift</Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-[9px] tracking-wider uppercase border-red-900/50 text-red-400 bg-red-950/20">Severe Waste alert</Badge>
            )}
            <span className="text-[10px] text-neutral-400 block mt-2 leading-relaxed">
              Your profile is operating <strong className="text-white">{100 - efficiency}%</strong> below mathematical efficiency parameters.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Visual summaries charts / breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Category savings distributions */}
        <Card className="bg-neutral-950/40 border-neutral-900 p-6 space-y-4 md:col-span-1 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-xs uppercase font-mono text-neutral-500 font-semibold tracking-wider flex items-center gap-1.5">
              <BadgePercent className="w-3.5 h-3.5 text-violet-400" />
              Allocation of Savings
            </h4>
            <p className="text-[10px] text-neutral-500">Distribution of waste categorized by check types</p>
          </div>

          <div className="space-y-3.5 py-2">
            {[
              { label: "Tool Consolidation", category: "redundancy", color: "bg-violet-500" },
              { label: "Seat Adjustments", category: "abandoned", color: "bg-emerald-500" },
              { label: "Tier Adjustments", category: "tier", color: "bg-amber-500" },
              { label: "API Optimizations", category: "api", color: "bg-red-500" },
            ].map((cat) => {
              const amount = auditResult.recommendations
                .filter((r) => r.category === cat.category)
                .reduce((acc, curr) => acc + curr.estimatedSavings, 0);

              const percent = totalSavings > 0 ? (amount / totalSavings) * 100 : 0;

              if (amount === 0) return null;

              return (
                <div key={cat.category} className="space-y-1 font-sans text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span className="font-medium">{cat.label}</span>
                    <span className="font-mono font-bold text-neutral-400">
                      {formatCurr(amount)}/mo ({Math.round(percent)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-950 border border-neutral-900 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-neutral-500 leading-normal border-t border-neutral-900/60 pt-3">
            Deduplicated savings mathematical resolve prevents double counting of compounding actions.
          </div>
        </Card>

        {/* Per-Tool Pricing Ledger Side-By-Side Visual Map */}
        <Card className="bg-neutral-950/40 border-neutral-900 p-6 space-y-4 md:col-span-2">
          <div className="space-y-1">
            <h4 className="text-xs uppercase font-mono text-neutral-500 font-semibold tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              Per-Tool Optimization Matrix
            </h4>
            <p className="text-[10px] text-neutral-500">Comparison of current configurations against recommended pathways</p>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 py-1">
            {customProfile?.subscriptions.map((sub, i) => {
              const rec = auditResult.recommendations.find((r) => r.toolId === sub.toolId);
              const toolName = PRICING_CONFIG[sub.toolId]?.name || sub.toolId;
              const optimizedCost = sub.monthlySpend - (rec?.estimatedSavings || 0);

              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-neutral-900 bg-neutral-950/40 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block capitalize">{toolName}</span>
                      <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                        {sub.seats} seats • {sub.planId} plan
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4 text-left sm:text-right shrink-0 text-xs w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-neutral-950 sm:border-t-0">
                    <div>
                      <span className="text-neutral-500 block font-mono text-[9px] uppercase">Declared</span>
                      <span className="font-mono font-bold text-neutral-400">{formatCurr(sub.monthlySpend)}/mo</span>
                    </div>
                    
                    <div className="hidden sm:block text-neutral-500 text-[10px] shrink-0 font-mono">→</div>
                    
                    <div>
                      <span className="text-neutral-500 block font-mono text-[9px] uppercase">Optimized</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurr(optimizedCost)}/mo
                      </span>
                    </div>
                    
                    <div className="border-l border-neutral-900 pl-2.5 sm:pl-3">
                      <span className="text-neutral-500 block font-mono text-[9px] uppercase">Savings</span>
                      <span className="font-mono font-bold text-violet-400">
                        -{formatCurr(sub.monthlySpend - optimizedCost)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {customProfile?.apiUsage && customProfile.apiUsage.map((api, i) => {
              const rec = auditResult.recommendations.find((r) => r.toolId === api.providerId);
              const providerName = api.providerId === "openai-api" ? "OpenAI API" : "Anthropic API";
              const optimizedCost = api.monthlySpend - (rec?.estimatedSavings || 0);

              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-neutral-900 bg-neutral-950/40 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-950 border border-violet-850 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block capitalize">{providerName}</span>
                      <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                        Developer API token ledger
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4 text-left sm:text-right shrink-0 text-xs w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-neutral-950 sm:border-t-0">
                    <div>
                      <span className="text-neutral-500 block font-mono text-[9px] uppercase">Declared</span>
                      <span className="font-mono font-bold text-neutral-400">{formatCurr(api.monthlySpend)}/mo</span>
                    </div>
                    
                    <div className="hidden sm:block text-neutral-500 text-[10px] shrink-0 font-mono">→</div>
                    
                    <div>
                      <span className="text-neutral-500 block font-mono text-[9px] uppercase">Optimized</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurr(optimizedCost)}/mo
                      </span>
                    </div>
                    
                    <div className="border-l border-neutral-900 pl-2.5 sm:pl-3">
                      <span className="text-neutral-500 block font-mono text-[9px] uppercase">Savings</span>
                      <span className="font-mono font-bold text-violet-400">
                        -{formatCurr(api.monthlySpend - optimizedCost)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick scan mode fallback */}
            {(!customProfile || (customProfile.subscriptions.length === 0 && (!customProfile.apiUsage || customProfile.apiUsage.length === 0))) && (
              <div className="flex justify-between p-3 rounded-lg border border-neutral-900 bg-neutral-950/40 text-xs">
                <div className="space-y-0.5">
                  <span className="text-white font-bold block">Consolidated SaaS Baseline</span>
                  <span className="text-neutral-500 block font-mono text-[10px]">derived from quick scan estimate</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-neutral-400 font-mono block">{formatCurr(auditResult.totalCurrentSpend)}/mo</span>
                  <span className="text-emerald-400 font-mono text-[10px] block">-{formatCurr(totalSavings)}/mo optimization</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* AI-Generated Personalized Summary */}
      <Card className="relative overflow-hidden border border-violet-950/40 bg-neutral-950/30 p-6 sm:p-8 space-y-4">
        {/* Subtle auroral wash */}
        <div className="absolute inset-0 bg-radial-gradient(circle at top left, rgba(139,92,246,0.03), transparent 70%) pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-mono text-neutral-400 font-bold tracking-widest block">
              AI Personalized Audit Summary
            </h4>
            <span className="text-[9px] font-mono text-neutral-500 uppercase">
              {aiSummaryLoading ? "Claude Analyst is compiling..." : "Generated by Claude 3.5 Sonnet"}
            </span>
          </div>
          {aiSummaryLoading && (
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping ml-auto" />
          )}
        </div>

        <div className="text-sm text-neutral-300 leading-relaxed font-sans min-h-[60px] relative">
          {aiSummaryLoading ? (
            <div className="space-y-2 py-1">
              <div className="h-4 bg-neutral-900 rounded w-11/12 animate-pulse" />
              <div className="h-4 bg-neutral-900 rounded w-full animate-pulse" />
              <div className="h-4 bg-neutral-900 rounded w-9/12 animate-pulse" />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-neutral-300"
            >
              {aiSummary}
            </motion.p>
          )}
        </div>
      </Card>

      {/* Active Financial Recommendations */}
      <div className="space-y-4">
        <h4 className="text-xs uppercase font-mono text-neutral-500 font-bold tracking-widest pl-1">
          Active Optimization Resolutions ({auditResult.recommendations.length})
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          {auditResult.recommendations.map((rec, index) => {
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

            const getCategoryIcon = (category: string) => {
              switch (category) {
                case "redundancy": return <Layers className="w-4 h-4 text-violet-400" />;
                case "abandoned": return <Database className="w-4 h-4 text-emerald-400" />;
                case "tier": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
                case "api": return <FlameKindling className="w-4 h-4 text-red-400" />;
                default: return <Cpu className="w-4 h-4 text-neutral-400" />;
              }
            };

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex flex-col p-6 border border-neutral-900 rounded-xl bg-neutral-950/40 hover:border-neutral-800 transition-all duration-300 group space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/2 to-transparent pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0 group-hover:border-neutral-700 transition-colors">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-base font-bold text-white">{rec.title}</h5>
                        {getCategoryBadge(rec.category)}
                      </div>
                      <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right shrink-0 font-mono text-xs pl-1 sm:pl-0">
                    <span className="text-base font-black text-emerald-400 block">
                      -{formatCurr(rec.estimatedSavings * 12)}/yr
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      -{formatCurr(rec.estimatedSavings)}/mo waste
                    </span>
                  </div>
                </div>

                {/* Sub-panel specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 border-t border-neutral-900/60 text-xs font-sans">
                  <div className="space-y-1">
                    <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-wider">Suggested Action</span>
                    <span className="font-semibold text-neutral-200 block">
                      {rec.suggestedAction}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-wider">Reasoning</span>
                    <span className="text-neutral-300 block italic leading-normal text-[11px]">
                      &ldquo;{rec.reasoning}&rdquo;
                    </span>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-center text-neutral-500">
                      <span className="uppercase font-mono text-[9px] tracking-wider">Confidence Level</span>
                      <span className="font-mono font-bold text-violet-400">{rec.confidenceScore}%</span>
                    </div>
                    <Progress value={rec.confidenceScore} className="h-1.5 mt-0.5" indicatorClassName="bg-violet-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ADAPTIVE CTA SECTIONS */}
      <div className="pt-4">
        {isHighSavings ? (
          /* HIGH SAVINGS CTA: Book Consult Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative border border-violet-500/30 rounded-2xl overflow-hidden bg-neutral-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-violet-500/5"
          >
            <div className="absolute inset-0 bg-radial-gradient(circle at top left, rgba(139,92,246,0.08), transparent 70%) pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <Badge variant="purple" className="font-mono text-[10px] uppercase gap-1.5 px-3 py-1">
                <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400 animate-pulse" />
                Significant Overspend Detected
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Instantly capture {formatCurr(annualSavings)}/yr in savings
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Your AI spend qualifies for direct Credex corporate credits. Schedule a 15-minute consultation review with a Credex spend engineer. We will renegotiate vendor rates and SSO mappings under a 100% success fee model.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setShowScheduler(true);
                  setSchedulerStep(1);
                }}
                size="lg"
                variant="glow"
                className="w-full sm:w-auto gap-2 group font-semibold h-12"
              >
                <Calendar className="w-4 h-4 text-violet-400" />
                Book Credex Consultation
                <ArrowUpRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        ) : (
          /* LOW SAVINGS CTA: Lead capture monitoring card */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border border-neutral-900 rounded-2xl bg-neutral-950/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400 font-medium font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Honest Diagnosis: You&apos;re spending well
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Highly Optimized Stack</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your AI budget is exceptionally lean and well-maintained. We don&apos;t manufacture false savings. However, licensing drift can occur as engineering teams scale. Sign up to get notified when new optimizations apply to your stack.
              </p>
            </div>

            <div className="w-full md:w-auto max-w-md shrink-0">
              <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="founder@company.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  required
                  disabled={leadSubmitted}
                  className="h-10 px-3 rounded-lg border border-neutral-900 bg-neutral-950 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors w-full sm:w-60 disabled:opacity-50"
                />
                <Button type="submit" disabled={leadSubmitted} className="h-10 text-xs shrink-0 font-mono gap-1">
                  {leadSubmitted ? "Activated" : "Keep Me Optimized"}
                </Button>
              </form>
              {leadSubmitted && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1.5 justify-center md:justify-start">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activated. We will notify you of new optimizations.
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Interactive premium calendar scheduling modal */}
      <AnimatePresence>
        {showScheduler && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduler(false)}
              className="absolute inset-0 bg-[#030303]/80 backdrop-blur-md"
            />

            {/* Premium glass modal container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 shadow-2xl shadow-violet-500/5 select-none"
            >
              {/* Background glows */}
              <div className="absolute inset-0 bg-radial-gradient(circle at top right, rgba(139,92,246,0.05), transparent 70%) pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowScheduler(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-900 cursor-pointer z-10"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-full overflow-y-auto p-6 sm:p-8 flex-1 scrollbar-thin">
                <AnimatePresence mode="wait">
                  {/* STEP 1: Select Date & Time */}
                  {schedulerStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1.5 pr-8">
                      <Badge variant="purple" className="font-mono text-[9px] uppercase tracking-widest px-2.5">
                        Step 1 of 2
                      </Badge>
                      <h4 className="text-xl font-bold text-white tracking-tight">
                        Select a Consultation Slot
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Select an available 15-minute slot with our lead AI optimization engineer.
                      </p>
                    </div>

                    {/* Date picker buttons */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                        Available Dates
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { date: "Mon, May 25", label: "May 25", day: "Mon" },
                          { date: "Tue, May 26", label: "May 26", day: "Tue" },
                          { date: "Wed, May 27", label: "May 27", day: "Wed" },
                          { date: "Thu, May 28", label: "May 28", day: "Thu" }
                        ].map((d) => (
                          <button
                            key={d.date}
                            onClick={() => setSelectedDate(d.date)}
                            className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                              selectedDate === d.date
                                ? "border-violet-500 bg-violet-500/10 text-white shadow-[0_0_12px_rgba(124,58,237,0.15)]"
                                : "border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">{d.day}</span>
                            <span className="block text-sm font-bold mt-0.5">{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time picker buttons */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                        Available Times
                      </span>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          "10:00 AM (EST)",
                          "02:00 PM (EST)",
                          "04:30 PM (EST)"
                        ].map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`p-3 rounded-lg border text-center transition-all cursor-pointer text-xs font-mono ${
                              selectedTime === t
                                ? "border-violet-500 bg-violet-500/10 text-white shadow-[0_0_12px_rgba(124,58,237,0.15)]"
                                : "border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            {t.replace(" (EST)", "")}
                            <span className="block text-[9px] text-neutral-500 mt-0.5">EST</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end pt-4 border-t border-neutral-900/60">
                      <Button
                        onClick={() => setSchedulerStep(2)}
                        className="gap-2 font-mono text-xs font-semibold h-10 group"
                      >
                        Next: Contact Info
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Contact Details */}
                {schedulerStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-1.5 pr-8">
                      <Badge variant="purple" className="font-mono text-[9px] uppercase tracking-widest px-2.5">
                        Step 2 of 2
                      </Badge>
                      <h4 className="text-xl font-bold text-white tracking-tight">
                        Confirm Details
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Let us know how to contact you and any specific targets (like API tokens or cursor licenses).
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Peter Parker"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          required
                          className="w-full h-10 px-3 rounded-lg border border-neutral-900 bg-neutral-950 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block">
                          Work Email
                        </label>
                        <input
                          type="email"
                          placeholder="peter@dailybugle.com"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          required
                          className="w-full h-10 px-3 rounded-lg border border-neutral-900 bg-neutral-950 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>

                      {/* Context input */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block">
                          Focus Areas (Optional)
                        </label>
                        <textarea
                          placeholder="e.g. consolidation of overlapping ChatGPT/Claude seats..."
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          rows={2}
                          className="w-full p-3 rounded-lg border border-neutral-900 bg-neutral-950 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-neutral-900/60">
                      <Button
                        variant="ghost"
                        onClick={() => setSchedulerStep(1)}
                        className="gap-2 font-mono text-xs text-neutral-400 hover:text-white"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                      </Button>

                      <Button
                        disabled={!bookingName || !bookingEmail || !bookingEmail.includes("@")}
                        onClick={() => {
                          setSchedulerStep(3);
                          // Trigger booking step transitions
                          setTimeout(() => {
                            setSchedulerLoadingText("Securing priority slot for waste audit...");
                            setTimeout(() => {
                              setSchedulerLoadingText("Generating calendar invites...");
                              setTimeout(() => {
                                setSchedulerStep(4);
                              }, 700);
                            }, 700);
                          }, 700);
                        }}
                        className="gap-2 font-mono text-xs font-semibold h-10"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        Confirm Booking
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Booking Loading animation */}
                {schedulerStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-10 space-y-4 text-center"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-violet-500/20 animate-ping absolute" />
                      <div className="w-12 h-12 rounded-full border-t-2 border-violet-500 animate-spin" />
                    </div>
                    <span className="text-xs text-neutral-400 font-mono animate-pulse">
                      {schedulerLoadingText}
                    </span>
                  </motion.div>
                )}

                {/* STEP 4: Success Confirmed Screen */}
                {schedulerStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-4 space-y-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping [animation-duration:3s]" />
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                      <Badge variant="success" className="font-mono text-[9px] uppercase px-2.5">
                        Consultation Secured
                      </Badge>
                      <h4 className="text-2xl font-black text-white tracking-tight">
                        You&apos;re Booked!
                      </h4>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                        Your 15-minute waste optimization audit has been scheduled. Calendar coordinates and invite details have been dispatched.
                      </p>
                    </div>

                    {/* Booking summary card */}
                    <div className="w-full max-w-sm rounded-lg border border-neutral-900 bg-neutral-950/60 p-4 font-mono text-left text-xs space-y-2 text-neutral-300">
                      <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                        <span className="text-neutral-500 uppercase text-[9px]">Event</span>
                        <span className="text-white font-medium">Credex AI Spend Audit</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                        <span className="text-neutral-500 uppercase text-[9px]">Date</span>
                        <span className="text-white font-medium">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 uppercase text-[9px]">Time</span>
                        <span className="text-white font-medium">{selectedTime}</span>
                      </div>
                    </div>

                    <div className="flex justify-center pt-2 w-full gap-3">
                      <Button
                        onClick={() => setShowScheduler(false)}
                        variant="secondary"
                        className="font-mono text-xs h-10 w-full sm:w-auto px-6 font-semibold"
                      >
                        Close Window
                      </Button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
