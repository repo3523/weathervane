/* Storage adapter. v0: on-device localStorage + JSON export.
   The interface is deliberately async-shaped so a synced backend
   (e.g. Supabase) can drop in later without touching UI code. */

import { supabase } from "./supabase.js";
import { activeChildId } from "./sync.js";

const LOG_KEY = "wv_log";

export const storage = {
  async loadSessions() {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    } catch {
      return [];
    }
  },

  async saveSession(session) {
    const log = await this.loadSessions();
    log.push(session);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    // Fire-and-forget sync to Supabase
    if (supabase && activeChildId) {
      supabase.from("sessions")
        .insert({ child_id: activeChildId, data: session, date: session.date })
        .then().catch(() => {});
    }
  },

  async clearAll() {
    localStorage.removeItem(LOG_KEY);
  },

  async exportJson() {
    const data = localStorage.getItem(LOG_KEY) || "[]";
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `weathervane-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

/* Track selection: self-report sets the ceiling; behavioral signal
   (tap latency) can only downgrade, and only by ONE step. */
export function chooseTrack(weather, avgLatencyMs) {
  const self = weather === "sunny" ? "stretch" : weather === "cloudy" ? "steady" : "reset";
  let t = self;
  if (avgLatencyMs != null) {
    if (self === "stretch" && avgLatencyMs > 2500) t = "steady";
    else if (self === "steady" && avgLatencyMs > 4000) t = "reset";
  }
  return t;
}
