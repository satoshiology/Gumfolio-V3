import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  side: "left" | "right";
  children: React.ReactNode;
}

export function SidePanel({ isOpen, onClose, side, children }: SidePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: side === "left" ? "-100%" : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: side === "left" ? "-100%" : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col pt-12"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 z-[110]"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/30">
                AGENTIC AI COMING SOON...
              </span>
            </div>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
