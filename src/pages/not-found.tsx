import { Link } from "react-router-dom";

import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col gap-6 items-start">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight">
                SprintPilot
              </h1>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold">
              404 — Blueprint Not Found
            </h2>
            <p className="mt-3 text-slate-300 max-w-prose">
              Looks like the runway cleared... but the startup blueprint you
              were looking for didn't make lift-off. Maybe the route changed, or
              we haven't generated it yet.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg text-white font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Tip: Try searching for keywords like{" "}
            <span className="text-slate-200 font-medium">
              MVP, growth, monetization
            </span>{" "}
            or create a new AI blueprint in seconds.
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-gradient-to-b from-slate-800/60 to-slate-900/40 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">AI Console</p>
              <h3 className="font-semibold">SprintPilot Assistant</h3>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />{" "}
              Live
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-lg p-3 bg-slate-800/40 border border-slate-700">
              <p className="text-sm text-slate-300 font-medium">
                Suggested quick actions
              </p>
              <ul className="mt-2 space-y-2 text-slate-400 text-sm">
                <li>• Generate a one-page investor pitch</li>
                <li>• Prototype an MVP feature list</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <svg
        className="pointer-events-none absolute inset-0 -z-10"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
      </svg>
    </div>
  );
}
