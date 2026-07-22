import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleOpenAuth = (signupState = false) => {
    setIsSignup(signupState);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans antialiased ${
        theme === "dark"
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {user ? (
        <Dashboard
          currentUser={user}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <>
          <Navbar
            openLogin={() => handleOpenAuth(false)}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main className="pt-16">
            <Home theme={theme} onGetStarted={() => handleOpenAuth(true)} />
          </main>
        </>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isSignup={isSignup}
        theme={theme}
        onSuccessLogin={handleLoginSuccess}
      />
    </div>
  );
}
