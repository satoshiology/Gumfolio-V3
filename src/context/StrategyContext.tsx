import * as React from "react";

export interface PinnedItem {
  id: string;
  content: string;
  createdAt: number;
  suggested?: boolean;
}

interface StrategyContextType {
  pinnedItems: PinnedItem[];
  pinItem: (content: string, suggested?: boolean) => void;
  unpinItem: (id: string) => void;
}

export const StrategyContext = React.createContext<StrategyContextType | undefined>(undefined);

export function StrategyProvider({ children }: { children: React.ReactNode }) {
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>([]);

  const pinItem = (content: string, suggested: boolean = false) => {
    if (!content || content.trim().length === 0) return;
    if (content.length > 2000) {
      console.warn("Pinned item too long, truncating.");
      content = content.substring(0, 2000);
    }
    setPinnedItems(prev => [...prev, { id: Date.now().toString(), content, createdAt: Date.now(), suggested }]);
  };

  const unpinItem = (id: string) => {
    setPinnedItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <StrategyContext.Provider value={{ pinnedItems, pinItem, unpinItem }}>
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategyContext() {
  const context = React.useContext(StrategyContext);
  if (!context) {
    throw new Error("useStrategyContext must be used within a StrategyProvider");
  }
  return context;
}
