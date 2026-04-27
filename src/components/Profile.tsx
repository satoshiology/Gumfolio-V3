import * as React from "react";
import { TrendingUp, ExternalLink, Link as LinkIcon, Copy, Edit3, Loader2, AlertCircle, DollarSign, Clock } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { hapticFeedback, playSound } from "../lib/audio";
import { gumroadService } from "../services/gumroadService";
import { User, Product, Payout } from "../types";

export default function Profile() {
  const [user, setUser] = React.useState<User | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [payouts, setPayouts] = React.useState<Payout[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, productsRes, payoutsRes] = await Promise.all([
          gumroadService.getUser(),
          gumroadService.getProducts(),
          gumroadService.getPayouts()
        ]);
        setUser(userRes.user);
        setProducts(productsRes.products);
        setPayouts(payoutsRes.payouts || []);
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
        setError(err.response?.data?.error || "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalAudience = products.reduce((acc, p) => acc + p.sales_count, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-xs">Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-10 pb-24"
    >
      <section className="relative space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
            <div className="relative w-32 h-32 rounded-full p-1 bg-primary" style={{ boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface-dim">
                <img 
                  className="w-full h-full object-cover" 
                  src={user.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`} 
                  referrerPolicy="no-referrer"
                  alt={user.name || "User"}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">{user.name || "Unnamed Creator"}</h1>
            <p className="font-label text-sm uppercase tracking-widest text-primary font-semibold">Artist</p>
          </div>
          <div className="max-w-md">
            <p className="text-on-surface-variant leading-relaxed font-body">
              {user.bio || "No bio provided."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container/40 backdrop-blur-xl rounded-xl p-6 border border-white/5 flex flex-col justify-between h-40">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Total Fans</span>
          <div>
            <div className="text-4xl font-headline font-bold text-on-surface">{totalAudience.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-secondary text-xs font-label">
              <TrendingUp className="w-4 h-4" />
              <span>Total sales</span>
            </div>
          </div>
        </div>
        <a 
          href={user.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => {
            playSound('button');
            hapticFeedback('light');
          }}
          className={cn("bg-surface-container/40 backdrop-blur-xl rounded-xl p-6 border border-white/5 flex flex-col justify-between h-40 hover:bg-zinc-800/30 transition-all group", !user.url && "pointer-events-none opacity-50")}
        >
          <div className="flex justify-between items-start">
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">My Link</span>
            <ExternalLink className="w-4 h-4 text-on-surface-variant group-hover:text-secondary transition-colors" />
          </div>
          <div>
            <div className="text-xl font-headline font-bold text-on-surface break-all line-clamp-1">{user.url?.replace('https://', '') || "No URL"}</div>
            <p className="text-xs text-on-surface-variant font-body">Gumroad Profile</p>
          </div>
        </a>
      </section>
 
      <section className="space-y-4">
        <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant px-1">Your Links</h3>
        <div 
          className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => {
            if (user.url) {
                navigator.clipboard.writeText(user.url);
                playSound('success');
                hapticFeedback('medium');
            }
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-label font-bold text-on-surface">My Page Link</span>
              <span className="text-xs text-on-surface-variant">{user.url?.replace('https://', '') || "N/A"}</span>
            </div>
          </div>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant px-1">Money Sent to You</h3>
        <div className="space-y-3">
          {payouts.slice(0, 5).map((payout, i) => (
            <div key={payout.id || i} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  payout.status === 'paid' ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                )}>
                  {payout.status === 'paid' ? <DollarSign className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-label font-bold text-on-surface">
                    {payout.status === 'paid' ? 'Sent' : 'Waiting'}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-headline font-bold text-on-surface">
                  ${(parseInt(payout.amount) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                  {payout.payment_processor}
                </div>
              </div>
            </div>
          ))}
          {(payouts || []).length === 0 && (
            <div className="text-center py-8 text-on-surface-variant italic">
              No money sent yet.
            </div>
          )}
        </div>
      </section>

      <section className="pt-4">
        <a 
          href="https://gumroad.com/settings" 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => {
            playSound('button');
            hapticFeedback('medium');
          }}
          className="w-full bg-primary p-[1px] rounded-xl overflow-hidden group block" 
          style={{ boxShadow: '0 0 20px color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
        >
          <div className="w-full h-full bg-surface-dim rounded-[11px] py-4 flex items-center justify-center gap-2 group-hover:bg-transparent transition-all duration-500">
            <span className="text-sm font-label font-bold uppercase tracking-widest text-on-surface group-hover:text-black">Change My Profile</span>
            <Edit3 className="w-5 h-5 text-primary group-hover:text-black" />
          </div>
        </a>
      </section>
    </motion.div>
  );
}
