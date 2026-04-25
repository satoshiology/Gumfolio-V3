import * as React from "react";

export interface CorrectionAction {
  id: string;
  actionId: string;
  timestamp: number;
}

interface FeedbackContextType {
  history: CorrectionAction[];
  registerAction: (actionId: string) => void;
}

export const FeedbackContext = React.createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = React.useState<CorrectionAction[]>([]);

  const registerAction = (actionId: string) => {
    setHistory(prev => [...prev, { id: Date.now().toString(), actionId, timestamp: Date.now() }]);
  };

  return (
    <FeedbackContext.Provider value={{ history, registerAction }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedbackContext() {
  const context = React.useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedbackContext must be used within a FeedbackProvider");
  }
  return context;
}
