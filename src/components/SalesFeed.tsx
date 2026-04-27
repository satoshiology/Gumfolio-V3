import * as React from "react";
import { ShoppingBag, Sparkles, Palette, ArrowDown, Loader2, AlertCircle, CheckCircle, Search, RefreshCw, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatPrice } from "../lib/utils";
import { gumroadService } from "../services/gumroadService";
import { ActionRegistry } from "../services/ActionRegistry";
import { Sale } from "../types";
import { HoldButton } from "./HoldButton";
import { EmptyState } from "./EmptyState";
import { usePro } from "../hooks/usePro";

export default function SalesFeed() {
  const isPro = usePro();
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{name: string, fn: () => Promise<any>} | null>(null);

  const fetchSales = React.useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const res = await gumroadService.getSales();
      setSales(res.sales);
    } catch (err: any) {
      console.error("Sales Fetch Error:", err);
      setError(err.response?.data?.error || "Failed to fetch sales feed.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setConfirmAction(null);
    setLoadingAction(actionName);
    setError(null);
    setSuccessMsg(null);
    try {
      await actionFn();
      setSuccessMsg(`Successfully performed: ${actionName}`);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to perform ${actionName}.`);
    } finally {
      setLoadingAction(null);
    }
  };

  const todayRevenueFormatted = formatPrice(sales
    .filter(s => new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.price, 0), 'USD');

  const filteredSales = sales.filter(s => 
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lastHourSales = sales.filter(s => {
    const saleDate = new Date(s.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 1;
  }).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-xs">Looking at your sales...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Global Search */}
      <section className="px-2">
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative w-full shadow-2xl">
              <Search className="absolute left-4 top-4 w-6 h-6 text-zinc-500" />
              <input 
                  type="text" 
                  placeholder={"Search all sales by product or email..."} 
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 pl-14 text-lg focus:border-primary transition-colors outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-2">Live Activity</p>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight">Recent Sales</h2>
          </div>
          <button 
            onClick={() => fetchSales(false)}
            disabled={isRefreshing}
            className={cn(
              "p-3 rounded-2xl bg-surface-container/60 border border-white/10 text-on-surface-variant hover:text-primary transition-all active:scale-95 group",
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
            title="Refresh Feed"
          >
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <StatCard label="Money Made Today" value={todayRevenueFormatted} subValue="Real-time tracking active" color="text-secondary" />
          <StatCard label="Total Sales" value={sales.length.toLocaleString()} subValue="Lifetime sales" color="text-on-surface" />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="font-label text-sm font-semibold text-on-surface-variant">Recent Sales</h3>
          <span className="text-[10px] font-label text-zinc-500 uppercase tracking-widest">Auto-updating</span>
        </div>
        
        {filteredSales.map((sale) => (
          <TransactionItem 
            key={sale.id}
            sale={sale}
            onAction={setConfirmAction}
          />
        ))}

        {filteredSales.length === 0 && !error && (
            <EmptyState 
            icon={ShoppingBag}
            title="No Transactions Found"
            description="It looks like there are no sales matching your search. Try adjusting the keywords or clear the filter to see all activity."
            />
        )}
      </section>

      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-surface-container border border-white/10 rounded-3xl p-6 text-center"
            >
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="font-headline text-xl font-bold mb-2">Confirm Action</h3>
              <p className="text-sm text-on-surface-variant mb-8">
                You are about to perform: <strong className="text-on-surface">{confirmAction.name}</strong>.
              </p>
              
              <HoldButton 
                actionText="confirm"
                onComplete={() => handleAction(confirmAction.name, confirmAction.fn)}
                className="w-full py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-lg hover:bg-red-500/30 transition-colors"
              >
                Hold 3s to Confirm
              </HoldButton>

              <button 
                onClick={() => setConfirmAction(null)}
                className="mt-4 text-sm font-label uppercase tracking-widest text-zinc-500 hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex justify-center">
        <button className="text-xs font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2">
          View All History
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, subValue, color }: any) {
  return (
    <div className="bg-surface-container/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay pointer-events-none"></div>
      <div className="relative z-10">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</span>
        <div className={cn("text-3xl font-headline font-bold mt-1", color)}>{value}</div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-on-surface-variant/80">{subValue}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ sale, onAction }: any) {
  const isPro = usePro();
  const { 
    id, product_name, email, created_at, price, currency_symbol, refunded, partiallyRefunded, 
    is_product_physical, shipped 
  } = sale;
  const time = new Date(created_at).toLocaleString();
  const formattedPrice = formatPrice(price, currency_symbol || 'USD');

  return (
    <div className={cn(
      "bg-surface-container/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-on-surface/5 group",
      refunded && "opacity-50 grayscale"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-violet-500/10 text-violet-400")}>
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h4 className={cn("font-headline font-bold text-lg", refunded ? "text-on-surface-variant line-through" : "text-on-surface")}>{product_name}</h4>
          <p className="text-sm font-body text-on-surface-variant">{email}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-label text-zinc-600 uppercase tracking-widest">{time}</p>
            {refunded && <span className="text-[10px] font-label text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded">Money Sent Back</span>}
            {partiallyRefunded && !refunded && <span className="text-[10px] font-label text-orange-400 uppercase tracking-widest bg-orange-400/10 px-2 py-0.5 rounded">Partly Sent Back</span>}
            {is_product_physical && shipped && <span className="text-[10px] font-label text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded">Sent</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col md:items-end gap-4">
        <div className={cn("text-2xl font-headline font-bold", refunded ? "text-on-surface-variant" : "text-secondary")}>{formattedPrice}</div>
        <div className="flex items-center gap-3">
          {!refunded && (
            <>
              {is_product_physical && !shipped && (
                <button 
                  onClick={() => onAction({ 
                    name: 'Mark as Sent', 
                    fn: () => ActionRegistry.get("markShipped")!.execute(id) 
                  })}
                  className="px-4 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-400/10 transition-colors border border-emerald-400/20"
                >
                  Mark Sent
                </button>
              )}
              <div className="relative group/action">
                <button 
                  onClick={() => onAction({ 
                    name: 'Send Money Back', 
                    fn: () => ActionRegistry.get("refund")!.execute(id) 
                  })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-wider transition-all border flex items-center gap-2",
                    "text-red-400 hover:bg-red-400/10 border-red-400/20"
                  )}
                >
                  Send Back
                </button>
              </div>
            </>
          )}
          <div className="relative group/action">
            <button 
              onClick={() => onAction({ 
                name: 'Send Receipt again', 
                fn: () => ActionRegistry.get("resendReceipt")!.execute(id) 
              })}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-wider transition-all border flex items-center gap-2",
                "text-primary hover:bg-primary/10 border-primary/20"
              )}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
