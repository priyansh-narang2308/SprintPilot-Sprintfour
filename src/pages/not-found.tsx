import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Cpu, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Illustration + Brand */}
        <div className="flex flex-col gap-6 items-start">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.85, rotate: -10 }}
              animate={{ scale: [1, 1.03, 1], rotate: [0, 6, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600"
            >
              <Rocket className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold leading-tight">SprintPilot</h1>
              <p className="text-sm text-slate-300">AI Startup Blueprint Generator</p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold">404 — Blueprint Not Found</h2>
            <p className="mt-3 text-slate-300 max-w-prose">
              Looks like the runway cleared... but the startup blueprint you were looking for didn't make lift-off.
              Maybe the route changed, or we haven't generated it yet.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg text-white font-medium">
                <Rocket className="w-4 h-4" />
                Back to Dashboard
              </Link>

              <Link to="/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-100 hover:bg-slate-800">
                <Cpu className="w-4 h-4" />
                Create New Blueprint
              </Link>

              <Link to="/search" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/40 hover:bg-slate-700 text-slate-100">
                <Search className="w-4 h-4" />
                Search Blueprints
              </Link>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Tip: Try searching for keywords like <span className="text-slate-200 font-medium">MVP, growth, monetization</span> or create a new AI blueprint in seconds.
          </div>
        </div>

        {/* Right: Card-style "AI Console" mock */}
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
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" /> Live
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-lg p-3 bg-slate-800/40 border border-slate-700">
              <p className="text-sm text-slate-300 font-medium">Suggested quick actions</p>
              <ul className="mt-2 space-y-2 text-slate-400 text-sm">
                <li>• Generate a one-page investor pitch</li>
                <li>• Create a 30-day go-to-market plan</li>
                <li>• Prototype an MVP feature list</li>
              </ul>
            </div>

            <div className="rounded-lg p-3 bg-slate-800/30 border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Last generated</p>
                <p className="text-sm text-slate-200 font-medium">No recent blueprints</p>
              </div>

              <Link to="/create" className="text-xs font-semibold px-3 py-2 rounded-md border border-slate-600">
                Generate now
              </Link>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">If you think this is an error, feel free to reach out at <span className="text-slate-200">support@sprintpilot.ai</span></div>
        </motion.div>
      </div>

      {/* Decorative absolute planets / stars */}
      <svg className="pointer-events-none absolute inset-0 -z-10" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
      </svg>
    </div>
  )
}
