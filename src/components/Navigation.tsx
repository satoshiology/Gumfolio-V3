import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Package, CreditCard, Key, User, Sparkles, Settings as SettingsIcon, Zap, Users, Send, X } from "lucide-react";
import { cn } from "../lib/utils";
import { playSound, hapticFeedback } from "../lib/audio";
import { gumroadService } from "../services/gumroadService";
import { User as UserType } from "../types";
import { useChatContext } from "../context/ChatContext";

export function TopAppBar() {
  const [user, setUser] = React.useState<UserType | null>(null);
  const [isPro, setIsPro] = React.useState(document.body.classList.contains('pro-theme'));

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await gumroadService.getUser();
        setUser(res.user);
      } catch (err) {
        console.error("Failed to fetch user for nav", err);
      }
    }
    fetchUser();

    const handleThemeChange = (e: any) => setIsPro(e.detail.isPro);
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-4">
        <Link to="/profile" className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-primary/20 shadow-lg shadow-primary/10">
            {user?.profile_picture_url ? (
              <img 
                src={user.profile_picture_url} 
                alt={user.name || "User Profile"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <User className="w-5 h-5 text-on-surface-variant" />
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-headline font-bold text-on-surface">{user?.name || "Admin"}</p>
            <p className="text-[10px] font-label text-primary uppercase tracking-widest">Verified</p>
          </div>
        </Link>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-auto">
        <button 
          onClick={() => window.open('https://pro.gumfolio.xyz', '_blank')}
          type="button" 
          className="btn-space"
        >
          <strong>UPGRADE</strong>
          <div id="container-stars">
            <div id="stars"></div>
          </div>
          <div id="glow">
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link 
          to="/settings" 
          onClick={() => {
            playSound('button');
            hapticFeedback('light');
          }}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors text-on-surface-variant hover:text-primary"
        >
          <SettingsIcon className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}

export function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendMessage, isLoading } = useChatContext();
  
  const [dashMode, setDashMode] = React.useState<'logo' | 'keyboard' | 'input'>('logo');
  const [inputText, setInputText] = React.useState("");

  React.useEffect(() => {
    // Reset if navigating completely away
    if (location.pathname !== "/dash-ai") {
      setDashMode('logo');
    }
  }, [location.pathname]);

  const navItems = [
    { icon: Package, label: "Products", path: "/inventory" },
    { icon: CreditCard, label: "Sales", path: "/sales" },
    { icon: Sparkles, label: "", path: "/dash-ai", isSpecial: true },
    { icon: Users, label: "Fans", path: "/subscribers" },
    { icon: Key, label: "Licenses", path: "/licenses" },
  ];

  const KEYBOARD_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWtleWJvYXJkLWljb24gbHVjaWRlLWtleWJvYXJkIj48cGF0aCBkPSJNMTAgOGguMDEiLz48cGF0aCBkPSJNMTIgMTJoLjAxIi8+PHBhdGggZD0iTTE0IDhoLjAxIi8+PHBhdGggZD0iTTE2IDEyaC4wMSIvPjxwYXRoIGQ9Ik0xOCA4aC4wMSIvPjxwYXRoIGQ9Ik02IDhoLjAxIi8+PHBhdGggZD0iTTcgMTZoMTAiLz48cGF0aCBkPSJNOCAxMmguMDEiLz48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTYiIHg9IjIiIHk9IjQiIHJ4PSIyIi8+PC9zdmc+";
  const LOGO_SRC = "https://subpagebucket.s3.eu-north-1.amazonaws.com/library/934/7f7e89a4-95ff-4e7f-b5d8-82325118dded.png";

  const handleAISend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    setDashMode('keyboard');
    navigate("/dash-ai");
    await sendMessage(text);
  };

  return (
    <div className="fixed bottom-0 w-full z-50">
      <AnimatePresence>
        {dashMode === 'input' && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 w-full p-4 bg-zinc-950/95 backdrop-blur-3xl border-t border-white/10 shadow-[0_-10px_40px_var(--color-primary)] rounded-t-[1.5rem] z-50 flex items-center gap-2 h-full"
            style={{ boxShadow: '0 -10px 40px color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
          >
            <button 
              onClick={() => {
                setDashMode('keyboard');
                playSound('button');
                hapticFeedback('light');
              }}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <input 
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISend()}
              placeholder="Message AI Assistant..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
            />
            <button 
              onClick={() => {
                handleAISend();
                playSound('success');
                hapticFeedback('medium');
              }}
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
               <Send className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav 
        className="w-full flex justify-around items-center px-4 pb-6 pt-2 bg-zinc-950/60 backdrop-blur-2xl rounded-t-[1.5rem] border-t border-white/5"
        style={{ boxShadow: '0 -10px 40px color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
      >
        {navItems.map((item: any) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => {
                playSound('tab');
                hapticFeedback('light');
                if (item.isSpecial) {
                  if (location.pathname !== '/dash-ai') {
                    navigate('/dash-ai');
                  }
                  // If clicking the active special tab, we toggle the input
                  if (location.pathname === '/dash-ai') {
                    setDashMode(dashMode === 'input' ? 'keyboard' : 'input');
                  } else {
                    setDashMode('input');
                  }
                } else {
                  setDashMode('logo');
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center p-3 transition-all duration-300 ease-out relative",
                isActive 
                  ? "text-primary scale-110" 
                  : "text-zinc-500 hover:text-primary/60",
                item.isSpecial && "mx-2"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  style={{ boxShadow: '0 0 15px color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
                />
              )}
              {item.isSpecial ? (
                <div className="ai-space-btn">
                  <img 
                    src={(isActive || dashMode === 'keyboard' || dashMode === 'input') ? KEYBOARD_SVG : LOGO_SRC} 
                    alt="DASH Mode" 
                    className={cn("w-8 h-8 object-contain brightness-0 invert transition-all", (isActive || dashMode === 'keyboard') && "opacity-90")}
                    referrerPolicy="no-referrer"
                  />
                  <div className="container-stars">
                    <div className="stars"></div>
                  </div>
                  <div className="glow">
                    <div className="circle"></div>
                    <div className="circle"></div>
                  </div>
                </div>
              ) : (
                <item.icon className="w-6 h-6" />
              )}
              <span className="font-label text-[10px] uppercase tracking-widest mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
