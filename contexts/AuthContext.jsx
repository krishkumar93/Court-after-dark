"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
      return data.user || null;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }
    await refreshUser();
    return data.user;
  }

  async function loginDemo(role = "player") {
    const res = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Demo login failed");
    }
    await refreshUser();
    return data.user;
  }

  async function register({ name, email, phone, password }) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Registration failed");
      err.data = data;
      throw err;
    }
    return data;
  }

  async function sendOtp(phone, purpose = "login") {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, purpose }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Failed to send verification SMS.");
      err.data = data;
      throw err;
    }
    return data;
  }

  async function verifyOtp({ phone, otp, pendingSessionId }) {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, pendingSessionId }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Failed to verify OTP.");
      err.data = data;
      throw err;
    }
    await refreshUser();
    return data.user;
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        login,
        loginDemo,
        register,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
