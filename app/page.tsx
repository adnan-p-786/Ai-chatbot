"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

export default function Home() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, isLoading, stop, error } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage(trimmed);
  };

  const handleSuggestionClick = async (promptText: string) => {
    if (isLoading) return;
    setInput("");
    await sendMessage(promptText);
  };

  const suggestions = [
    { title: "Explain React 19", desc: "Key features & improvements" },
    { title: "Write a API Route", desc: "Next.js App Router POST handler" },
    { title: "Code Refactoring", desc: "Tips for cleaner TypeScript" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-4 py-6">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          /* Welcome Banner & Starter Suggestions */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center my-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 animate-pulse">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-sm text-slate-400">
                Ask a question, brainstorm ideas, or generate code snippets.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl pt-4">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s.title)}
                  className="flex flex-col text-left p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {s.title}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs"
                  }`}
                >
                  {message.parts && message.parts.length > 0 ? (
                    message.parts.map((part, idx) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={idx}
                            className="whitespace-pre-wrap leading-relaxed break-words"
                          >
                            {part.content}
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed break-words">
                      {(message as any).content}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    You
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-slate-400 flex items-center gap-2 shadow-sm">
              <span className="flex space-x-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Thinking...
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <svg
              className="w-4 h-4 text-red-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              {error.message || "An error occurred during chat response."}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="bg-red-600/80 hover:bg-red-600 text-white font-medium px-4 py-3 rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Send</span>
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3 21l18-9L3 3l3 9zm0 0h75"
              />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
