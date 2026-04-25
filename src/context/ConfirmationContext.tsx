import * as React from "react";
import { actionConfirmationService } from "../services/ActionConfirmationService";

type PendingAction = { id: string, name: string, args: any[], resolve: (v: any) => void, reject: (e: any) => void };

export const ConfirmationContext = React.createContext<{
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
} | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null);

  React.useEffect(() => {
    actionConfirmationService.subscribe(setPendingAction);
  }, []);

  return (
    <ConfirmationContext.Provider value={{ pendingAction, setPendingAction }}>
      {children}
    </ConfirmationContext.Provider>
  );
};
