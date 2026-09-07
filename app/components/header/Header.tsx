"use client";


interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
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
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr  from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"
              />
            </svg>
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 hidden sm:inline-block">
            AI Chatbot
          </span>
          
        </div>
        
      </div>
    </header>
  );
}
