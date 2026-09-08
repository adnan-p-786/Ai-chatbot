"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  X,
  Trash2,
  Plus,
  ChevronLeft,
  Search,
  MessageSquarePlus,
} from "lucide-react";
import { ChatSession } from "@/lib/types";
import { groupSessionsByDate } from "@/lib/chat-storage";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
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
  onClearAllSessions,
  isOpen,
  onToggleOpen,
  isMobileOpen,
  onCloseMobile,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedSessions = groupSessionsByDate(sessions, searchQuery);

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
            const isPendingDelete = session.id === deletingId;

            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onCloseMobile();
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
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  />
                  <span className="truncate text-xs tracking-tight" title={session.title}>
                    {session.title || "Untitled Chat"}
                  </span>
                </div>

                {/* Right side: Action icon (Delete) */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(session.id, e)}
                    title={isPendingDelete ? "Click again to confirm delete" : "Delete chat"}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      isPendingDelete
                        ? "text-red-400 bg-red-950/60 ring-1 ring-red-500 animate-pulse"
                        : "text-slate-400 hover:text-red-400 hover:bg-slate-700/60"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
          className="flex-1 flex items-center justify-center gap-2 bg-linear-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs py-2.5 px-3 rounded-xl shadow-md shadow-indigo-500/15 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={onToggleOpen}
          title="Collapse sidebar"
          className="hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          title="Close sidebar"
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      {hasAnySessions && (
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
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
              <MessageSquarePlus className="w-5 h-5" />
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
                className="text-red-400 hover:text-red-300 font-medium text-[11px] px-1.5 py-0.5 rounded bg-red-950/50 border border-red-800/60 cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              title="Clear all chat history"
              className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
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
