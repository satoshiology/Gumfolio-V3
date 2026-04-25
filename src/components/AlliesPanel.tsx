import * as React from "react";
import { Bot, Zap, BrainCircuit, Search, BarChart2, MessageSquareText } from "lucide-react";
import { motion } from "motion/react";

interface CrewCardProps {
  title: string;
  subtitle: string;
  allies: { name: string; icon: React.FC<any> }[];
}

const CrewCard: React.FC<CrewCardProps> = ({ title, subtitle, allies }) => (
  <div className="bg-zinc-900 border-2 border-[#a69a7c]/50 p-6 rounded-2xl space-y-4 mb-6">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-[#a69a7c] font-headline font-bold text-xl">{title}</h2>
        <p className="text-[#a69a7c]/80 font-body text-sm font-light">{subtitle}</p>
      </div>
      <div className="w-12 h-6 bg-green-500 rounded-full cursor-pointer relative">
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all peer-checked:translate-x-6" />
      </div>
    </div>
    <div className="flex gap-4">
      {allies.map((ally) => (
        <div key={ally.name} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800 text-[#a69a7c] flex items-center justify-center">
            <ally.icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-zinc-400">{ally.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export function AlliesPanel() {
  const crews = [
    {
      title: "Discovery Crew",
      subtitle: "Get Found on Reddit",
      allies: [{ name: "Scout", icon: Search }, { name: "Watchman", icon: Bot }, { name: "Explorer", icon: Zap }]
    },
    {
      title: "Revenue Crew",
      subtitle: "Turn Attention Into Sales",
      allies: [{ name: "Alchemist", icon: Zap }, { name: "Closer", icon: BrainCircuit }, { name: "Spark", icon: Bot }]
    },
    {
      title: "Optimization Crew",
      subtitle: "Make What You Have Work Harder",
      allies: [{ name: "Analyst", icon: BarChart2 }, { name: "Doctor", icon: Bot }, { name: "Storyteller", icon: MessageSquareText }]
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-[#a69a7c] font-headline font-extrabold text-3xl mb-8">Good morning, Thierry. Your Crews are ready.</h1>
      {crews.map(crew => <CrewCard key={crew.title} {...crew} />)}
    </div>
  );
}
