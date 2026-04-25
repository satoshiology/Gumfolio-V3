import * as React from "react";
import { Bot, Settings2, Plus, Zap, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface Tool {
  id: string;
  name: string;
  enabled: boolean;
}

interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  tools: Tool[];
}

interface Agent {
  id: string;
  name: string;
  model: string;
  integrations: IntegrationConfig[];
}

export function AgentWorkbench() {
  const [agents, setAgents] = React.useState<Agent[]>([
    {
      id: "1",
      name: "Gumfolio Strategist",
      model: "gemini-flash-latest",
      integrations: [
        { 
          id: "gumroad", 
          name: "Gumroad API", 
          enabled: true,
          tools: [
              { id: "refund", name: "Refund Sale", enabled: true },
              { id: "resendReceipt", name: "Resend Receipt", enabled: true }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Autonomous AB-Tester",
      model: "gemini-flash-latest",
      integrations: [
        {
          id: "optimization",
          name: "Conversion Engine",
          enabled: true,
          tools: [
            { id: "landingPage", name: "Landing Page Variants", enabled: true },
            { id: "checkout", name: "Checkout Flow", enabled: false }
          ]
        }
      ]
    }
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [modalAgent, setModalAgent] = React.useState<Agent | null>(null);
  const [newName, setNewName] = React.useState("");
  const allIntegrations = ["gmail", "slack", "stripe", "github", "notion", "discord", "airtable"];

  const toggleTool = (agentId: string, integrationId: string, toolId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? {
      ...a,
      integrations: a.integrations.map(i => i.id === integrationId ? {
        ...i,
        tools: i.tools.map(t => t.id === toolId ? {...t, enabled: !t.enabled} : t)
      } : i)
    } : a));
  };

  const createAgent = () => {
    if (!newName) return;
    const newAgent: Agent = {
        id: Date.now().toString(),
        name: newName,
        model: "gemini-3.1-flash-lite-preview",
        integrations: [
          { 
            id: "gumroad", 
            name: "Gumroad API", 
            enabled: true,
            tools: [
                { id: "refund", name: "Refund Sale", enabled: true },
                { id: "resendReceipt", name: "Resend Receipt", enabled: true }
            ]
          }
        ]
    };
    setAgents(prev => [...prev, newAgent]);
    setNewName("");
    setShowForm(false);
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <h1 className="text-primary font-headline font-extrabold text-3xl">Agent Workbench</h1>
      
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border border-dashed border-primary/30 text-primary font-bold hover:bg-primary/10">
          <Plus className="w-5 h-5" /> Spawn New Agent
        </button>
      ) : (
        <div className="bg-surface-container rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold text-white">Spawn Configuration</h2>
          <input 
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2" 
              placeholder="Agent Name" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
          />
          <p className="text-primary text-sm">Model: gemini-3.1-flash-lite-preview</p>
          <button onClick={createAgent} className="w-full p-3 rounded-lg bg-primary text-black font-bold">Create Agent</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4">
        {agents.map(agent => (
          <div key={agent.id} className="bg-surface-container rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-white">{agent.name}</h3>
              <button onClick={() => { setModalAgent(agent); }} className="hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                <Settings2 className="w-5 h-5 text-zinc-500 hover:text-white" />
              </button>
            </div>
            
            <p className="text-xs text-zinc-500 font-mono">{agent.model}</p>

            {agent.integrations.map(i => (
              <div key={i.id} className="space-y-2">
                <p className="text-xs font-label uppercase text-zinc-400">{i.name}</p>
                {i.tools.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-zinc-900 rounded-lg">
                    <span className={t.enabled ? "text-white" : "text-zinc-600"}>{t.name}</span>
                    <button 
                      onClick={() => toggleTool(agent.id, i.id, t.id)}
                      className={cn("w-10 h-5 rounded-full transition-colors relative", t.enabled ? "bg-primary" : "bg-zinc-700")}
                    >
                      <div className={cn("w-3 h-3 rounded-full bg-white absolute top-1 transition-all", t.enabled ? "left-6" : "left-1")} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {modalAgent && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-surface-container rounded-2xl p-6 border border-white/10 w-full max-w-md max-h-[80vh] overflow-y-auto space-y-4">
                <h2 className="text-xl font-bold text-white">Configure {modalAgent.name}</h2>
                
                {modalAgent.id === "2" && (
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 mb-4">
                        <h3 className="text-white font-bold mb-2">Live A/B Test Variants (Landing Page)</h3>
                        <div className="space-y-3">
                            {[0, 1, 2].map(v => {
                                const conversions = JSON.parse(localStorage.getItem('ab_conversions') || '{}')[v] || 0;
                                const impressions = conversions * Math.floor(Math.random() * 5 + 2); // Simulated impressions for demo
                                const cr = impressions ? ((conversions / impressions) * 100).toFixed(1) : 0;
                                return (
                                    <div key={v} className="bg-black/50 p-2 rounded border border-white/5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-zinc-400">Variant {v}</span>
                                            <span className="text-primary">{cr}% CR</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-500">
                                            <span>{impressions} Views</span>
                                            <span>{conversions} Conv.</span>
                                        </div>
                                        <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${cr}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-3 p-2 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors">
                            Force Agent Re-Optimization
                        </button>
                    </div>
                )}

                {allIntegrations.map(intId => (
                  <div key={intId} className="flex justify-between items-center p-3 bg-zinc-900 rounded-lg">
                    <span className="text-white capitalize">{intId}</span>
                    <button className="px-3 py-1 bg-zinc-800 rounded-full text-xs">Toggle</button>
                  </div>
                ))}
                <button onClick={() => setModalAgent(null)} className="w-full p-3 rounded-lg bg-zinc-800 text-white font-bold">Close</button>
            </div>
        </motion.div>
      )}
    </div>
  );
}
