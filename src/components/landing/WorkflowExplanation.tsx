"use client";

import * as React from "react";
import { ListTodo, ShieldAlert, Cpu } from "lucide-react";

export default function WorkflowExplanation() {
  const steps = [
    {
      icon: <ListTodo className="w-5 h-5 text-violet-400" />,
      title: "1. Log Your AI Stack",
      description: "List the AI platforms, developer API logs, and seat quantities currently provisioned by your team.",
    },
    {
      icon: <Cpu className="w-5 h-5 text-violet-400" />,
      title: "2. Evaluate Math Rules",
      description: "Our engine checks 6 rule sets to identify underutilized seats, suboptimal pricing tiers, and tool redundancies.",
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-violet-400" />,
      title: "3. Capture Active Savings",
      description: "Review a complete per-tool matrix, copy your viral share report, or coordinate a Credex consultation.",
    },
  ];

  return (
    <section className="py-12 border-t border-neutral-900 bg-neutral-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs uppercase font-mono text-neutral-500 font-bold tracking-widest">
            Diagnostic Workflow
          </h2>
          <p className="text-xl font-bold text-white tracking-tight">
            How the Credex AI Spend Audit operates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className="p-5 border border-neutral-900 bg-neutral-950/40 rounded-xl space-y-3"
            >
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">{s.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
