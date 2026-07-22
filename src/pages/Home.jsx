import React from "react";
import {
  Zap,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Smile,
  Send,
} from "lucide-react";

export default function Home({ theme = "dark", onGetStarted }) {
  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-75 h-75 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-8 md:pt-12 pb-12 max-w-4xl mx-auto">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6 backdrop-blur-md ${
              isDark
                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Next-Gen WebSockets Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Connect & Chat in <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Real-Time Without Delay
            </span>
          </h1>

          <p
            className={`text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-8 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Instant 1-on-1 messaging, group rooms, online presence indicators,
            and live typing status. Built with Socket.io & MERN stack for speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-200 flex items-center justify-center gap-2 ${
                isDark
                  ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300"
                  : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
              }`}
            >
              Explore Features
            </a>
          </div>

          <div
            className={`mt-10 pt-6 border-t flex items-center justify-center gap-8 text-xs font-medium ${
              isDark
                ? "border-slate-800/80 text-slate-400"
                : "border-slate-200 text-slate-500"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Latency
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Group Rooms
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Typing
              Status
            </span>
          </div>
        </div>

        <div className="mt-4 mb-24 max-w-4xl mx-auto">
          <div
            className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl ${
              isDark
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark
                  ? "bg-slate-950/60 border-slate-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="h-4 w-px bg-slate-700/50 mx-1" />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold">
                    Global The Lounge
                  </span>
                </div>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md ${
                  isDark
                    ? "bg-slate-800 text-emerald-400"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                14 Online Members
              </span>
            </div>

            <div
              className={`p-6 space-y-4 min-h-70 font-sans text-sm ${
                isDark ? "bg-slate-950/40" : "bg-slate-50"
              }`}
            >
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                  AK
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">Alex Kumar</span>
                    <span
                      className={`text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      10:42 AM
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl rounded-tl-xs border ${
                      isDark
                        ? "bg-slate-800/80 border-slate-700 text-slate-200"
                        : "bg-white border-slate-200 text-slate-800 shadow-sm"
                    }`}
                  >
                    Hey team! Socket connection is active now. Typing indicator
                    works smoothly.
                  </div>
                </div>
              </div>

              <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-400 shrink-0">
                  YOU
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span
                      className={`text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      10:43 AM
                    </span>
                    <span className="text-xs font-semibold">You</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tr-xs bg-indigo-600 text-white font-normal shadow-md">
                    Awesome! Let's test the 1-on-1 private rooms now.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs italic text-indigo-400 pt-2">
                <div className="flex gap-1 items-center">
                  <span
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span>Priya Sharma is typing...</span>
              </div>
            </div>

            <div
              className={`p-3 border-t flex items-center gap-2 ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div
                className={`flex-1 px-4 py-2 rounded-xl text-xs flex items-center justify-between border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-500"
                    : "bg-slate-100 border-slate-200 text-slate-400"
                }`}
              >
                <span>Type a message...</span>
                <Smile className="w-4 h-4 text-slate-400" />
              </div>
              <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500 transition-colors">
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div id="features" className="my-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold mb-3">
              Engineered for Seamless Chat
            </h2>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Everything you need for instant real-time interaction in one
              simple platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  : "bg-white border-slate-200 hover:shadow-lg"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instant WebSockets</h3>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Zero page refreshes. Powered by Socket.io engine for
                instantaneous delivery.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  : "bg-white border-slate-200 hover:shadow-lg"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Groups & 1-on-1</h3>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Create custom group rooms or jump into direct private chats with
                online members.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  : "bg-white border-slate-200 hover:shadow-lg"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Auth & State</h3>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                JWT-backed authentication keeping your profile, rooms, and
                conversations safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
