import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full px-4 py-6">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        
        {/* Welcome Banner */}
        <div className="flex flex-col items-center justify-center text-center text-slate-400 my-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
            AI
          </div>
          <h2 className="text-xl font-bold text-slate-200">AI Chatbot</h2>
          <p className="text-sm max-w-sm text-slate-400">
            Welcome! Type a message below to start chatting with your AI assistant.
          </p>
        </div>

      </div>

      {/* Input Bar */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors shadow-sm">
          Send
        </button>
      </div>
    </div>
  );
}
