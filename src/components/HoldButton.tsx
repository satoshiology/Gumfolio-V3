import * as React from "react";
import { cn } from "../lib/utils";

export function HoldButton({ onComplete, children, className, actionText, disabled }: any) {
  const [progress, setProgress] = React.useState(0);
  const [isHolding, setIsHolding] = React.useState(false);
  const requestRef = React.useRef<number | undefined>(undefined);
  const startTimeRef = React.useRef<number | undefined>(undefined);

  const duration = 5000; // 5 seconds

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const currentProgress = Math.min((elapsed / duration) * 100, 100);
    setProgress(currentProgress);

    if (currentProgress < 100) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsHolding(false);
      onComplete();
    }
  };

  const startHold = () => {
    if (disabled) return;
    setIsHolding(true);
    startTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(animate);
  };

  const stopHold = () => {
    if (disabled) return;
    setIsHolding(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setProgress(0);
  };

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      disabled={disabled}
      className={cn("relative overflow-hidden select-none disabled:opacity-50", className)}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 bg-black/20 z-0" 
        style={{ width: `${progress}%`, transition: isHolding ? 'none' : 'width 0.2s' }} 
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isHolding && progress < 100 ? `Hold to ${actionText}...` : children}
      </span>
    </button>
  );
}
