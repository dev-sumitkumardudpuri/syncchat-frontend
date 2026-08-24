import React, { useState, useEffect } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { X, Loader2, MessageSquare, AlertCircle } from "lucide-react";

function AuthModal({
  isOpen,
  onClose,
  isSignup: initialIsSignup,
  theme = "dark",
  onSuccessLogin,
}) {
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiHost = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const apiBaseUrl = `${apiHost}/api/auth`;

  useEffect(() => {
    setIsSignup(initialIsSignup);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  }, [initialIsSignup, isOpen]);

  const isDark = theme === "dark";

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");

        const googleUserInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const { name, email, sub: googleId } = googleUserInfo.data;

        const response = await axios.post(`${apiBaseUrl}/google`, {
          name,
          email,
          googleId,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user || response.data),
          );
          window.dispatchEvent(new Event("storage"));
          if (onSuccessLogin) onSuccessLogin();
          onClose();
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to sign in with Google. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Sign-In failed or was cancelled.");
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmailDomain = (email) => {
    const allowedDomains = [
      "gmail.com",
      "outlook.com",
      "hotmail.com",
      "yahoo.com",
      "icloud.com",
      "zoho.com",
      "protonmail.com",
      "proton.me",
    ];

    const emailParts = email.trim().toLowerCase().split("@");
    if (emailParts.length !== 2) return false;

    const domain = emailParts[1];
    const isCommonValid = allowedDomains.includes(domain);
    const isLikelyCorporate =
      domain.includes(".") &&
      !domain.match(
        /(yopmail|mailinator|tempmail|dispostable|getairmail|trashmail)/,
      );

    return isCommonValid || isLikelyCorporate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup && !validateEmailDomain(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const endpoint = isSignup ? `${apiBaseUrl}/signup` : `${apiBaseUrl}/login`;

    try {
      const response = await axios.post(endpoint, formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user || response.data),
        );
        window.dispatchEvent(new Event("storage"));
        if (onSuccessLogin) onSuccessLogin();
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative shadow-2xl ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            : "bg-white border-slate-200 text-slate-900 shadow-xl"
        }`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-500 border border-indigo-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isSignup ? "Join SyncChat" : "Welcome Back"}
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isSignup
                  ? "Create your account to start real-time messaging."
                  : "Sign in to access your chats and group rooms."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? "border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-slate-800"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:text-black hover:bg-slate-200"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              isDark
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-rose-50 border-rose-200 text-rose-600"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label
                className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Rahul Kumar"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-600"
                    : "bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          )}

          <div>
            <label
              className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@gmail.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                isDark
                  ? "bg-slate-950/60 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-600"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                isDark
                  ? "bg-slate-950/60 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-600"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-600 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 font-semibold rounded-xl text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center select-none">
          <div
            className={`grow border-t ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          />
          <span
            className={`shrink mx-3 text-[10px] font-bold tracking-widest uppercase ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Or
          </span>
          <div
            className={`grow border-t ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          />
        </div>

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 ${
            isDark
              ? "bg-slate-950/80 border-slate-800 hover:bg-slate-800 text-slate-200"
              : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800 shadow-sm"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.054 14.996 0 12 0 7.354 0 3.313 2.667 1.309 6.55l3.957 3.215z"
            />
            <path
              fill="#4285F4"
              d="M23.773 12.273c0-.818-.073-1.609-.209-2.373H12v4.509h6.6c-.286 1.518-1.141 2.809-2.423 3.664l3.773 2.927c2.205-2.036 3.823-5.036 3.823-8.727z"
            />
            <path
              fill="#FBBC05"
              d="M1.309 6.55A11.944 11.944 0 000 12c0 1.927.455 3.75 1.259 5.373l3.973-3.082a7.042 7.042 0 01-.191-2.291c0-1.636.555-3.136 1.482-4.345L1.31 6.55z"
            />
            <path
              fill="#34A853"
              d="M12 19.091c-1.955 0-3.691-1.1-4.564-2.718L3.464 19.46C5.491 23.345 9.536 24 12 24c3.09 0 5.927-1.055 8.127-2.882l-3.773-2.927c-1.19.791-2.673 1.255-4.354 1.255z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center text-xs">
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            onClick={() => {
              setError("");
              setIsSignup(!isSignup);
            }}
            className="font-bold cursor-pointer ml-1 text-indigo-500 hover:underline"
          >
            {isSignup ? "Sign In" : "Register"}
          </button>
        </div>
        <p
          className="font-bold"
          style={{ fontSize: "12px", color: "gray", marginTop: "10px" }}
        >
          Demo Credentials: <br /> User: user@gmail.com Password: user <br />
          User2: user2@gmail.com Password: user2
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
