import * as React from "react";
import { useFeedbackContext } from "../context/FeedbackContext";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, CheckCircle } from "lucide-react";

export function ImpactReportDisplay() {
  const { history } = useFeedbackContext();

  if ((history || []).length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Recent Strategic Impacts</h3>
      {history.map((h, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-950/80 border border-primary/20 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
             </div>
             <div>
                <p className="text-sm font-bold text-on-surface">Action Applied: {h.actionId}</p>
                <p className="text-xs text-on-surface-variant font-mono">Impact: Optimization in progress...</p>
             </div>
          </div>
          <BarChart3 className="w-5 h-5 text-primary/50" />
        </motion.div>
      ))}
    </div>
  );
}
