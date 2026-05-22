"use client";

import * as React from "react";
import { Activity } from "lucide-react";

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950/60 backdrop-blur-md pt-16 pb-12 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-neutral-900 pb-12 mb-8">
        
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <a href="#" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800">
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            <span className="font-sans font-bold tracking-tight text-white">
              Credex<span className="text-violet-400 font-medium">.ai</span>
            </span>
          </a>
          <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
            Automating high-efficiency spend control for digital teams and AI startups. Reclaim your wasted operational resources.
          </p>
          <div className="flex items-center gap-4 text-neutral-500 pt-2">
            <a href="#" className="hover:text-white transition-colors duration-300">
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            {["SaaS Overlap Scanner", "API Token Inspector", "Orphaned DB Cleaner", "Negotiator Agent"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Resources
          </h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            {["Benchmark Database", "Security Protocols", "Documentation", "API References"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Company
          </h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            {["About Us", "Client Reviews", "Security Hub", "Contact Procurement"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Footer Bottom Lock */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-neutral-500 text-center md:text-left">
        <div>
          <span>© {new Date().getFullYear()} Credex Technologies Inc. All rights reserved.</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Terms of Service
            </a>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
