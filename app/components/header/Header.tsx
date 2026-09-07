"use client";

import { Menu, Bot } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat?: () => void;
  activeTitle?: string;
  isSidebarOpen: boolean;
}

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
}: HeaderProps) {
  return (
    <header className="w-full h-16 bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none">
      {/* Left side: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 hidden sm:inline-block">
            AI Chatbot
          </span>
        </div>
      </div>
    </header>
  );
}
