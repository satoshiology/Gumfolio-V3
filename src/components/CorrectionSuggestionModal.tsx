import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { DriftAction } from "../hooks/useStrategicDrift";

interface CorrectionSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actions: DriftAction[];
  onConfirm: (actionId: string) => void;
}

export function CorrectionSuggestionModal({ isOpen, onClose, actions, onConfirm }: CorrectionSuggestionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Confirm Action</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-sm text-on-surface-variant">Select an action to address the strategic drift. These changes will not apply until confirmed.</p>

          <div className="space-y-3">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => onConfirm(action.id)}
                className="w-full text-left p-4 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high transition-colors border border-white/5"
              >
                <h4 className="font-bold text-primary">{action.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{action.description}</p>
              </button>
            ))}
          </div>

          <button onClick={onClose} className="w-full p-3 text-center text-sm font-bold text-on-surface-variant hover:underline">
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
