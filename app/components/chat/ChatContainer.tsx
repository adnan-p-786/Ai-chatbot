"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { ChatSession } from "@/lib/types";

interface ChatContainerProps {
  session: ChatSession;
  onUpdateMessages: (sessionId: string, messages: any[]) => void;
  onFirstUserMessage: (sessionId: string, promptText: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const STARTER_PROMPTS = [
  {
    title: "Explain a concept",
    description: "Explain quantum computing in simple, easy terms",
  },
  {
    title: "Write some code",
    description: "Write a clean TypeScript debounce hook with tests",
  },
  {
    title: "Brainstorm ideas",
    description: "Suggest 5 unique startup ideas in AI & productivity",
  },
  {
    title: "Debug & Optimize",
    description: "Help me debug why my React useEffect is firing twice",
  },
];

export default function ChatContainer({
  session,
  onUpdateMessages,
  onFirstUserMessage,
  onToggleSidebar,
  isSidebarOpen,
}: ChatContainerProps) {
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isFirstMessageRef = useRef<boolean>(session.messages.length === 0);

  const { messages, sendMessage, isLoading, stop, error } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
    threadId: session.id,
    initialMessages: session.messages || [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Sync messages to storage whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      onUpdateMessages(session.id, messages);
    }
  }, [messages, session.id, onUpdateMessages]);

  const handleSendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (isFirstMessageRef.current || session.title === "New Chat") {
      isFirstMessageRef.current = false;
      onFirstUserMessage(session.id, trimmed);
    }

    setInput("");
    await sendMessage(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendPrompt(input);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const getMessageContent = (message: any): string => {
    if (message.parts && message.parts.length > 0) {
      return message.parts
        .map((p: any) => (p.type === "text" ? p.content : ""))
        .join("");
    }
    return message.content || "";
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 py-4 md:py-6">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        {messages.length === 0 ? (
          /* Empty State & Starter Prompts */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center my-auto space-y-8 px-2">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 animate-pulse">
                <svg
                  className="w-7 h-7 text-white"
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
              <div className="space-y-1.5 max-w-md">
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                  How can I help you today?
                </h2>
                <p className="text-sm text-slate-400">
                  Ask a question, brainstorm ideas, or generate code snippets.
                </p>
              </div>
            </div>

            {/* Quick Starter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
              {STARTER_PROMPTS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(starter.description)}
                  className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer text-left shadow-xs hover:shadow-md hover:shadow-indigo-500/5 flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {starter.title}
                  </span>
                  <span className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {starter.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((message, index) => {
            const isUser = message.role === "user";
            const fullContent = getMessageContent(message);

            return (
              <div
                key={message.id || index}
                className={`flex gap-3 group ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs shadow-indigo-500/20">
                    AI
                  </div>
                )}

                <div className="flex flex-col max-w-[85%] md:max-w-[80%]">
                  <div
                    className={`relative rounded-2xl px-4 py-3 text-sm shadow-md ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-slate-900 border border-slate-800/90 text-slate-200 rounded-tl-xs"
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
                        {fullContent}
                      </div>
                    )}
                  </div>

                  {/* Actions under message (e.g. Copy button) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(fullContent, index)}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800/60"
                        title="Copy message"
                      >
                        {copiedIndex === index ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5 text-emerald-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
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
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-slate-400 flex items-center gap-2 shadow-xs">
              <span className="flex space-x-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Generating response...
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
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50 shadow-inner"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="bg-red-600/85 hover:bg-red-600 text-white font-medium px-4 py-3 rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-500 text-white font-medium px-5 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 disabled:shadow-none"
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
