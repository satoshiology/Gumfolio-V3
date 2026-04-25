import * as React from "react";
import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { DriftAlert } from "../hooks/useStrategicDrift";
import { CorrectionSuggestionModal } from "./CorrectionSuggestionModal";
import { useFeedbackContext } from "../context/FeedbackContext";

interface DriftAlertDisplayProps {
  alerts: DriftAlert[];
}

export function DriftAlertDisplay({ alerts }: DriftAlertDisplayProps) {
  const [selectedAlert, setSelectedAlert] = React.useState<DriftAlert | null>(null);
  const { registerAction } = useFeedbackContext();

  if ((alerts || []).length === 0) return null;

  const handleConfirmAction = (actionId: string) => {
    registerAction(actionId);
    setSelectedAlert(null); // Close modal
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-zinc-950 border border-red-500/30 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-950/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">{alert.title}</h3>
              <p className="text-sm text-on-surface-variant font-medium">{alert.description}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedAlert(alert)}
            className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
          >
            Auto-Correction Suggestions <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
      <CorrectionSuggestionModal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          actions={selectedAlert?.suggestedActions || []}
          onConfirm={handleConfirmAction}
      />
    </div>
  );
}
