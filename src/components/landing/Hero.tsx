"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AuditSimulator from "./AuditSimulator";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Premium Background Mesh Auras */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] aura-purple pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] aura-blue opacity-50 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] aura-emerald opacity-40 pointer-events-none" />

      {/* Floating Glowing Orbs for parallax feel */}
      <div className="absolute top-48 left-1/4 w-72 h-72 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-32 right-1/4 w-80 h-80 rounded-full bg-emerald-600/3 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-12 relative z-10 w-full">
        
        {/* Animated Badge Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-900 bg-neutral-950/80 backdrop-blur-md shadow-inner shadow-white/5"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span className="text-[10px] xs:text-[11px] font-medium tracking-wider uppercase text-neutral-300 font-mono">
            Credex Autonomous Audit Engine 2.0
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping animate-duration-1000" />
        </motion.div>

        {/* Hero Title Grid */}
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white leading-tight md:leading-[1.05]"
          >
            Reclaim <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-500">30% of your</span>
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-200 to-emerald-400 font-black">
              AI & Cloud Budget.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed px-2"
          >
            Credex automatically scans SaaS instances, tracks LLM tokens, and builds custom renegotiation paths. Zero setup, instant savings ledger.
          </motion.p>
        </div>

        {/* Interactive Spend Simulator Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full pt-2 sm:pt-4"
        >
          <AuditSimulator />
        </motion.div>

      </div>
    </section>
  );
}
