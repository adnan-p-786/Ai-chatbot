"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "./components/header/Header";
import ChatSidebar from "./components/sidebar/ChatSidebar";
import ChatContainer from "./components/chat/ChatContainer";
import { ChatSession } from "@/lib/types";
import {
  getStoredSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  deleteSession,
  updateSessionTitle,
  clearAllSessions,
  getSessionMessages,
} from "@/lib/chat-storage";

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sessions from database on client mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const loadedSessions = await getStoredSessions();
        const storedActiveId = getActiveSessionId();

        if (!isMounted) return;

        if (loadedSessions.length > 0) {
          setSessions(loadedSessions);
          const matched = loadedSessions.find((s) => s.id === storedActiveId);
          const activeId = matched ? matched.id : loadedSessions[0].id;
          setActiveSessionIdState(activeId);
          setActiveSessionId(activeId);
        } else {
          // First time visit or empty DB: create a default session
          const defaultSession = await createNewSession("New Chat");
          if (!isMounted) return;
          const defaultWithFlag: ChatSession = {
            ...defaultSession,
            messages: [],
            _messagesLoaded: true,
          };
          setSessions([defaultWithFlag]);
          setActiveSessionIdState(defaultWithFlag.id);
          setActiveSessionId(defaultWithFlag.id);
        }
      } catch (error) {
        console.error("Failed to initialize sessions from API:", error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  // Fetch messages for the active session when it hasn't been loaded yet
  useEffect(() => {
    if (!activeSessionId) return;

    const currSession = sessions.find((s) => s.id === activeSessionId);
    if (!currSession || currSession._messagesLoaded) return;

    let isCancelled = false;

    getSessionMessages(activeSessionId)
      .then((msgs) => {
        if (isCancelled) return;
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: msgs, _messagesLoaded: true }
              : s,
          ),
        );
      })
      .catch((err) => {
        console.error("Failed to load messages for session:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSessionId, sessions]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionIdState(id);
    setActiveSessionId(id);
  }, []);

  const handleNewChat = useCallback(async () => {
    // If current session is already completely empty and titled "New Chat", reuse it
    if (
      activeSession &&
      activeSession.title === "New Chat" &&
      (!activeSession.messages || activeSession.messages.length === 0)
    ) {
      return;
    }

    try {
      const newSession = await createNewSession("New Chat");
      const sessionWithFlag: ChatSession = {
        ...newSession,
        messages: [],
        _messagesLoaded: true,
      };

      setSessions((prev) => [sessionWithFlag, ...prev]);
      setActiveSessionIdState(newSession.id);
      setActiveSessionId(newSession.id);
    } catch (error) {
      console.error("Failed to create new chat session:", error);
    }
  }, [activeSession]);

  const handleDeleteSession = useCallback(
    async (id: string) => {
      const remaining = sessions.filter((s) => s.id !== id);
      setSessions(remaining);

      if (id === activeSessionId) {
        if (remaining.length > 0) {
          setActiveSessionIdState(remaining[0].id);
          setActiveSessionId(remaining[0].id);
        } else {
          try {
            const fresh = await createNewSession("New Chat");
            const freshWithFlag: ChatSession = {
              ...fresh,
              messages: [],
              _messagesLoaded: true,
            };
            setSessions([freshWithFlag]);
            setActiveSessionIdState(fresh.id);
            setActiveSessionId(fresh.id);
          } catch (error) {
            console.error("Failed to create default session:", error);
          }
        }
      }

      await deleteSession(id);
    },
    [activeSessionId, sessions],
  );

  const handleRenameSession = useCallback(
    async (id: string, newTitle: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)),
      );
      await updateSessionTitle(id, newTitle);
    },
    [],
  );

  const handleClearAllSessions = useCallback(async () => {
    try {
      await clearAllSessions();
      const fresh = await createNewSession("New Chat");
      const freshWithFlag: ChatSession = {
        ...fresh,
        messages: [],
        _messagesLoaded: true,
      };
      setSessions([freshWithFlag]);
      setActiveSessionIdState(fresh.id);
      setActiveSessionId(fresh.id);
    } catch (error) {
      console.error("Failed to clear all sessions:", error);
    }
  }, []);

  const handleUpdateMessages = useCallback(
    (sessionId: string, messages: any[]) => {
      setSessions((prev) => {
        const index = prev.findIndex((s) => s.id === sessionId);
        if (index === -1) return prev;
        if (prev[index].messages === messages) return prev;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          messages,
          updatedAt: new Date(),
        };
        return updated;
      });
    },
    [],
  );

  const handleFirstUserMessage = useCallback(
    async (sessionId: string, promptText: string) => {
      const cleanPrompt = promptText.replace(/\s+/g, " ").trim();
      const smartTitle =
        cleanPrompt.length > 35
          ? cleanPrompt.substring(0, 35) + "..."
          : cleanPrompt;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, title: smartTitle, updatedAt: new Date() }
            : s,
        ),
      );

      await updateSessionTitle(sessionId, smartTitle);
    },
    [],
  );

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 overflow-hidden">
      {/* Top Navigation Header */}
      <Header
        onToggleSidebar={() => {
          setIsSidebarOpen((prev) => !prev);
          setIsMobileSidebarOpen((prev) => !prev);
        }}
        onNewChat={handleNewChat}
        activeTitle={activeSession?.title}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main App Body: Sidebar + Chat Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onClearAllSessions={handleClearAllSessions}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Chat Messages Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden relative">
          {!isInitialized || !activeSession || !activeSession._messagesLoaded ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-400">
                  Loading conversation...
                </span>
              </div>
            </div>
          ) : (
            <ChatContainer
              key={activeSession.id}
              session={activeSession}
              onUpdateMessages={handleUpdateMessages}
              onFirstUserMessage={handleFirstUserMessage}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              isSidebarOpen={isSidebarOpen}
            />
          )}
        </main>
      </div>
    </div>
  );
}
