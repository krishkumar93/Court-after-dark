"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("Courts After Dark runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle size={36} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Technical Timeout
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unexpected Game Interruption
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Something unexpected stopped this page from loading. Your reservation progress is preserved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary-400 px-5 py-2.5 text-xs font-bold text-dark-950 hover:bg-primary-300 transition shadow-glow-sm"
          >
            <RefreshCw size={14} /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-dark-850 px-5 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-dark-800 transition"
          >
            <Home size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
