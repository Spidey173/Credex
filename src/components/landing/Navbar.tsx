"use client";

import * as React from "react";
import { Menu, X, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        scrolled
          ? "bg-[#030303]/75 backdrop-blur-md border-neutral-900 py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Logo Lockup */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 transition-all duration-300 group-hover:border-violet-500/50 shadow-sm shadow-violet-500/5">
            <Activity className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-lg bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]" />
          </div>
          <span className="font-sans font-bold tracking-tight text-white text-lg">
            Credex<span className="text-violet-400 font-medium">.ai</span>
          </span>
        </a>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "Features", "Security", "Pricing", "Enterprise"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button variant="glow" size="sm" className="gap-2 group">
            Book Demo
            <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-neutral-400 hover:text-white focus:outline-none min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-[56px] max-h-[calc(100vh-56px)] overflow-y-auto bg-[#030303]/98 backdrop-blur-xl border-b border-neutral-900 py-6 px-4 sm:px-6 transition-all duration-300 flex flex-col gap-6",
          isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-4">
          {["Platform", "Features", "Security", "Pricing", "Enterprise"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-neutral-300 hover:text-white py-2 border-b border-neutral-900/50"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-3 pb-4">
          <Button variant="secondary" className="w-full justify-center min-h-10">
            Sign In
          </Button>
          <Button variant="glow" className="w-full justify-center gap-2 min-h-10">
            Book Demo
            <ArrowRight className="w-4 h-4 text-violet-400" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
