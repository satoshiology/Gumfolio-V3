import * as React from "react";
import { useStrategyContext } from "../context/StrategyContext";
import { Product, Sale } from "../types";

export interface DriftAction {
  id: string;
  title: string;
  description: string;
}

export interface DriftAlert {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  suggestedActions: DriftAction[];
}

export function useStrategicDrift(products: Product[], sales: Sale[]) {
  const { pinnedItems } = useStrategyContext();
  const [alerts, setAlerts] = React.useState<DriftAlert[]>([]);

  React.useEffect(() => {
    if (pinnedItems.length === 0 || sales.length === 0) return;

    const newAlerts: DriftAlert[] = [];
    const totalRevenue = (products || []).reduce((acc, p) => acc + ((p?.sales_usd_cents || 0) / 100), 0);
    
    // Simple Heuristic: Look for "increase" or "growth" in pinned items
    const relevantPinned = pinnedItems.filter(item => 
        item.content.toLowerCase().includes("growth") || 
        item.content.toLowerCase().includes("increase")
    );

    if (relevantPinned.length > 0 && totalRevenue < 1000) {
        newAlerts.push({
            title: "Growth Goal Deviation",
            description: "Your strategic goals prioritize growth, but current revenue pace is below target thresholds.",
            severity: "medium",
            suggestedActions: [
                { id: "price_adj", title: "Enable Upsell Automation", description: "Automatically trigger upsells for your top 3 products to lift average order value." },
                { id: "discount_run", title: "Run 24h Flash Sale", description: "Draft a 15% discount campaign for your underperforming products to boost velocity." }
            ]
        });
    }

    setAlerts(newAlerts);
  }, [pinnedItems, products, sales]);

  return alerts;
}
