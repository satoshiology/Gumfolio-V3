import * as React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "./lib/utils";
import { TopAppBar, BottomNavBar } from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import SalesFeed from "./components/SalesFeed";
import Inventory from "./components/Inventory";
import Licenses from "./components/Licenses";
import Profile from "./components/Profile";
import DashAICenter from "./components/DashAICenter";
import SubscribersView from "./components/Subscribers";
import AIAgent from "./components/AIAgent";
import AgentConsole from "./components/AgentConsole";
import Splash from "./components/Splash";
import LandingPage from "./components/LandingPage";
import Settings from "./components/Settings";
import { gumroadService } from "./services/gumroadService";
import { Smartphone } from "lucide-react";
import { ChatProvider } from "./context/ChatContext";
import { StrategyProvider } from "./context/StrategyContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import { ConfirmationProvider } from "./context/ConfirmationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ConfirmationToast } from "./components/ConfirmationToast";
import { SidePanel } from "./components/SidePanel";
import { AgentWorkbench } from "./components/AgentWorkbench";
import { StrategyEchoChamber } from "./components/StrategyEchoChamber";
import { InstallPrompt } from "./components/InstallPrompt";

function MobileOnlyMessage() {
  return (
    <div className="fixed inset-0 bg-surface-dim flex items-center justify-center p-6 text-center z-[9999]">
      <div className="max-w-sm space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
          <Smartphone className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-on-surface">Mobile Only</h1>
        <p className="text-on-surface-variant text-lg">This platform is designed exclusively for mobile use. Please visit this app on your mobile device for the best experience.</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={location.pathname}
        initial={{ opacity: 0, x: 20, rotateY: 5 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -20, rotateY: -5 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dash-ai" replace />} />
          <Route path="/dash-ai" element={<DashAICenter />} />
          <Route path="/subscribers" element={<SubscribersView />} />
          <Route path="/sales" element={<SalesFeed />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/ai" element={<AIAgent />} />
          <Route path="/agent-console" element={<AgentConsole />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(!!gumroadService.getToken());
  const [leftPanel, setLeftPanel] = React.useState(false);
  const [rightPanel, setRightPanel] = React.useState(false);

  React.useEffect(() => {
    const isProTheme = localStorage.getItem('theme') === 'pro';
    const isActivated = localStorage.getItem('pro_activated') === 'true';
    if (isProTheme && isActivated) {
        document.body.classList.add('pro-theme');
    } else if (isProTheme && !isActivated) {
        // Fallback if somehow theme is set but not activated
        localStorage.setItem('theme', 'default');
        document.body.classList.remove('pro-theme');
    }
  }, []);

  if (!isAuthenticated) {
    return <LandingPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const gripUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGNDEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmlwLXZlcnRpY2FsLWljb24gbHVjaWRlLWdyaXAtdmVydGljYWwiPjxjaXJjbGUgY3g9IjkiIGN5PSIxMiIgcj0iMSIvPjxjaXJjbGUgY3g9IjkiIGN5PSI1IiByOSIxLz48Y2lyY2xlIGN4PSI5IiBjeT0iMTkiIHI9IjEiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSIxIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSI1IiByPSIxIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIxOSIgcj0iMSIvPjwvc3ZnPg==";

  return (
    <ThemeProvider>
      <ChatProvider>
        <StrategyProvider>
          <FeedbackProvider>
            <ConfirmationProvider>
              <Router>
                <div className="min-h-screen w-full bg-surface-dim font-body selection:bg-primary/30 relative">
                  <ConfirmationToast />
                  <div className="relative overflow-hidden min-h-screen w-full">
                    <SidePanel isOpen={leftPanel} onClose={() => setLeftPanel(false)} side="left">
                      <StrategyEchoChamber />
                    </SidePanel>
                    <SidePanel isOpen={rightPanel} onClose={() => setRightPanel(false)} side="right">
                      <AgentWorkbench />
                    </SidePanel>

                    <TopAppBar />
                    <main className="pt-24 pb-32 px-6 h-full overflow-y-auto">
                        <AnimatedRoutes />
                    </main>
                    <BottomNavBar />
                    <InstallPrompt />
                  </div>
                </div>
              </Router>
            </ConfirmationProvider>
          </FeedbackProvider>
        </StrategyProvider>
      </ChatProvider>
    </ThemeProvider>
  );
}
