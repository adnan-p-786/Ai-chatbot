import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatSession } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ai-Chatbot",
  description: "AI Chatbot with Chat History and TanStack AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
        {children}
      </body>
    </html>
  );
}
export interface ChatContainerProps {
  session: ChatSession;
  onUpdateMessages: (sessionId: string, messages: any[]) => void;
  onFirstUserMessage: (sessionId: string, promptText: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}
