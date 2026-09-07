import { ChatSession, DateGroupedSessions } from "./types";

const SESSIONS_STORAGE_KEY = "ai_chatbot_sessions_v1";
const ACTIVE_SESSION_STORAGE_KEY = "ai_chatbot_active_session_id_v1";

const isBrowser = (): boolean => typeof window !== "undefined";

export const getStoredSessions = (): ChatSession[] => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error("Failed to load sessions from localStorage:", error);
    return [];
  }
};

export const saveStoredSessions = (sessions: ChatSession[]): void => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions to localStorage:", error);
  }
};

export const getActiveSessionId = (): string | null => {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to get active session ID from localStorage:", error);
    return null;
  }
};

export const setActiveSessionId = (id: string | null): void => {
  if (!isBrowser()) return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to set active session ID in localStorage:", error);
  }
};

export const createNewSession = (title = "New Chat"): ChatSession => {
  const newSession: ChatSession = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  return newSession;
};

export const updateSessionInStorage = (
  id: string,
  updates: Partial<ChatSession>
): ChatSession[] => {
  const sessions = getStoredSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return sessions;

  sessions[index] = {
    ...sessions[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveStoredSessions(sessions);
  return sessions;
};

export const deleteSessionFromStorage = (id: string): ChatSession[] => {
  const sessions = getStoredSessions();
  const updated = sessions.filter((s) => s.id !== id);
  saveStoredSessions(updated);
  return updated;
};

export const clearAllSessionsFromStorage = (): void => {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear sessions:", error);
  }
};

export const groupSessionsByDate = (
  sessions: ChatSession[],
  searchQuery = ""
): DateGroupedSessions => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfLastWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const filtered = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : sessions;

  // Sort sessions by latest activity
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  const groups: DateGroupedSessions = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  for (const session of sorted) {
    const timestamp = session.updatedAt || session.createdAt;
    if (timestamp >= startOfToday) {
      groups.today.push(session);
    } else if (timestamp >= startOfYesterday) {
      groups.yesterday.push(session);
    } else if (timestamp >= startOfLastWeek) {
      groups.lastWeek.push(session);
    } else {
      groups.older.push(session);
    }
  }

  return groups;
};
