import * as React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center neuro-panel mx-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-on-surface-variant max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-primary text-black font-bold hover:scale-105 active:scale-95 transition-all"
          style={{ boxShadow: '0 0 15px color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
