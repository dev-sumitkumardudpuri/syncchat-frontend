import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import {
  Users,
  Plus,
  LogOut,
  Hash,
  ChevronRight,
  X,
  Sparkles,
  Loader2,
  Bell,
} from "lucide-react";
import { socket } from "../socket";

export default function Sidebar({
  currentUser,
  activeRoom,
  setActiveRoom,
  groupUnreads = {},
  onLogout,
  theme = "dark",
  onCloseMobile,
}) {
  const isDark = theme === "dark";
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const apiHost = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Helper function to join all groups via socket
  const joinSocketRooms = (groupsList) => {
    if (groupsList.length > 0 && socket.connected) {
      const groupIds = groupsList.map((g) => g._id || g.id);
      socket.emit("join_all_groups", groupIds);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiHost}/api/groups`);
      const fetchedGroups = Array.isArray(res.data) ? res.data : [];
      setGroups(fetchedGroups);

      joinSocketRooms(fetchedGroups);

      if (fetchedGroups.length > 0 && !activeRoom?._id && !activeRoom?.id) {
        const savedRoomId = localStorage.getItem("last_active_room_id");
        const foundSavedRoom = fetchedGroups.find(
          (g) => (g._id || g.id) === savedRoomId,
        );

        if (foundSavedRoom) {
          setActiveRoom(foundSavedRoom);
        } else {
          setActiveRoom(fetchedGroups[0]);
          localStorage.setItem(
            "last_active_room_id",
            fetchedGroups[0]._id || fetchedGroups[0].id,
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // 2. Fetch groups
    fetchGroups();

    const handleConnect = () => {
      if (groups.length > 0) {
        joinSocketRooms(groups);
      } else {
        fetchGroups();
      }
    };

    const handleNewGroupCreated = (newGroup) => {
      setGroups((prev) => {
        const exists = prev.some(
          (g) => (g._id || g.id) === (newGroup._id || newGroup.id),
        );
        if (exists) return prev;
        return [...prev, newGroup];
      });

      const newGroupId = newGroup._id || newGroup.id;
      if (newGroupId) {
        socket.emit("join_group", newGroupId);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("group_created", handleNewGroupCreated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("group_created", handleNewGroupCreated);
    };
  }, []);

  useEffect(() => {
    if (groups.length > 0 && socket.connected) {
      joinSocketRooms(groups);
    }
  }, [groups]);

  const handleSelectRoom = (group) => {
    const groupId = group._id || group.id;
    setActiveRoom(group);
    if (groupId) {
      localStorage.setItem("last_active_room_id", groupId);
      socket.emit("join_group", groupId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const res = await axios.post(`${apiHost}/api/groups`, {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        userId: currentUser?._id,
      });

      setNewGroupName("");
      setNewGroupDesc("");
      setIsCreateGroupOpen(false);

      const createdGroup = res.data;
      setGroups((prev) => [...prev, createdGroup]);

      socket.emit("new_group_created", createdGroup);
      handleSelectRoom(createdGroup);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    if (currentUser?._id) {
      socket.emit("user_logout", currentUser._id);
    }
    socket.disconnect();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <aside
        className={`w-full h-full border-r flex flex-col justify-between shrink-0 select-none transition-colors duration-300 relative z-50 pointer-events-auto ${
          isDark
            ? "bg-slate-950 border-slate-800/80 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* User Card */}
          <div
            className={`p-3.5 sm:p-4 border-b shrink-0 transition-colors duration-200 flex items-center justify-between ${
              isDark
                ? "border-slate-800/80 bg-slate-900/40"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-600/20">
                  {currentUser?.avatar ||
                    currentUser?.name?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>

              <div className="flex-1 overflow-hidden">
                <h3 className="text-xs sm:text-sm font-bold truncate leading-tight">
                  {currentUser?.name || "User Profile"}
                </h3>
                <p
                  className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {currentUser?.email || "user@syncchat.com"}
                </p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseMobile();
                }}
                className={`md:hidden p-2 rounded-xl border transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Groups Header */}
          <div className="px-4 pt-4 sm:pt-5 pb-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Groups & Rooms
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setIsCreateGroupOpen(true);
              }}
              className={`p-1.5 rounded-xl border transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title="Create New Group"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-xs text-slate-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Loading rooms...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No rooms available.
              </div>
            ) : (
              groups.map((group) => {
                const currentActiveId = activeRoom?._id || activeRoom?.id;
                const groupId = group._id || group.id;
                const isActive = currentActiveId === groupId;
                const hasUnread = (groupUnreads[groupId] || 0) > 0;

                return (
                  <button
                    key={groupId}
                    type="button"
                    onClick={() => handleSelectRoom(group)}
                    className={`w-full p-2.5 rounded-xl transition-all duration-200 ease-out flex items-center justify-between text-left cursor-pointer group active:scale-[0.98] ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 translate-x-1"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-900/80 hover:text-white hover:translate-x-0.5"
                          : "text-slate-700 hover:bg-slate-100 hover:translate-x-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 transition-colors duration-200 relative ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isDark
                              ? "bg-slate-900 text-indigo-400 border border-slate-800 group-hover:border-indigo-500/50"
                              : "bg-slate-100 text-indigo-600"
                        }`}
                      >
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-xs truncate ${
                              hasUnread && !isActive
                                ? isDark
                                  ? "font-bold text-white"
                                  : "font-bold text-slate-900"
                                : "font-medium"
                            }`}
                          >
                            {group.name}
                          </p>
                          {group.isPermanent && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 transition-colors ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              }`}
                            >
                              Official
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[10px] truncate mt-0.5 transition-colors ${
                            isActive
                              ? "text-indigo-100"
                              : isDark
                                ? "text-slate-500 group-hover:text-slate-400"
                                : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        >
                          {group.description ||
                            `${group.members?.length || 1} members`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Notification Dot Icon */}
                      {hasUnread && !isActive && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                      )}

                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                          isActive
                            ? "text-white opacity-100"
                            : "text-slate-600 opacity-60 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Logout */}
        <div
          className={`p-3.5 sm:p-4 border-t shrink-0 ${
            isDark
              ? "border-slate-800/80 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={handleLogoutClick}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-200 active:scale-95 cursor-pointer ${
              isDark
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Modal Portal */}
      {isCreateGroupOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
            <div
              className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl transition-all transform scale-100 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Create New Custom Group
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
                <div>
                  <label
                    className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Group Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Design Systems Lounge"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${
                      isDark
                        ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="e.g. Discussions around UI/UX"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${
                      isDark
                        ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-900"
                    }`}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateGroupOpen(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                      isDark
                        ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
