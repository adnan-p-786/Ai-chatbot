
const Header = () => {
  return (
    <header className="w-full h-16 bg-slate-900 text-white border-b border-slate-800 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          AI Chatbot
        </h1>
      </div>
    </header>
  )
}

export default Header