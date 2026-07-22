import React, { useState, useEffect } from "react";
import axios from "axios";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import { Users, X, MessageSquare, Circle, AlertCircle } from "lucide-react";
import { socket } from "../socket";

export default function Dashboard({
  onLogout,
  theme: externalTheme,
  toggleTheme: externalToggleTheme,
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || externalTheme || "dark";
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showOnlineDrawer, setShowOnlineDrawer] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const [dmUnreads, setDmUnreads] = useState({});
  const [groupUnreads, setGroupUnreads] = useState({});

  const [offlineToast, setOfflineToast] = useState(null);

  const isDark = theme === "dark";
  const apiHost = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
    if (externalToggleTheme) externalToggleTheme(nextTheme);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
      }
    }
  }, []);

  // 1. Dynamic Room Join & Global Notification Logic
  useEffect(() => {
    if (!currentUser?._id) return;

    if (!socket.connected) socket.connect();

    socket.emit("user_connected", currentUser._id);
    socket.emit("join_group", currentUser._id);

    const currentRoomId = activeRoom?._id || activeRoom?.id;
    if (currentRoomId) {
      socket.emit("join_group", currentRoomId);
    }

    socket.on("get_online_users", (onlineIds) => {
      setOnlineUserIds(onlineIds || []);
    });

    // Realtime Message & Notification Router
    const handleReceiveMessage = (messageData) => {
      const senderId = messageData?.sender?._id || messageData?.sender;
      const messageGroupId = messageData?.groupId;

      if (senderId === currentUser._id) return;

      const isDirectMessage =
        messageData.isDirect ||
        (messageGroupId && messageGroupId.startsWith("dm_"));

      if (isDirectMessage) {
        const activeTargetId = activeRoom?.targetUser?._id;
        const isCurrentlyChattingWithSender =
          activeRoom?.isDirect && activeTargetId === senderId;

        if (!isCurrentlyChattingWithSender) {
          setDmUnreads((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
        }
      } else if (messageGroupId) {
        const activeRoomId = activeRoom?._id || activeRoom?.id;
        if (activeRoomId !== messageGroupId) {
          setGroupUnreads((prev) => ({
            ...prev,
            [messageGroupId]: (prev[messageGroupId] || 0) + 1,
          }));
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("get_online_users");
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [currentUser, activeRoom]);

  useEffect(() => {
    if (activeRoom?.isDirect && activeRoom?.targetUser?._id) {
      const targetId = activeRoom.targetUser._id;
      const isTargetOnline = onlineUserIds.includes(targetId);

      if (!isTargetOnline) {
        setOfflineToast(
          `${activeRoom.targetUser.name || "User"} went offline. Closing chat.`,
        );
        setTimeout(() => setOfflineToast(null), 3500);
        setActiveRoom(null);
      }
    }
  }, [onlineUserIds, activeRoom]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiHost}/api/auth/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data && Array.isArray(res.data)) {
          setAllUsers(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch user list from endpoint");
      }
    };
    fetchUsers();
  }, [apiHost]);

  const handleSelectRoom = (room) => {
    const roomId = room._id || room.id;
    setActiveRoom(room);
    setIsMobileSidebarOpen(false);

    if (roomId) {
      setGroupUnreads((prev) => {
        const copy = { ...prev };
        delete copy[roomId];
        return copy;
      });
    }
  };

  const handleStartDirectChat = (targetUser, isOnline) => {
    if (!currentUser || targetUser._id === currentUser._id) return;

    if (!isOnline) {
      setOfflineToast(`${targetUser.name || "User"} is offline right now.`);
      setTimeout(() => setOfflineToast(null), 3000);
      return;
    }

    setDmUnreads((prev) => {
      const copy = { ...prev };
      delete copy[targetUser._id];
      return copy;
    });

    const sortedIds = [currentUser._id, targetUser._id].sort();
    const dmRoomId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    const dmRoomObject = {
      _id: dmRoomId,
      id: dmRoomId,
      name: targetUser.name,
      isDirect: true,
      targetUser,
    };

    setActiveRoom(dmRoomObject);
    setShowOnlineDrawer(false);
  };

  const rawUsers =
    allUsers.length > 0 ? allUsers : currentUser ? [currentUser] : [];

  const displayUsers = [...rawUsers].sort((a, b) => {
    if (a._id === currentUser?._id) return -1;
    if (b._id === currentUser?._id) return 1;
    return 0;
  });

  const totalDmUnreads = Object.values(dmUnreads).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-300 relative ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* 1. TOPBAR */}
      <Topbar
        roomName={activeRoom?.name || "Select a Room / Channel"}
        onlineCount={onlineUserIds.length}
        hasUnread={totalDmUnreads > 0}
        unreadCount={totalDmUnreads}
        onOnlineClick={() => setShowOnlineDrawer(!showOnlineDrawer)}
        theme={theme}
        toggleTheme={handleToggleTheme}
        onMobileToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* 2. MAIN BODY */}
      <div className="flex flex-1 overflow-hidden relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:block w-80 h-full shrink-0">
          <Sidebar
            currentUser={currentUser}
            activeRoom={activeRoom}
            setActiveRoom={handleSelectRoom}
            groupUnreads={groupUnreads}
            onLogout={onLogout}
            theme={theme}
          />
        </div>

        {/* CHAT AREA */}
        <main className="flex-1 h-full w-full overflow-hidden flex flex-col relative">
          <ChatArea
            activeRoom={activeRoom}
            currentUser={currentUser}
            theme={theme}
          />
        </main>
      </div>

      {/* 3. MOBILE SIDEBAR */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 pointer-events-none ${
          isMobileSidebarOpen ? "pointer-events-auto opacity-100" : "opacity-0"
        }`}
      >
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute top-0 left-0 w-80 max-w-[85vw] h-full shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            currentUser={currentUser}
            activeRoom={activeRoom}
            setActiveRoom={handleSelectRoom}
            groupUnreads={groupUnreads}
            onLogout={onLogout}
            theme={theme}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      </div>

      {/* 4. ONLINE MEMBERS SLIDE DRAWER */}
      {showOnlineDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setShowOnlineDrawer(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          />

          <aside
            className={`relative z-10 w-72 sm:w-80 h-full border-l shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
              isDark
                ? "bg-slate-950/95 border-slate-800 text-slate-100"
                : "bg-white/95 border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center px-4 py-4 sm:py-5 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Community Members
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOnlineDrawer(false)}
                className={`p-1.5 rounded-xl transition-colors active:scale-95 cursor-pointer ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                    : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {offlineToast && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{offlineToast}</span>
              </div>
            )}

            <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
              {displayUsers.map((usr) => {
                const isSelf = usr._id === currentUser?._id;
                const isOnline = onlineUserIds.includes(usr._id);
                const unreadCount = dmUnreads[usr._id] || 0;

                return (
                  <div
                    key={usr._id || Math.random()}
                    onClick={() =>
                      !isSelf && handleStartDirectChat(usr, isOnline)
                    }
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isSelf
                        ? "bg-indigo-600/10 border-indigo-500/20 cursor-default"
                        : isOnline
                          ? "cursor-pointer hover:scale-[1.01] active:scale-95 " +
                            (isDark
                              ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100")
                          : "opacity-60 cursor-not-allowed " +
                            (isDark
                              ? "bg-slate-950/40 border-slate-900"
                              : "bg-slate-100/50 border-slate-200")
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                          {usr.avatar || usr.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                            isDark ? "border-slate-950" : "border-white"
                          } ${isOnline ? "bg-emerald-500" : "bg-slate-500"}`}
                        />
                      </div>

                      <div className="text-left overflow-hidden min-w-0">
                        <p className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{usr.name || "User"}</span>
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-400 rounded font-normal">
                              You
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-[10px] font-semibold flex items-center gap-1.5 mt-0.5 ${
                            isOnline ? "text-emerald-400" : "text-slate-500"
                          }`}
                        >
                          <Circle className="w-1.5 h-1.5 fill-current" />
                          <span>{isOnline ? "Active Now" : "Offline"}</span>
                        </p>
                      </div>
                    </div>

                    {!isSelf && (
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-bounce shadow-sm">
                            {unreadCount}
                          </span>
                        )}
                        <div
                          className={`p-1.5 rounded-lg border shrink-0 ${
                            isDark
                              ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                              : "bg-indigo-50 border-indigo-200 text-indigo-600"
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
