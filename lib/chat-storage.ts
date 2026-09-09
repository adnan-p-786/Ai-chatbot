import { ChatSession, DateGroupedSessions } from "./types";

const ACTIVE_SESSION_STORAGE_KEY = "ai_chatbot_active_session_id_v1";

const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Fetch all sessions from the database via API
 */
export async function getStoredSessions(): Promise<ChatSession[]> {
  try {
    const response = await fetch("/api/chat/sessions");

    if (!response.ok) {
      throw new Error(`Failed to load sessions (${response.status})`);
    }

    const data = await response.json();
    const sessions: ChatSession[] = (data.sessions || []).map((s: any) => ({
      ...s,
      messages: s.messages || [],
    }));

    return sessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

/**
 * Create a new chat session in the database
 */
export async function createNewSession(
  title = "New Chat",
): Promise<ChatSession> {
  const response = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  const data = await response.json();
  return {
    ...data.session,
    messages: [],
  };
}

/**
 * Delete a session from the database
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete session:", error);
    return false;
  }
}

/**
 * Update a session's title in the database
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string,
): Promise<ChatSession | null> {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update session title");
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error("Failed to update session title:", error);
    return null;
  }
}

/**
 * Delete all sessions from the database
 */
export async function clearAllSessions(): Promise<boolean> {
  try {
    const response = await fetch("/api/chat/sessions", {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to clear all sessions:", error);
    return false;
  }
}

/**
 * Fetch all messages for a specific session from the database
 */
export async function getSessionMessages(sessionId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);

    if (!response.ok) {
      throw new Error("Failed to get messages");
    }

    const data = await response.json();
    const messages = (data.messages || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      parts: [{ type: "text", content: m.content }],
      createdAt: m.createdAt,
    }));

    return messages;
  } catch (error) {
    console.error("Failed to get messages:", error);
    return [];
  }
}

/**
 * Save a new message to the database
 */
export async function saveMessage(
  sessionId: string,
  role: string,
  content: string,
) {
  try {
    const response = await fetch(
      `/api/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          content,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save message");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to save message:", error);
    return null;
  }
}

/**
 * Local storage active session ID helpers (UI state tracking)
 */
export const getActiveSessionId = (): string | null => {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch {
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
  } catch {
    // Ignore storage quota or access errors
  }
};

/**
 * Group sessions by date category for the sidebar
 */
export const groupSessionsByDate = (
  sessions: ChatSession[],
  searchQuery = "",
): DateGroupedSessions => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfLastWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const filtered = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      )
    : sessions;

  const toTimestamp = (dateVal: number | string | Date | undefined): number => {
    if (!dateVal) return 0;
    if (typeof dateVal === "number") return dateVal;
    return new Date(dateVal).getTime() || 0;
  };

  // Sort sessions by latest activity
  const sorted = [...filtered].sort(
    (a, b) =>
      toTimestamp(b.updatedAt || b.createdAt) -
      toTimestamp(a.updatedAt || a.createdAt),
  );

  const groups: DateGroupedSessions = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  for (const session of sorted) {
    const timestamp = toTimestamp(session.updatedAt || session.createdAt);
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

/**
 * Backwards compatibility aliases
 */
export const deleteSessionFromStorage = deleteSession;
export const updateSessionInStorage = (
  id: string,
  updates: Partial<ChatSession>,
) => {
  if (updates.title) {
    return updateSessionTitle(id, updates.title);
  }
  return Promise.resolve(null);
};
export const clearAllSessionsFromStorage = clearAllSessions;
export const saveStoredSessions = (_sessions: ChatSession[]) => {
  // DB is source of truth, no-op
};
