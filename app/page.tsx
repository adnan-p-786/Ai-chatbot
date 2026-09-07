"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "./components/header/Header";
import ChatSidebar from "./components/sidebar/ChatSidebar";
import ChatContainer from "./components/chat/ChatContainer";
import { ChatSession } from "@/lib/types";
import {
  getStoredSessions,
  saveStoredSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  deleteSessionFromStorage,
  updateSessionInStorage,
  clearAllSessionsFromStorage,
} from "@/lib/chat-storage";

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sessions from localStorage on client mount
  useEffect(() => {
    const loadedSessions = getStoredSessions();
    const storedActiveId = getActiveSessionId();

    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      const matched = loadedSessions.find((s) => s.id === storedActiveId);
      const activeId = matched ? matched.id : loadedSessions[0].id;
      setActiveSessionIdState(activeId);
      setActiveSessionId(activeId);
    } else {
      // First time visit: create a default session
      const defaultSession = createNewSession("New Chat");
      setSessions([defaultSession]);
      setActiveSessionIdState(defaultSession.id);
      saveStoredSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    }
    setIsInitialized(true);
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionIdState(id);
    setActiveSessionId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    // If current session is already completely empty and titled "New Chat", reuse it
    if (
      activeSession &&
      activeSession.title === "New Chat" &&
      activeSession.messages.length === 0
    ) {
      return;
    }

    const newSession = createNewSession("New Chat");
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveStoredSessions(updated);
      return updated;
    });
    setActiveSessionIdState(newSession.id);
    setActiveSessionId(newSession.id);
  }, [activeSession]);

  const handleDeleteSession = useCallback(
    (id: string) => {
      const updated = deleteSessionFromStorage(id);
      setSessions(updated);

      if (id === activeSessionId) {
        if (updated.length > 0) {
          setActiveSessionIdState(updated[0].id);
          setActiveSessionId(updated[0].id);
        } else {
          // If all chats deleted, create a fresh empty one
          const fresh = createNewSession("New Chat");
          setSessions([fresh]);
          setActiveSessionIdState(fresh.id);
          saveStoredSessions([fresh]);
          setActiveSessionId(fresh.id);
        }
      }
    },
    [activeSessionId],
  );

  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    const updated = updateSessionInStorage(id, { title: newTitle });
    setSessions(updated);
  }, []);

  const handleClearAllSessions = useCallback(() => {
    clearAllSessionsFromStorage();
    const fresh = createNewSession("New Chat");
    setSessions([fresh]);
    setActiveSessionIdState(fresh.id);
    saveStoredSessions([fresh]);
    setActiveSessionId(fresh.id);
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
          updatedAt: Date.now(),
        };
        saveStoredSessions(updated);
        return updated;
      });
    },
    [],
  );

  const handleFirstUserMessage = useCallback(
    (sessionId: string, promptText: string) => {
      setSessions((prev) => {
        const index = prev.findIndex((s) => s.id === sessionId);
        if (index === -1) return prev;

        const cleanPrompt = promptText.replace(/\s+/g, " ").trim();
        const smartTitle =
          cleanPrompt.length > 35
            ? cleanPrompt.substring(0, 35) + "..."
            : cleanPrompt;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          title: smartTitle,
          updatedAt: Date.now(),
        };
        saveStoredSessions(updated);
        return updated;
      });
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
          {!isInitialized || !activeSession ? (
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
