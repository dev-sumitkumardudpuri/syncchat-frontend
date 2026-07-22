import React, { useState } from "react";
import {
  MessageSquare,
  Sun,
  Moon,
  LogIn,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar({ openLogin, theme = "dark", toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appName = import.meta.env.VITE_APP_NAME || "SyncChat";
  const isDark = theme === "dark";

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 backdrop-blur-xl border-b select-none ${
        isDark
          ? "bg-slate-950/80 border-slate-800/80 text-slate-100"
          : "bg-white/80 border-slate-200/80 text-slate-900 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`relative p-2.5 rounded-2xl transition-all duration-300 group-hover:scale-105 ${
                isDark
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                  : "bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm"
              }`}
            >
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight font-sans flex items-center gap-1">
                {appName.slice(0, 4)}
                <span
                  className={isDark ? "text-indigo-400" : "text-indigo-600"}
                >
                  {appName.slice(4)}
                </span>
              </span>
              <span
                className={`text-[10px] tracking-widest uppercase font-semibold ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Realtime Messaging
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                isDark
                  ? "bg-slate-900/60 border-slate-800 text-slate-400"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>v2.0 Socket Engine</span>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-black hover:bg-slate-200"
              }`}
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              onClick={openLogin}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-md cursor-pointer ${
                isDark
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg border ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 py-4 transition-all duration-200 ${
            isDark
              ? "bg-slate-950 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openLogin();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white shadow-md active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
