import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { gumroadService } from "../services/gumroadService";
import { 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Bot, 
  TrendingUp, 
  Smartphone, 
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart3,
  Loader2
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
      {/* Background Effects */}
      <div className="fixed inset-0 noise-overlay opacity-5 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" style={{ boxShadow: '0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
            <img 
              src="https://subpagebucket.s3.eu-north-1.amazonaws.com/library/934/7f7e89a4-95ff-4e7f-b5d8-82325118dded.png" 
              alt="Gumfolio Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-2xl font-headline font-bold tracking-tighter neon-text-glow">Gumfolio</span>
        </div>
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-6 py-2 rounded-full bg-surface-container-highest border border-white/10 text-sm font-label font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
        >
          {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-6">
            The Only Dedicated 3rd Party App for Gumroad
          </span>
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter mb-8 leading-[0.9]">
            Effortless <br />
            <span className="text-primary italic">Gumroad</span> Management.
          </h1>
          <p className="text-on-surface-variant text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-body leading-relaxed">
            Stop wrestling with complex dashboards. Gumfolio brings your entire business into a high-performance, mobile-first interface powered by Agentic AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-primary text-black font-label font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border-none"
              style={{ boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 40%, transparent)' }}
            >
              {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Get Started Now <ArrowRight className="w-5 h-5" /></>}
            </button>
            <a href="#features" className="text-on-surface-variant hover:text-white transition-colors font-label font-bold uppercase tracking-widest text-sm">
              Explore Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* AI Agent Showcase */}
      <section className="relative z-10 py-32 px-6 bg-surface-container-lowest/50 border-y border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="w-10 h-10" />
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              Your Business, <br />
              <span className="text-primary">AI-Optimized.</span>
            </h2>
            <p className="text-on-surface-variant text-lg font-body leading-relaxed">
              Meet your new Agentic AI business manager. Gumfolio doesn't just show data—it understands it. Ask questions, predict sales trends, and automate repetitive tasks with natural language.
            </p>
            <ul className="space-y-4">
              {[
                "Predictive Sales Analytics",
                "Automated Customer Support Drafts",
                "Inventory Trend Detection",
                "Natural Language Business Queries"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-on-surface font-label font-semibold">
                  <Cpu className="w-5 h-5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-auto text-[10px] font-label text-zinc-500 uppercase tracking-widest">AI Agent Active</span>
              </div>
              <div className="space-y-6">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-primary font-label uppercase tracking-widest mb-2">User Query</p>
                  <p className="text-sm text-on-surface italic">"How are my digital assets performing compared to last month?"</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <p className="text-xs text-primary font-label uppercase tracking-widest mb-2">AI Response</p>
                  <p className="text-sm text-on-surface leading-relaxed">
                    Your digital assets are up <span className="text-primary font-bold">24%</span> in volume. However, your conversion rate on "Pro Design Pack" has dipped by 5%. I recommend updating the thumbnail to improve CTR.
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 blur-3xl rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">Built for High-Performance Creators</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">The only 3rd party application designed from the ground up to make Gumroad management effortless.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Instant Actions"
            description="Refund sales, resend receipts, and mark physical products as shipped with a single tap. No more digging through menus."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-8 h-8" />}
            title="Advanced Analytics"
            description="Get editorial-grade insights into your sales velocity, revenue trends, and customer behavior."
          />
          <FeatureCard 
            icon={<Smartphone className="w-8 h-8" />}
            title="Mobile First"
            description="Designed exclusively for mobile. Manage your entire empire from the palm of your hand, anywhere in the world."
          />
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 py-32 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-4xl md:text-5xl font-headline font-bold">The Industry Standard</h2>
          <p className="text-xl text-on-surface-variant leading-relaxed">
            Gumfolio is the only dedicated 3rd party app on the market. We don't just add features; we redefine how you interact with your Gumroad business.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-headline font-bold text-on-surface">100%</div>
              <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Secure OAuth</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-headline font-bold text-on-surface">24/7</div>
              <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant">AI Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-headline font-bold text-on-surface">1-Tap</div>
              <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Management</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 py-32 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-headline font-bold mb-10">Ready to Scale?</h2>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto px-12 py-6 rounded-full bg-on-surface text-surface-dim font-label font-bold text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isConnecting ? <Loader2 className="w-8 h-8 animate-spin" /> : "Sign in with Gumroad"}
          </button>
          <p className="mt-8 text-on-surface-variant font-label text-xs uppercase tracking-widest">
            Join the elite circle of digital creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-surface-container/40 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-headline font-bold mb-4 text-on-surface">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed font-body">{description}</p>
    </div>
  );
}
