"use client";

import * as React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import WorkflowExplanation from "@/components/landing/WorkflowExplanation";
import Footer from "@/components/landing/Footer";
import { useAuditStore } from "@/store/useAuditStore";
import AuditResultsDashboard from "@/components/landing/AuditResultsDashboard";

export default function Home() {
  const { stage } = useAuditStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#030303] text-white selection:bg-violet-500/30 selection:text-white">
      {/* Dynamic Nav Header */}
      <Navbar />

      <main className="flex-1">
        {stage === "completed" ? (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24">
            <AuditResultsDashboard />
          </div>
        ) : (
          <>
            {/* Hero Section containing the live Audit Simulator */}
            <Hero />

            {/* Concise operational workflow steps */}
            <WorkflowExplanation />
          </>
        )}
      </main>

      {/* Structured Footer */}
      <Footer />
    </div>
  );
}
