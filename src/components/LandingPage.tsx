import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { gumroadService } from "../services/gumroadService";
import { 
  Zap, 
  Bot, 
  ArrowRight,
  CheckCircle2,
  Cpu,
  Loader2,
  Key,
  LayoutDashboard,
  ToggleLeft,
  Settings,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { cn } from "../lib/utils";

interface LandingPageProps {
  onAuthenticated: () => void;
}

export default function LandingPage({ onAuthenticated }: LandingPageProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (gumroadService.getToken()) {
      onAuthenticated();
    }

    const handleMessage = (event: MessageEvent) => {
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

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'gumroad_access_token' && event.newValue) {
        onAuthenticated();
      }
    };
    window.addEventListener('storage', handleStorage);

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
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

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
    <div className="min-h-screen bg-surface-dim text-on-surface font-body overflow-x-hidden selection:bg-primary/30">
      {/* Background Grid & Glows */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tighter">Gumfolio</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-label font-medium hover:text-primary transition-colors">Features</a>
          <a href="#ai" className="text-sm font-label font-medium hover:text-primary transition-colors">AI Intelligence</a>
          <a href="#pricing" className="text-sm font-label font-medium hover:text-primary transition-colors">Pricing</a>
        </div>
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-5 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-primary transition-all disabled:opacity-50"
        >
          {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-8">
              <Sparkles className="w-3 h-3" />
              The Control Panel Gumroad Forgot to Build
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-6 leading-[1.1]">
              The simple control panel <span className="text-primary italic">Gumroad</span> should have built.
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 font-body leading-relaxed">
              Tired of digging through confusing menus just to manage your products? 
              <br className="hidden md:block" />
              <span className="text-white font-semibold">Gumfolio</span> makes the annoying stuff fast and painless.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-black font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Get Started – $9/month <ArrowRight className="w-5 h-5" /></>}
              </button>
              <div className="text-on-surface-variant text-sm font-medium">
                7-day free trial. Cancel anytime.
              </div>
            </div>
          </motion.div>

          {/* Hero Visual: Mock Control Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[500px]"
          >
            <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0c0d10]/80">
              <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 text-center text-[10px] text-on-surface-variant font-mono tracking-widest uppercase opacity-50">
                  app.gumfolio.com / dashboard
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Product Mock */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-primary">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Pro Landing Kit</div>
                      <div className="text-xs text-on-surface-variant">124 Licenses Active</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-2 py-1 border border-white/5">
                      <button className="text-on-surface-variant hover:text-white"><MinusCircle className="w-4 h-4" /></button>
                      <span className="text-xs font-mono font-bold text-primary">124</span>
                      <button className="text-on-surface-variant hover:text-white"><PlusCircle className="w-4 h-4" /></button>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-primary/20 border border-primary/50 relative flex items-center px-1">
                       <div className="w-3 h-3 rounded-full bg-primary ml-auto"></div>
                    </div>
                  </div>
                </div>
                {/* Another Product Mock */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-on-surface-variant">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Mobile UI Kit</div>
                      <div className="text-xs text-on-surface-variant">Unpublished</div>
                    </div>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-zinc-800 border border-white/10 relative flex items-center px-1">
                     <div className="w-3 h-3 rounded-full bg-on-surface-variant"></div>
                  </div>
                </div>
                {/* Mini Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Recent Sales", value: "$1,240", icon: <TrendingUpIcon className="w-4 h-4 text-green-400" /> },
                    { label: "Active Licenses", value: "842", icon: <Key className="w-4 h-4 text-blue-400" /> }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{stat.label}</span>
                        {stat.icon}
                      </div>
                      <div className="text-xl font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decors */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Core Features: The Annoying Stuff Made Painless */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 bg-surface-container/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4">The Annoying Stuff Made Painless</h2>
          <p className="text-on-surface-variant">Everything you need to stop wasting time on Gumroad administration.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Key className="w-7 h-7" />}
            title="License Control"
            description="Instantly increase or decrease license key usage — no more API headaches or digging into customer records."
          />
          <FeatureCard 
            icon={<ToggleLeft className="w-7 h-7" />}
            title="One-Click Status"
            description="One-click publish or unpublish any product. Control your entire inventory from a single, unified interface."
          />
          <FeatureCard 
            icon={<LayoutDashboard className="w-7 h-7" />}
            title="Clean Dashboard"
            description="All your licenses and recent sales in one place. No clutter, just the data you need to run your business."
          />
        </div>
      </section>

      {/* AI Strategist Section */}
      <section id="ai" className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
              A built-in AI Strategist <br />
              <span className="text-primary italic">that actually gets it.</span>
            </h2>
            <p className="text-on-surface-variant text-lg">
              Gumfolio isn't just a UI—it's a brain. Our Agentic AI doesn't just chat; it executes strategy across your entire store.
            </p>
            
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4 hover:border-primary/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <TrendingUpIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">AI Strategist</h4>
                  <p className="text-sm text-on-surface-variant">Analyzes sales patterns and historical data to recommend price adjustments and bundle strategies during peak hours.</p>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4 hover:border-secondary/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 group-hover:text-secondary transition-colors">Autonomous Growth Agent</h4>
                  <p className="text-sm text-on-surface-variant">Optionally manages your SEO tags and license key batches 24/7, ensuring your store is always optimized for discovery and fulfillment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="glass-card rounded-2xl border border-white/10 shadow-2xl p-8 bg-[#0c0d10]/80">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-on-surface-variant">Strategist Thinking Mode</span>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold">ME</div>
                  <div className="bg-zinc-900 p-3 rounded-2xl rounded-tl-none border border-white/5 text-xs text-on-surface-variant">
                    "Why did sales for 'UI Pack' dip yesterday?"
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">AI</div>
                  <div className="bg-primary/5 p-4 rounded-2xl rounded-tr-none border border-primary/20 text-xs leading-relaxed space-y-3">
                    <div>
                      I've analyzed the logs. Traffic remained constant but <strong>conversion dropped by 12%</strong>.
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
                       <p className="font-bold text-[10px] text-primary uppercase tracking-widest">Recommended Action</p>
                       <p>Create a $5 'Early Bird' discount for the first 50 licenses of the new version.</p>
                       <button className="text-primary font-bold hover:underline flex items-center gap-1">Execute Strategy <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decor */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 blur-[80px] rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4">Choose Your Pace</h2>
          <p className="text-on-surface-variant text-lg">Stop wasting time, start growing faster.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter */}
          <div className="glass-card p-10 rounded-3xl border border-white/10 flex flex-col hover:border-primary/30 transition-all">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-headline font-bold">$9</span>
              <span className="text-on-surface-variant text-sm">/month</span>
            </div>
            <p className="text-on-surface-variant text-sm mb-8">Everything you need to stop wasting time on Gumroad administration.</p>
            <ul className="space-y-4 mb-10 flex-1">
              {["Master Control Panel", "License Key Management", "One-Click Publishing", "Basic Analytics"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleConnect} className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-primary transition-all">
              Start Starter Plan
            </button>
          </div>

          {/* Pro */}
          <div className="glass-card p-10 rounded-3xl border-2 border-primary/30 bg-primary/5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-headline font-bold">$19</span>
              <span className="text-on-surface-variant text-sm">/month</span>
            </div>
            <p className="text-on-surface-variant text-sm mb-8">Advanced features + priority support for serious creators.</p>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Everything in Starter",
                "Built-in AI Strategist",
                "Autonomous Growth Agent",
                "Priority Support",
                "Custom Themes"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleConnect} className="w-full py-4 rounded-xl bg-primary text-black font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
              Get Pro Access
            </button>
          </div>
        </div>
        <div className="mt-12 text-center text-on-surface-variant text-sm space-y-2">
           <p>7-day free trial. 30-day money-back guarantee.</p>
           <p className="opacity-50 italic">Secure OAuth connection to your Gumroad account.</p>
        </div>
      </section>

      {/* Footer Final CTA */}
      <footer className="py-32 px-6 text-center border-t border-white/5 relative bg-black/40">
        <div className="max-w-2xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-7xl font-headline font-bold tracking-tight">Ready to make managing easy?</h2>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto px-12 py-6 rounded-full bg-primary text-black font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            {isConnecting ? <Loader2 className="w-8 h-8 animate-spin" /> : "Get Started – $9/month"}
          </button>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase font-mono tracking-widest">Secure OAuth</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase font-mono tracking-widest">Gumroad Partner API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-surface-container/20 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:border-primary/20 hover:bg-surface-container/40 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

