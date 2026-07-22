import React from "react";
import { Moon, Sun, Users, Hash, Menu, X } from "lucide-react";

export default function Topbar({
  roomName,
  onlineCount = 0,
  hasUnread = false,
  unreadCount = 0,
  onOnlineClick,
  theme,
  toggleTheme,
  onMobileToggle,
  isMobileSidebarOpen,
}) {
  const isDark = theme === "dark";
  const showRedDot = hasUnread || unreadCount > 0;

  return (
    <header
      className={`h-14 sm:h-16 w-full border-b shrink-0 flex items-center justify-between px-3 sm:px-6 transition-colors duration-300 z-20 ${
        isDark
          ? "bg-slate-950/90 border-slate-800/80 backdrop-blur-md text-slate-100"
          : "bg-white/90 border-slate-200 backdrop-blur-md text-slate-900 shadow-xs"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
        <button
          type="button"
          onClick={onMobileToggle}
          className={`md:hidden p-2 rounded-xl border transition-all active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
          }`}
          aria-label="Toggle Navigation"
        >
          {isMobileSidebarOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>

        <div
          className={`p-2 rounded-xl shrink-0 ${
            isDark
              ? "bg-slate-900 text-indigo-400 border border-slate-800"
              : "bg-slate-100 text-indigo-600 border border-slate-200"
          }`}
        >
          <Hash className="w-4 h-4" />
        </div>

        <div className="overflow-hidden min-w-0">
          <h2 className="text-xs sm:text-sm font-bold truncate leading-tight">
            {roomName}
          </h2>
          <p
            className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Public Channel
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* ONLINE BUTTON WITH RED DOT ONLY */}
        <button
          type="button"
          onClick={onOnlineClick}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {/* RED DOT NOTIFICATION */}
          {showRedDot && (
            <span className="relative flex h-2.5 w-2.5 -mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
          )}

          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Online:</span>
          <span className="text-indigo-400 font-bold">{onlineCount}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
            isDark
              ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
              : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"
          }`}
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
