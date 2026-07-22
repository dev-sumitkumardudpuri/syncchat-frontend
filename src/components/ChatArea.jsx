import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";
import { socket } from "../socket";

export default function ChatArea({ activeRoom, currentUser, theme = "dark" }) {
  const isDark = theme === "dark";
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const apiHost = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, typingUser]);

  useEffect(() => {
    const roomId = activeRoom?._id || activeRoom?.id;
    if (!roomId) {
      setMessages([]);
      return;
    }

    if (!socket.connected) socket.connect();

    setLoadingHistory(true);
    setTypingUser(null);

    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`${apiHost}/api/messages/${roomId}`);
        const historyData = res.data.map((msg) => ({
          id: msg._id,
          sender: {
            _id: msg.sender?._id || msg.sender,
            name: msg.sender?.name || "Member",
            avatar: msg.sender?.avatar || "U",
          },
          text: msg.text,
          timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
        }));

        setMessages(historyData);
        setTimeout(() => scrollToBottom("auto"), 30);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchChatHistory();
    socket.emit("join_group", roomId);

    // 1. Receive Messages
    const handleReceiveMessage = (newMessage) => {
      const currentRoomId = activeRoom?._id || activeRoom?.id;
      const incomingRoomId = newMessage.groupId || newMessage.room;

      if (incomingRoomId && incomingRoomId !== currentRoomId) return;

      const msgSenderId = newMessage.sender?._id || newMessage.sender;
      if (msgSenderId === currentUser?._id) return;

      const formattedMsg = {
        id: newMessage._id || Date.now(),
        sender: {
          _id: msgSenderId,
          name: newMessage.sender?.name || "Member",
          avatar: newMessage.sender?.avatar || "U",
        },
        text: newMessage.text,
        timestamp: new Date(
          newMessage.createdAt || Date.now(),
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === formattedMsg.id);
        if (exists) return prev;
        return [...prev, formattedMsg];
      });
      setTypingUser(null);
    };

    // 2. Typing Handlers
    const handleUserTyping = (data) => {
      if (data.userId !== currentUser?._id && data.roomId === roomId) {
        setTypingUser(data.userName || "Someone");
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.roomId === roomId) setTypingUser(null);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("display_typing", handleUserTyping);
    socket.on("display_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("display_typing", handleUserTyping);
      socket.off("display_stop_typing", handleUserStopTyping);
    };
  }, [activeRoom, currentUser?._id, apiHost]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    const roomId = activeRoom?._id || activeRoom?.id;

    if (socket && roomId) {
      socket.emit("typing", {
        roomId,
        userId: currentUser?._id,
        userName: currentUser?.name,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { roomId });
      }, 1500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const roomId = activeRoom?._id || activeRoom?.id;
    if (!messageText.trim() || !roomId) return;

    const textToSend = messageText.trim();
    setMessageText("");
    socket.emit("stop_typing", { roomId });

    socket.emit("send_message", {
      groupId: roomId,
      senderId: currentUser?._id,
      text: textToSend,
    });

    const localMsg = {
      id: Date.now(),
      sender: {
        _id: currentUser?._id || "me",
        name: currentUser?.name || "You",
        avatar: currentUser?.avatar || "U",
      },
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, localMsg]);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full overflow-hidden relative">
      {loadingHistory && (
        <div className="absolute top-2 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-[10px] font-medium backdrop-blur-md border border-indigo-500/30 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 custom-scrollbar"
      >
        {messages.length === 0 && !loadingHistory ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div
            className={`space-y-3 sm:space-y-4 transition-opacity duration-200 ${
              loadingHistory ? "opacity-40 pointer-events-none" : "opacity-100"
            }`}
          >
            {messages.map((msg) => {
              const isMe =
                msg.sender._id === currentUser?._id || msg.sender._id === "me";

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 max-w-[90%] sm:max-w-[75%] ${
                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {msg.sender.avatar ||
                      msg.sender.name?.[0]?.toUpperCase() ||
                      "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    {!isMe && (
                      <p
                        className={`text-[10px] font-bold mb-0.5 ml-1 truncate ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {msg.sender.name}
                      </p>
                    )}

                    <div
                      className={`p-2.5 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : isDark
                            ? "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
                            : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {msg.text}
                      </p>
                      <span
                        className={`block text-[9px] mt-1 font-mono text-right ${
                          isMe
                            ? "text-indigo-200"
                            : isDark
                              ? "text-slate-500"
                              : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TYPING BUBBLE INDICATOR */}
        {typingUser && (
          <div className="flex items-end gap-2 mr-auto">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
              {typingUser[0]?.toUpperCase()}
            </div>
            <div
              className={`p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 border ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <div
        className={`p-2.5 sm:p-4 border-t shrink-0 ${
          isDark
            ? "bg-slate-950 border-slate-800/80"
            : "bg-white border-slate-200 shadow-lg"
        }`}
      >
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/90 border-slate-800 focus-within:border-indigo-500 text-white"
                : "bg-slate-50 border-slate-200 focus-within:border-indigo-600 text-slate-900"
            }`}
          >
            <input
              type="text"
              value={messageText}
              onChange={handleInputChange}
              placeholder={`Message #${activeRoom?.name || "room"}...`}
              className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2.5 sm:p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
