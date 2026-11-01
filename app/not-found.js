import Link from "next/link";
import { Compass, Home, Search, Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-400/10 border border-primary-400/30 text-primary-400 shadow-glow">
            <Trophy size={40} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            404 • Page Off Court
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Out of Bounds
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The pitch, match ticket, or resource you are looking for has been relocated or does not exist under the floodlights.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary-400 px-5 py-2.5 text-xs font-bold text-dark-950 hover:bg-primary-300 transition shadow-glow-sm"
          >
            <Home size={15} /> Back to Home
          </Link>
          <Link
            href="/facilities"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-dark-850 px-5 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-dark-800 transition"
          >
            <Compass size={15} /> Browse Courts
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-dark-850 px-5 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-dark-800 transition"
          >
            <Search size={15} /> Search All
          </Link>
        </div>
      </div>
    </div>
  );
}

