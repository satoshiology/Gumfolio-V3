import * as React from "react";
import { Sparkles, Send, Bot, Zap, BrainCircuit, MessageSquare, Loader2, Pin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { gumroadService } from "../services/gumroadService";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatContext } from "../context/ChatContext";
import { useStrategyContext } from "../context/StrategyContext";
import AgentConsole from "./AgentConsole";
import { ChatSuggestions } from "./ChatSuggestions";

export default function AIAgent() {
  const [input, setInput] = React.useState("");
  const [consoleOpen, setConsoleOpen] = React.useState(false);
  const { messages, setMessages, clearHistory, chatRef, sendMessage, isLoading } = useChatContext();
  const { pinItem } = useStrategyContext();

  const handleSend = async (textOrEvent?: string | React.MouseEvent) => {
    const text = typeof textOrEvent === 'string' ? textOrEvent : input;
    if (typeof text !== 'string' || !text.trim() || isLoading) return;
    
    setInput("");
    const responseText = await sendMessage(text);
    
    if (responseText) {
      // Auto-analyze for strategy-worthiness (simple heuristic)
      const strategicKeywords = ["plan", "strategy", "optimize", "increase", "revenue", "scale", "tactics", "growth"];
      if (strategicKeywords.some(keyword => responseText.toLowerCase().includes(keyword)) && responseText.length < 500) {
        pinItem("Suggested: " + responseText, true);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-20rem)]"
    >
      <header className="mb-8 text-center flex justify-between items-center px-4">
        <button onClick={() => setConsoleOpen(true)} className="text-secondary hover:text-primary transition-colors">
          <Zap className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">AI Strategist</h1>
        <div className="w-6" /> {/* Spacer */}
      </header>

      {consoleOpen && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/90 backdrop-blur-md p-6 flex flex-col">
            <button onClick={() => setConsoleOpen(false)} className="self-end mb-4 text-on-surface">Close</button>
            <div className="h-full overflow-y-auto">
                <AgentConsole />
            </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col">
        <motion.div 
          key="chat"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-hide pb-4">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary/20 text-on-surface border border-primary/30 rounded-tr-none" 
                    : "bg-surface-container-high/60 text-on-surface border border-white/5 rounded-tl-none backdrop-blur-md prose prose-invert prose-sm max-w-none"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", msg.role === "user" ? "text-primary": "text-secondary")}>
                      {msg.role === "user" ? "You" : "Ally"}
                    </span>
                  </div>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-4 list-disc pl-4 space-y-2">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-4 list-decimal pl-4 space-y-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-4 mt-6">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-md font-bold mb-3 mt-5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-4">{children}</h3>,
                          strong: ({ children }) => <strong className="font-bold text-secondary">{children}</strong>,
                          hr: () => <hr className="my-6 border-white/10" />,
                          code: ({ children }) => <code className="bg-black/30 rounded px-1.5 py-0.5 text-xs text-secondary font-mono">{children}</code>
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      <button 
                        onClick={() => pinItem(msg.content)}
                        className="mt-2 opacity-50 hover:opacity-100 transition-opacity"
                        title="Pin to Echo Chamber"
                      >
                       <Pin className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-label text-zinc-600 uppercase tracking-widest mt-2 px-1">
                  {msg.role === "user" ? "You" : "STRATEGY ALLY"} • {msg.timestamp}
                </span>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-primary/60 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-label uppercase tracking-widest">Processing...</span>
              </div>
            )}
          </div>
        </motion.div>
        <ChatSuggestions />
      </div>

    </motion.div>
  );
}

