import * as React from "react";
import { useStrategyContext } from "../context/StrategyContext";
import { useChatContext } from "../context/ChatContext";
import { Trash2, Sparkles, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function StrategyEchoChamber() {
  const { pinnedItems, unpinItem } = useStrategyContext();
  const { chatRef, setMessages } = useChatContext();
  const [isSynthesizing, setIsSynthesizing] = React.useState(false);
  const [showConfigModal, setShowConfigModal] = React.useState(false);

  const allIntegrations = ["gmail", "slack", "stripe", "github", "notion", "discord", "airtable"];

  const runSynapse = async () => {
    if (!chatRef.current || pinnedItems.length === 0) return;
    setIsSynthesizing(true);
    try {
        const strategyContext = pinnedItems.map(item => item.content).join("\n\n---\n\n");
        const response = await chatRef.current.sendMessage({ 
            message: `Analyze these pinned strategies and offer a consolidated, high-level tactical execution plan. Include:\n1. A detailed execution plan.\n2. Potential risks and mitigation strategies.\n3. Key success metrics to track.\n\nPinned Strategies:\n${strategyContext}` 
        });
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `### 🧠 Strategy Synapse Insights\n\n${response.text}` 
        }]);
    } catch (e) {
        console.error("Synapse error", e);
    } finally {
        setIsSynthesizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-zinc-950/50 backdrop-blur-xl border-l border-white/5 relative">
      <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Strategy Echo
        </span>
      </h2>
      <div className="flex-1 overflow-y-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {pinnedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container-high/60 p-4 rounded-xl border border-white/5 text-sm leading-relaxed"
            >
              <p className="text-on-surface mb-3">{item.content}</p>
              <button 
                onClick={() => unpinItem(item.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors"
                title="Unpin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {pinnedItems.length === 0 && (
            <p className="text-zinc-600 text-center italic mt-10">No strategies pinned yet. Pin insights from the AI chat.</p>
          )}
        </AnimatePresence>
      </div>

      {pinnedItems.length > 0 && (
          <button 
              onClick={runSynapse}
              disabled={isSynthesizing}
              className="mt-4 w-full p-4 rounded-xl bg-primary/20 border border-primary/50 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
          >
              <BrainCircuit className={cn("w-6 h-6", isSynthesizing && "animate-pulse")} />
              GENERATE STRATEGY
          </button>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-surface-container rounded-2xl p-6 border border-white/10 w-full max-w-md max-h-[80vh] overflow-y-auto space-y-4">
                <h2 className="text-xl font-bold text-white">All Integrations</h2>
                {allIntegrations.map(intId => (
                  <div key={intId} className="flex justify-between items-center p-3 bg-zinc-900 rounded-lg">
                    <span className="text-white capitalize">{intId}</span>
                    <button className="px-3 py-1 bg-zinc-800 rounded-full text-xs">Toggle</button>
                  </div>
                ))}
                <button onClick={() => setShowConfigModal(false)} className="w-full p-3 rounded-lg bg-zinc-800 text-white font-bold">Close</button>
            </div>
        </div>
      )}
    </div>
  );
}
