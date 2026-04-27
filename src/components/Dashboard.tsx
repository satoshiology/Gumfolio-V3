import * as React from "react";
import { TrendingUp, ShoppingBag, Eye, BarChart3, Rocket, BookOpen, Brush, AlertCircle, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import { cn, formatPrice } from "../lib/utils";
import { hapticFeedback, playSound } from "../lib/audio";
import { gumroadService } from "../services/gumroadService";
import { Product, Sale } from "../types";
import { useStrategicDrift } from "../hooks/useStrategicDrift";
import { DriftAlertDisplay } from "./DriftAlertDisplay";
import { ImpactReportDisplay } from "./ImpactReportDisplay";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, sRes] = await Promise.all([
          gumroadService.getProducts(),
          gumroadService.getSales()
        ]);
        setProducts(pRes.products);
        setSales(sRes.sales);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const driftAlerts = useStrategicDrift(products, sales);

  const totalRevenueCents = (products || []).reduce((acc, p) => acc + (p?.sales_usd_cents || 0), 0);
  const totalRevenueFormatted = formatPrice(totalRevenueCents, 'USD');
  const totalSales = (products || []).reduce((acc, p) => acc + parseInt(p?.sales_count as any || 0), 0);

  // Group sales by day for the chart
  const salesByDay = React.useMemo(() => {
    const grouped: Record<string, number> = {};
    const now = new Date();
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      grouped[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }

    sales.forEach(sale => {
      const date = new Date(sale.created_at);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (grouped[key] !== undefined) {
        grouped[key] += (sale.price / 100);
      }
    });

    return Object.entries(grouped).map(([name, revenue]) => ({ name, revenue }));
  }, [sales]);

  const todaySalesCount = (sales || []).filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-xs">Loading your data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">
              My <span className="text-primary italic">Dashboard</span>
            </h1>
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-1">
              Data is up to date
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-high/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-[10px] font-label text-primary uppercase tracking-widest font-bold">Today's Activity</p>
              <p className="text-xl font-headline font-bold text-on-surface">+{todaySalesCount} Sales</p>
            </div>
            <div className="px-4 py-2 bg-secondary/10 rounded-xl border border-secondary/20">
              <p className="text-[10px] font-label text-secondary uppercase tracking-widest font-bold">Latest Sale</p>
              <p className="text-xl font-headline font-bold text-on-surface">{salesByDay[salesByDay.length - 1]?.revenue > 0 ? `$${salesByDay[salesByDay.length - 1].revenue.toFixed(2)}` : "$0.00"}</p>
            </div>
          </div>
        </div>

        <DriftAlertDisplay alerts={driftAlerts} />
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Main Chart Column */}
          <div className="lg:col-span-4 space-y-6">
            <motion.section variants={item} className="glass-panel rounded-3xl p-8 relative overflow-hidden h-full min-h-[400px]">
              <div className="absolute inset-0 noise-overlay pointer-events-none opacity-20"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface">Money Earned</h2>
                    <p className="text-on-surface-variant text-sm font-body">Your earnings over the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-white/5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-label font-bold text-primary uppercase">Going Up</span>
                  </div>
                </div>

                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesByDay}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#888888", fontSize: 10, fontWeight: "bold" }}
                        dy={10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#0a0a0a", 
                          border: "1px solid rgba(255,255,255,0.1)", 
                          borderRadius: "12px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                        }}
                        itemStyle={{ color: "#00ff41" }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#00ff41" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Side Metrics Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.section variants={item} className="relative overflow-hidden rounded-3xl p-6 glass-panel border border-primary/20 bg-primary/5">
              <div className="absolute inset-0 noise-overlay pointer-events-none opacity-10"></div>
              <div className="relative z-10">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold mb-1 block">
                  Total Money Made
                </span>
                <h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter neon-text-glow">
                  {totalRevenueFormatted}
                </h3>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                  <span>Everything so far</span>
                  <span className="text-primary font-bold">Up to date</span>
                </div>
              </div>
            </motion.section>

            <MetricCard 
              label="Total Sales" 
              value={totalSales.toLocaleString()} 
              subValue={`${todaySalesCount > 0 ? `+${todaySalesCount}` : 'No change'} today`} 
              icon={ShoppingBag} 
              color="text-secondary" 
            />
            
            <MetricCard 
              label="Average Sale" 
              value={totalSales > 0 ? formatPrice(totalRevenueCents / totalSales, 'USD') : "$0.00"} 
              subValue="How much each person pays"
              icon={BarChart3} 
              color="text-tertiary" 
            />
          </div>
        </div>

        {/* Lower Details Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2 glass-panel rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold flex items-center gap-3">
                <Rocket className="w-5 h-5 text-primary" />
                Best sellers
              </h3>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Most money made</p>
            </div>
            <div className="space-y-4">
              {[...products].filter(p => p !== undefined).sort((a, b) => (b?.sales_usd_cents || 0) - (a?.sales_usd_cents || 0)).slice(0, 4).map((product) => (
                product && (
                  <ProductItem 
                    key={product.id}
                    title={product.name || "Untitled Product"} 
                    sales={`${product.sales_count} Sales`} 
                    revenue={formatPrice(product.sales_usd_cents, 'USD')} 
                    icon={product.name?.toLowerCase().includes('book') ? BookOpen : Brush} 
                    iconColor="text-primary" 
                    bgColor="bg-primary/20" 
                  />
                )
              ))}
              {(products || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm italic">No data yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          <div className="space-y-6">
            <ImpactReportDisplay />
            
            <motion.div variants={item} className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">Live Products</span>
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-2xl font-headline font-bold">{(products || []).filter(p => p.published).length}</h4>
                <p className="text-xs text-secondary font-medium">Items for sale</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary" 
                    style={{ width: `${Math.min(100, ((products || []).filter(p => p.published).length / ((products || []).length || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <motion.div 
      variants={item}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onTap={() => {
        playSound('button');
        hapticFeedback('light');
      }}
      className="glass-card rounded-xl p-6 flex flex-col justify-between min-h-[160px] cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          {label}
        </span>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div className="mt-4">
        <h3 className="font-headline text-4xl font-bold text-on-surface tracking-tight">{value}</h3>
        <p className={cn(color, "text-xs mt-1 font-medium")}>{subValue}</p>
      </div>
    </motion.div>
  );
}

function ProductItem({ title, sales, revenue, icon: Icon, iconColor, bgColor }: any) {
  return (
    <motion.div 
      whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
      onTap={() => {
        playSound('button');
        hapticFeedback('light');
      }}
      className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high transition-colors cursor-pointer"
    >
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", bgColor)}>
        <Icon className={cn("w-6 h-6", iconColor)} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[10px] text-on-surface-variant">{sales}</p>
      </div>
      <p className="text-sm font-bold text-secondary">{revenue}</p>
    </motion.div>
  );
}
