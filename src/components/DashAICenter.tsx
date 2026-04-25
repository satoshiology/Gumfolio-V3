import * as React from "react";
import Dashboard from "./Dashboard";
import AIAgent from "./AIAgent";
import { cn } from "../lib/utils";

export default function DashAICenter() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'ai'>('ai');

  return (
    <div className="space-y-6">
      <div className="flex p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-fit mx-auto">
        <button
          onClick={() => setActiveTab('ai')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-label font-bold uppercase tracking-wider transition-all",
            activeTab === 'ai' ? "bg-primary text-black shadow-lg" : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-label font-bold uppercase tracking-wider transition-all",
            activeTab === 'dashboard' ? "bg-primary text-black shadow-lg" : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Dashboard
        </button>
      </div>
      <div className="pt-2">
        {activeTab === 'dashboard' ? <Dashboard /> : <AIAgent />}
      </div>
    </div>
  );
}
