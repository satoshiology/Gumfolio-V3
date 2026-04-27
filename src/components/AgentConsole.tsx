import * as React from "react";
import { Bot, Plus, Trash2, Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import axios from "axios";

export default function AgentConsole() {
  const [agents, setAgents] = React.useState<any[]>([]);
  const [runs, setRuns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [model, setModel] = React.useState("gemini-3.1-flash-lite-preview");
  const [instructions, setInstructions] = React.useState("You are a specialized Gumroad store manager agent.");

  const spawnAgent = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/agent/run", {
        instructions,
        model
      }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("gumroad_access_token")}`
        }
      });
      const newRun = { 
        name: `Agent-${agents.length + 1}`, 
        result: response.data.result, 
        instructions, 
        model,
        timestamp: new Date().toISOString() 
      };
      setAgents(prev => [...prev, newRun]);
      setRuns(prev => [newRun, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-24"
    >
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">AI Settings</h1>
      </header>

      <div className="bg-surface-container/40 p-6 rounded-2xl border border-white/5 space-y-4">
        <h2 className="text-lg font-bold">New Helper Setup</h2>
        <div className="space-y-2">
            <label className="text-sm text-on-surface-variant">Model</label>
            <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-on-surface"
            >
                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
        </div>
        <div className="space-y-2">
            <label className="text-sm text-on-surface-variant">System Instructions</label>
            <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-on-surface h-24"
            />
        </div>
        <button 
          onClick={spawnAgent}
          disabled={loading}
          className="flex items-center justify-center w-full gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5" />}
          Create AI helper
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent, i) => (
          <div key={i} className="bg-surface-container/40 p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-lg">{agent.name}</h3>
              </div>
              <button 
                onClick={() => setAgents(prev => prev.filter((_, idx) => idx !== i))}
                className="text-on-surface-variant hover:text-red-400 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant">Model: {agent.model}</p>
            <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-label uppercase tracking-widest text-zinc-500 mb-2">What it can do</p>
                <div className="flex gap-2">
                    <Zap className="w-6 h-6 text-secondary"/>
                    <span className="text-sm font-body">Gemini Flash Active</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Past helper work</h2>
        {runs.map((run, i) => (
            <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-sm font-mono text-primary">{new Date(run.timestamp).toLocaleString()}</p>
                <p className="text-on-surface-variant italic">"{run.instructions}"</p>
                <pre className="text-white text-xs bg-black p-2 rounded overflow-auto">{JSON.stringify(run.result, null, 2)}</pre>
            </div>
        ))}
      </section>
    </motion.div>
  );
}
