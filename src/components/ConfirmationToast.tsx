import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmationContext } from "../context/ConfirmationContext";
import { AlertTriangle, Check, X } from "lucide-react";

export const ConfirmationToast: React.FC = () => {
  const context = React.useContext(ConfirmationContext);
  if (!context) return null;
  const { pendingAction, setPendingAction } = context;

  if (!pendingAction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 z-[9999] bg-zinc-950/95 p-4 rounded-xl shadow-xl border border-primary/40 flex flex-col gap-3"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-on-surface font-semibold">Approval Required</h3>
            <p className="text-on-surface-variant text-sm">
              The AI agent is requesting approval to perform a high-impact action: <strong>{pendingAction.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              pendingAction.reject(new Error("User denied confirmation"));
              setPendingAction(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-dim rounded-lg"
          >
            <X className="w-4 h-4" /> Deny
          </button>
          <button
            onClick={() => {
              pendingAction.resolve(true); // Assuming action execution is handle by caller elsewhere or inside result? Wait, registry handles execution.
              setPendingAction(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-on-primary rounded-lg"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
