import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { gumroadService } from "../services/gumroadService";

interface SplashProps {
  onAuthenticated: () => void;
}

export default function Splash({ onAuthenticated }: SplashProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (gumroadService.getToken()) {
      onAuthenticated();
    }

    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.token) {
        gumroadService.setToken(event.data.token);
        onAuthenticated();
      }
    };
    window.addEventListener('message', handleMessage);

    // Listen for localStorage changes from the popup
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'gumroad_access_token' && event.newValue) {
        onAuthenticated();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Polling fallback in case cross-window events are blocked by the browser
    const interval = setInterval(() => {
      if (gumroadService.getToken()) {
        onAuthenticated();
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [onAuthenticated]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Fetch the OAuth URL from your server
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      // 2. Open the OAuth PROVIDER's URL directly in popup
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dim flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 noise-overlay"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card p-12 rounded-xxl max-w-md w-full text-center relative z-10"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl overflow-hidden flex items-center justify-center" style={{ boxShadow: '0 0 40px color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
          <img 
            src="https://subpagebucket.s3.eu-north-1.amazonaws.com/library/934/7f7e89a4-95ff-4e7f-b5d8-82325118dded.png" 
            alt="Gumfolio Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h1 className="text-4xl font-headline font-bold mb-4 neon-text-glow">Gumfolio</h1>
        <p className="text-on-surface-variant font-body mb-10 text-lg">
          High-end editorial analytics for digital creators.
        </p>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full py-4 px-6 rounded-xl bg-on-surface text-surface-dim font-label font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isConnecting ? (
            <div className="w-6 h-6 border-3 border-surface-dim/30 border-t-surface-dim rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              Sign in with Gumroad
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
