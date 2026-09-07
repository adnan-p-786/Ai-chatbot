"use client";

import React, { useState } from "react";
import { ChatSession, DateGroupedSessions } from "@/lib/types";
import { groupSessionsByDate } from "@/lib/chat-storage";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  isOpen,
  onToggleOpen,
  isMobileOpen,
  onCloseMobile,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedSessions = groupSessionsByDate(sessions, searchQuery);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId === id) {
      onDeleteSession(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => {
        setDeletingId((curr) => (curr === id ? null : curr));
      }, 3000);
    }
  };

  const renderGroup = (title: string, groupList: ChatSession[]) => {
    if (groupList.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <div className="space-y-1">
          {groupList.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = session.id === editingId;
            const isPendingDelete = session.id === deletingId;

            return (
              <div
                key={session.id}
                onClick={() => {
                  if (!isEditing) {
                    onSelectSession(session.id);
                    onCloseMobile();
                  }
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-slate-800/90 text-white font-medium border border-slate-700/80 shadow-xs"
                    : "text-slate-300 hover:bg-slate-850 hover:text-white border border-transparent hover:border-slate-800/60"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full" />
                )}

                {/* Left side: Icon and title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                  <svg
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>

                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(session.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full bg-slate-950 text-white text-xs px-2 py-1 rounded border border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        title="Save"
                        className="text-emerald-400 hover:text-emerald-300 p-1"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        title="Cancel"
                        className="text-slate-400 hover:text-slate-200 p-1"
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <span className="truncate text-xs tracking-tight" title={session.title}>
                      {session.title || "Untitled Chat"}
                    </span>
                  )}
                </div>

                {/* Right side: Action icons (Rename & Delete) */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(session, e)}
                      title="Rename chat"
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-700/60 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(session.id, e)}
                      title={isPendingDelete ? "Click again to confirm delete" : "Delete chat"}
                      className={`p-1 rounded transition-colors ${
                        isPendingDelete
                          ? "text-red-400 bg-red-950/60 ring-1 ring-red-500 animate-pulse"
                          : "text-slate-400 hover:text-red-400 hover:bg-slate-700/60"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const hasAnySessions = sessions.length > 0;
  const groupsEmpty =
    groupedSessions.today.length === 0 &&
    groupedSessions.yesterday.length === 0 &&
    groupedSessions.lastWeek.length === 0 &&
    groupedSessions.older.length === 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 select-none">
      {/* Top Header: New Chat & Desktop Collapse */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs py-2.5 px-3 rounded-xl shadow-md shadow-indigo-500/15 transition-all cursor-pointer active:scale-[0.98]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={onToggleOpen}
          title="Collapse sidebar"
          className="hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          title="Close sidebar"
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      {hasAnySessions && (
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        {!hasAnySessions ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400">No chat history</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Start a new conversation to begin!
            </p>
          </div>
        ) : groupsEmpty ? (
          <div className="text-center py-8 px-4 text-xs text-slate-500">
            No chats found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <>
            {renderGroup("Today", groupedSessions.today)}
            {renderGroup("Yesterday", groupedSessions.yesterday)}
            {renderGroup("Previous 7 Days", groupedSessions.lastWeek)}
            {renderGroup("Older", groupedSessions.older)}
          </>
        )}
      </div>

      {/* Footer: Stats & Clear All */}
      {hasAnySessions && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            {sessions.length} {sessions.length === 1 ? "conversation" : "conversations"}
          </span>

          {confirmClearAll ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClearAllSessions();
                  setConfirmClearAll(false);
                }}
                className="text-red-400 hover:text-red-300 font-medium text-[11px] px-1.5 py-0.5 rounded bg-red-950/50 border border-red-800/60"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="text-slate-400 hover:text-slate-200 text-[11px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              title="Clear all chat history"
              className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Clear history</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Animated width */}
      <aside
        className={`hidden md:block transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] z-20 shrink-0 ${
          isOpen ? "w-68" : "w-0 overflow-hidden border-none"
        }`}
      >
        <div className="w-68 h-full">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
