import React from "react";
import { motion } from "motion/react";
import { LogOut, Settings as SettingsIcon, ChevronRight, User, History, Sparkles, Lock, Sun, Moon, Monitor } from "lucide-react";
import { gumroadService } from "../services/gumroadService";
import { useNavigate } from "react-router-dom";
import { playSound, hapticFeedback } from "../lib/audio";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isActivated, setIsActivated] = React.useState(localStorage.getItem('pro_activated') === 'true');
  const [isThemePro, setIsThemePro] = React.useState(document.body.classList.contains('pro-theme'));
  const [showLicenseModal, setShowLicenseModal] = React.useState(false);
  const [licenseKey, setLicenseKey] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  
  const PRO_PRODUCT_ID = "lTlApI5Eg1p01aTMXcRMqg==";

  const toggleProTheme = () => {
    const pro = !isThemePro;
    setIsThemePro(pro);
    if (pro) {
      document.body.classList.add('pro-theme');
      localStorage.setItem('theme', 'pro');
      playSound('premium_activate');
      hapticFeedback('heavy');
    } else {
      document.body.classList.remove('pro-theme');
      localStorage.setItem('theme', 'default');
      playSound('button');
      hapticFeedback('medium');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    playSound('switch');
    hapticFeedback('light');
  };

  const verifyLicense = async () => {
    setIsVerifying(true);
    try {
        const response = await gumroadService.verifyLicense(PRO_PRODUCT_ID, licenseKey, false);
        if (response.success) {
            setIsActivated(true);
            localStorage.setItem('pro_activated', 'true');
            alert("Pro activated!");
            setShowLicenseModal(false);
            
            // Auto-enable theme on activation
            if (!isThemePro) {
              document.body.classList.add('pro-theme');
              localStorage.setItem('theme', 'pro');
              setIsThemePro(true);
            }
            
            window.dispatchEvent(new CustomEvent('proStatusChange', { detail: { isActivated: true } }));
        } else {
            console.error("Gumroad License Verify Error:", response);
            alert("Wait, that code is wrong");
        }
    } catch (error) {
        console.error("Gumroad License Verify Error (Exception):", error);
        alert("Verification failed. Please check your key");
    } finally {
        setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    gumroadService.clearToken();
    window.location.href = "/";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-xl font-bold text-primary font-headline tracking-tight">
             Gumfolio
           </h1>
           <h2 className="text-3xl font-headline font-bold text-on-surface">Settings</h2>
        </div>
        <p className="text-on-surface-variant text-sm">Manage your account and preferences.</p>
      </header>

      <div className="space-y-4">
        {!isActivated ? (
          <button 
            onClick={() => {
              setShowLicenseModal(true);
              playSound('button');
              hapticFeedback('medium');
            }} 
            className="w-full relative glass-card rounded-2xl p-4 text-center font-bold text-primary hover:bg-primary/10 transition-colors animate-pulse shadow-[0_0_15px_rgba(0,224,255,0.2)] border border-primary/30"
          >
            ACTIVATE PRO
          </button>
        ) : (
          <div className="w-full glass-card rounded-2xl p-4 text-center border border-[#00e0ff]/30 text-[#00e0ff] font-bold text-xs uppercase tracking-widest bg-[#00e0ff]/5">
            PRO LICENSE ACTIVE <span className="ml-2">✓</span>
          </div>
        )}

        {/* Monthly Usage Card */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 bg-surface-container/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg text-on-surface">Monthly Help Credits</h3>
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              isActivated ? "bg-primary text-black" : "bg-zinc-800 text-zinc-500"
            )}>
              {isActivated ? "PRO" : "FREE"}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-on-surface-variant font-mono">
              <span>Used this month</span>
              <span>{localStorage.getItem('monthly_chat_count') || 0} / {isActivated ? 20 : 10}</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, (parseInt(localStorage.getItem('monthly_chat_count') || '0') / (isActivated ? 20 : 10)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/60 italic">
              Limits reset monthly.
            </p>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 bg-surface-container/30 space-y-4">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-lg text-on-surface">Style</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleThemeChange(opt.id as any)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                   theme === opt.id 
                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,255,65,0.1)]" 
                    : "bg-surface-container-high border-white/5 opacity-60 hover:opacity-100"
                )}
              >
                <opt.icon className={cn("w-5 h-5", theme === opt.id ? "text-primary" : "text-on-surface-variant")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme === opt.id ? "text-primary" : "text-on-surface-variant")}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-on-surface-variant/60 italic px-1">
            Pick between dark mode, light mode, or use your phone's settings.
          </p>
        </div>

        {/* Luxury Pro Toggle Card */}
        <div className={cn(
          "rounded-3xl overflow-hidden transition-all duration-700 relative group cursor-pointer",
          isThemePro 
            ? "glass-card border border-[#a69a7c]/30" 
            : "glass-card border border-white/5"
        )} onClick={toggleProTheme}>
            {isThemePro && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#a69a7c]/10 via-[#a69a7c]/5 to-[#a69a7c]/10 animate-pulse pointer-events-none"></div>
            )}
            <div className="p-6 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg", 
                      isThemePro 
                        ? "bg-gradient-to-br from-[#c4ba9c] to-[#8c8166] text-black shadow-[#a69a7c]/30" 
                        : "bg-surface-container-highest text-primary border border-white/10"
                    )}
                  >
                    <Sparkles className={cn("w-6 h-6", isThemePro && "animate-pulse")} />
                  </div>
                  <div>
                    <h3 className={cn(
                        "font-bold text-lg transition-colors duration-500 font-headline flex items-center gap-2",
                        isThemePro ? "text-[#a69a7c]" : "text-on-surface"
                    )}>
                        Luxury Theme
                    </h3>
                    <p className="text-sm text-on-surface-variant transition-colors group-hover:text-[#a69a7c]/60">
                        {isThemePro ? "Gold colors are on" : "Turn on the gold colors (Free)"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                    "w-16 h-8 rounded-full p-1 transition-all duration-500 flex items-center shadow-inner relative overflow-hidden", 
                    isThemePro 
                        ? "bg-[#a69a7c]/20 border border-[#a69a7c]/50 justify-end" 
                        : "bg-black/50 border border-white/10 justify-start"
                )}>
                    {isThemePro && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a69a7c]/20 to-transparent w-[200%] animate-[scan_2s_linear_infinite]"></div>}
                    <div className={cn(
                        "w-6 h-6 rounded-full shadow-md transition-all duration-500 z-10 relative",
                        isThemePro ? "bg-gradient-to-br from-[#e1dccc] to-[#a69a7c]" : "bg-white/70"
                    )}></div>
                </div>
            </div>
            
            <style>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(50%); }
                }
            `}</style>
        </div>
        
        {showLicenseModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowLicenseModal(false)}>
                <div className="glass-card w-full max-w-sm rounded-[2rem] p-8 space-y-6" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Enter your Code</h3>
                    <p className="text-sm text-on-surface-variant">
                      Need a code? To upgrade tap <a href="https://pro.gumfolio.xyz" target="_blank" className="text-[#a69a7c] underline underline-offset-4">here</a>.
                    </p>
                    <input 
                        value={licenseKey} 
                        onChange={e => setLicenseKey(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="w-full bg-surface-container-high rounded-xl p-4 text-on-surface border border-white/10"
                    />
                    <div className="flex gap-4">
                        <button onClick={() => {
                            setShowLicenseModal(false);
                            playSound('button');
                            hapticFeedback('light');
                        }} className="flex-1 p-3 rounded-xl bg-red-500/20 text-red-400">Cancel</button>
                        <button onClick={() => {
                            verifyLicense();
                            playSound('success');
                            hapticFeedback('medium');
                        }} disabled={isVerifying} className="flex-1 p-3 rounded-xl bg-[#a69a7c] text-black">
                            {isVerifying ? "Checking..." : "Unlock"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="glass-card rounded-3xl overflow-hidden neuro-panel">
          <div onClick={() => {
            navigate("/profile");
            playSound('button');
            hapticFeedback('light');
          }} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">My Account</h3>
                <p className="text-xs text-on-surface-variant">Manage your profile</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden mt-8">
          <button 
            onClick={() => {
              handleLogout();
              playSound('button');
              hapticFeedback('medium');
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-red-400">Log Out</h3>
                <p className="text-xs text-red-400/70">Sign out of your Gumroad account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
