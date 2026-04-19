"use client";

import { useState, useEffect, useCallback } from "react";
import { KindnessMessage } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [pending, setPending] = useState<KindnessMessage[]>([]);
  const [allMessages, setAllMessages] = useState<KindnessMessage[]>([]);
  const [view, setView] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  const fetchData = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending || []);
        setAllMessages(data.all || []);
        setStats(data.stats || { total: 0, approved: 0, pending: 0, rejected: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, password]);

  useEffect(() => {
    if (authenticated) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  }

  async function handleModerate(id: string, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Moderation error:", err);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl p-8 shadow-lg max-w-sm w-full space-y-4"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h1 className="font-display text-xl text-gb-maroon">
              Admin Access
            </h1>
            <p className="font-body text-sm text-gb-black/50 mt-1">
              Kindness Wall Moderation
            </p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded-lg border-2 border-gb-maroon/20 focus:border-gb-orange focus:outline-none font-body"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gb-maroon text-white font-display rounded-lg hover:bg-gb-maroon-dark transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gb-maroon text-white py-4 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl">Kindness Wall Admin</h1>
            <p className="font-body text-white/70 text-xs">
              Moderation Dashboard
            </p>
          </div>
          <div className="flex gap-4 font-body text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {stats.total} total
            </span>
            <span className="bg-green-500/30 px-3 py-1 rounded-full">
              {stats.approved} approved
            </span>
            <span className="bg-yellow-500/30 px-3 py-1 rounded-full">
              {stats.pending} pending
            </span>
            <span className="bg-red-500/30 px-3 py-1 rounded-full">
              {stats.rejected} rejected
            </span>
          </div>
        </div>
      </header>

      {/* View toggle */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView("pending")}
            className={`px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all ${
              view === "pending"
                ? "bg-gb-orange text-white"
                : "bg-white border border-gb-maroon/20 text-gb-black/70"
            }`}
          >
            Pending Review ({pending.length})
          </button>
          <button
            onClick={() => setView("all")}
            className={`px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all ${
              view === "all"
                ? "bg-gb-orange text-white"
                : "bg-white border border-gb-maroon/20 text-gb-black/70"
            }`}
          >
            All Messages
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
        {loading && (
          <p className="font-body text-gb-black/50 text-center py-8">
            Loading...
          </p>
        )}

        {view === "pending" && pending.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-body text-gb-black/50">
              No messages waiting for review!
            </p>
          </div>
        )}

        {(view === "pending" ? pending : allMessages).map((msg) => (
          <div
            key={msg.id}
            className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
              msg.status === "approved"
                ? "border-l-green-500"
                : msg.status === "pending"
                ? "border-l-yellow-500"
                : "border-l-red-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-body text-gb-black/90">
                  &ldquo;{msg.message}&rdquo;
                </p>
                <p className="font-body text-sm text-gb-black/50 mt-1">
                  From {msg.author_name} (Grade {msg.author_grade}) → To{" "}
                  {msg.recipient_name} ({msg.recipient_role})
                  {msg.recipient_grade
                    ? `, Grade ${msg.recipient_grade}`
                    : ""}
                </p>
                <p className="font-body text-xs text-gb-black/30 mt-1">
                  Category: {msg.category} &middot; Status: {msg.status}
                  &middot;{" "}
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>

              {msg.status === "pending" && (
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleModerate(msg.id, "approve")}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg font-body text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerate(msg.id, "reject")}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-body text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}

              {msg.status === "approved" && view === "all" && (
                <span className="text-green-500 text-sm font-body font-semibold ml-4">
                  ✓ Approved
                </span>
              )}
              {msg.status === "rejected" && view === "all" && (
                <span className="text-red-500 text-sm font-body font-semibold ml-4">
                  ✗ Rejected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
