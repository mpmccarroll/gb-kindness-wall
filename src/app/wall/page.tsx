"use client";

import { useState, useEffect, useCallback } from "react";
import { KindnessMessage, WallCategory, WALL_TABS } from "@/lib/types";

export default function WallPage() {
  const [messages, setMessages] = useState<KindnessMessage[]>([]);
  const [activeTab, setActiveTab] = useState<WallCategory>("K");
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?category=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch on tab change
  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh every 8 seconds for live updates
  useEffect(() => {
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Count messages per category for badges
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/messages?counts=true");
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts || {});
        }
      } catch {
        // silent fail on counts
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gb-maroon text-white py-5 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-4xl mb-1">🐻</div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wide">
            The GB Kindness Wall
          </h1>
          <p className="font-body text-white/80 text-sm mt-1">
            Friday, April 24, 2026
          </p>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gb-maroon/10 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {WALL_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-3 font-body text-sm transition-all relative ${
                  activeTab === tab.key
                    ? "tab-active"
                    : "text-gb-black/50 hover:text-gb-black/70"
                }`}
              >
                {tab.label}
                {counts[tab.key] ? (
                  <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gb-orange text-white min-w-[18px]">
                    {counts[tab.key]}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Wall content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl animate-bounce">🐻</div>
            <p className="font-body text-gb-black/50 mt-2">
              Loading kindness...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">💛</div>
            <p className="font-body text-lg text-gb-black/50">
              No messages yet for{" "}
              {WALL_TABS.find((t) => t.key === activeTab)?.label}.
            </p>
            <p className="font-body text-sm text-gb-black/30 mt-1">
              Be the first to post!
            </p>
          </div>
        ) : (
          <div className="wall-grid">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`kindness-card color-${i % 6} animate-pop-in`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <p className="font-body text-gb-black/90 text-base leading-relaxed mb-3">
                  &ldquo;{msg.message}&rdquo;
                </p>
                <div className="border-t border-gb-black/10 pt-2 mt-2">
                  <p className="font-body font-bold text-gb-maroon text-sm">
                    For {msg.recipient_name}
                    <span className="font-normal text-gb-black/50 ml-1">
                      {msg.recipient_role === "teacher"
                        ? "· Teacher"
                        : msg.recipient_role === "staff"
                        ? "· Staff"
                        : msg.recipient_role === "parent"
                        ? "· Parent"
                        : msg.recipient_grade
                        ? `· Grade ${msg.recipient_grade}`
                        : ""}
                    </span>
                  </p>
                  <p className="font-body text-xs text-gb-black/40 mt-0.5">
                    — A Grade {msg.author_grade} student
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with link back to submit */}
      <div className="text-center pb-8">
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gb-orange text-white font-display rounded-full shadow-md hover:bg-gb-orange-dark transition-colors"
        >
          Post Your Own Kindness 🐻
        </a>
      </div>
    </div>
  );
}
