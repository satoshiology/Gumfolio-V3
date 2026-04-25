import * as React from "react";
import { TrendingUp, MoreVertical, Plus, Loader2, AlertCircle, CheckCircle2, Package, Search, X, Lock } from "lucide-react";
import { HoldButton } from "./HoldButton";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatPrice } from "../lib/utils";
import { gumroadService } from "../services/gumroadService";
import { Product } from "../types";
import { EmptyState } from "./EmptyState";

function getPrimaryPrice(product: Product) {
  if (product.is_tiered_membership && product.variants && product.variants.length > 0) {
    const variant = product.variants[0];
    const options = variant.options;
    if (options && options.length > 0) {
      const option = options[0];
      const recurrence = product.recurrences && product.recurrences.length > 0 ? product.recurrences[0] : 'monthly';
      const recurrencePrice = option.recurrence_prices?.[recurrence]?.price_cents;
      if (typeof recurrencePrice === 'number') {
        const formattedPrice = formatPrice(recurrencePrice, product.currency);
        // Map recurrence internals to human-readable format
        const intervalMap: Record<string, string> = {
          monthly: "monthly",
          quarterly: "quarterly",
          every_6_months: "/ 6 months",
          yearly: "yearly",
          every_2_years: "/ 2 years"
        };
        const intervalSuffix = intervalMap[recurrence] ? ` ${intervalMap[recurrence]}` : ` / ${recurrence}`;
        return `${formattedPrice}${intervalSuffix}`;
      }
    }
  }
  
  if (product.is_pay_what_you_want) {
    return "Custom";
  }

  return product.price > 0 ? formatPrice(product.price, product.currency) : "Price not set";
}

export default function Inventory() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = React.useCallback(async () => {
    try {
      const res = await gumroadService.getProducts();
      setProducts(res.products);
    } catch (err: any) {
      console.error("Products Fetch Error:", err);
      setError(err.response?.data?.error || "Failed to fetch inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    setActionLoading(`toggle-${id}`);
    const nextPublishedState = !currentlyPublished;
    
    try {
      const res = currentlyPublished 
        ? await gumroadService.disableProduct(id) 
        : await gumroadService.enableProduct(id);
      
      // If the API call doesn't throw, we consider it a success and force the UI state
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          // Normalize the product object: merge API data but MANDATE the new published state
          const apiProduct = res.product || {};
          console.log(`[Inventory] Toggle ${id} success. API returned published:`, apiProduct.published);
          return {
            ...p,
            ...apiProduct,
            published: nextPublishedState // Hard override for immediate feedback
          };
        }
        return p;
      }));
      
      showToast(nextPublishedState ? "Product published" : "Product unpublished", "success");

      // Optional: Re-fetch after a short delay to ensure consistency with the list view
      setTimeout(() => {
        console.log(`[Inventory] Triggering verification fetch for ${id}`);
        fetchProducts();
      }, 2000);
    } catch (err: any) {
      console.error("Toggle Publish Error:", err);
      // In case of error, the state remains as is (still unpublished if it was, or vice versa)
      showToast(err.response?.data?.message || err.message || "Failed to update product status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product && product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = (products || []).reduce((acc, p) => acc + ((p?.sales_usd_cents || 0) / 100), 0);
  const totalRevenueFormatted = formatPrice((products || []).reduce((acc, p) => acc + (p?.sales_usd_cents || 0), 0), 'USD');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-xs">Scanning Product Database...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-12 pb-24 relative"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md border",
              toast.type === 'success' ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <header>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary mb-2 block">Commerce Portfolio</span>
            <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface">Inventory</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-surface-container-high/50 px-4 py-2 rounded-2xl border border-outline-variant/10 backdrop-blur-md">
              <TrendingUp className="w-5 h-5 text-primary-fixed-dim" />
              <span className="font-label text-sm text-on-surface-variant">
                Active Revenue Stream: <span className="text-on-surface font-bold">{totalRevenueFormatted}</span>
              </span>
            </div>
            
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-on-surface-variant">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface border border-white/10 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            actionLoading={actionLoading}
            onTogglePublish={() => handleTogglePublish(product.id, product.published)}
          />
        ))}

        {filteredProducts.length === 0 && !error && products.length > 0 && (
           <EmptyState 
           icon={Search}
           title="No Products Match"
           description="There are no products matching your search query."
           action={{ label: "Clear Search", onClick: () => setSearchQuery("") }}
           />
        )}

        {products.length === 0 && !error && (
            <EmptyState 
            icon={Package}
            title="No Products Found"
            description="It looks like you haven't created any products yet. Head over to Gumroad to get started."
            action={{ label: "Go to Gumroad", onClick: () => window.open("https://gumroad.com", "_blank") }}
            />
        )}
      </div>
    </motion.div>
  );
}

function ProductCard({ product, actionLoading, onTogglePublish }: any) {
  const { id, name: title, sales_count: sales, published, file_type, thumbnail_url, currency } = product;
  const price = getPrimaryPrice(product);
  const tag = file_type || "Digital Asset";
  const image = thumbnail_url || `https://picsum.photos/seed/${id}/800/600`;
  const isToggling = actionLoading === `toggle-${id}`;
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <div className={cn(
        "group relative bg-surface-container-low/40 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border border-white/5 p-6 hover:shadow-[0_0_30px_rgba(132,85,239,0.1)] transition-all duration-500",
        !published && "opacity-80"
      )}>
        <div className={cn(
          "relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6",
          !published && "grayscale"
        )}>
          <img 
            src={image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            referrerPolicy="no-referrer"
            alt={title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-4 left-4">
            <span className="bg-primary/20 backdrop-blur-md text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider">
              {tag}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-headline text-xl font-bold text-on-surface leading-tight">{title}</h3>
            <div className="flex items-center gap-2">
              <span className="font-label text-xs text-on-surface-variant">{published ? "Published" : "Unpublished"}</span>
              <button 
                onClick={onTogglePublish}
                disabled={isToggling}
                className={cn(
                  "w-8 h-4 rounded-full relative p-0.5 cursor-pointer transition-colors disabled:opacity-50",
                  published ? "bg-primary/40" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full absolute top-0.5 transition-all flex items-center justify-center",
                  published ? "bg-primary right-0.5 shadow-[0_0_10px_rgba(132,85,239,1)]" : "bg-zinc-600 left-0.5"
                )}>
                  {isToggling && <Loader2 className="w-2 h-2 animate-spin text-black" />}
                </div>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Price</p>
              <p className={cn("font-headline text-2xl font-bold", published ? "text-secondary" : "text-zinc-500")}>{price}</p>
            </div>
            <div className="text-right">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Total Sales</p>
              <p className={cn("font-headline text-2xl font-bold", published ? "text-on-surface" : "text-zinc-500")}>{sales}</p>
            </div>
          </div>
          <div className="pt-4 flex gap-2">
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 py-3 neuro-button text-on-surface font-label text-sm font-semibold text-center block"
            >
              View Product
            </button>
          </div>
        </div>
      </div>
      {showModal && <ProductInfoModal product={product} onClose={() => setShowModal(false)} />}
    </>
  );
}

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import VariantManager from './VariantManager';
import { usePro } from "../hooks/usePro";

function ProductInfoModal({ product, onClose }: any) {
  const [fullView, setFullView] = React.useState(false);
  const [showVariantManager, setShowVariantManager] = React.useState(false);
  const isPro = usePro();

  if (showVariantManager) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowVariantManager(false)} />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full h-full md:h-[90vh] md:max-w-4xl bg-zinc-950 md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <VariantManager product={product} onClose={() => setShowVariantManager(false)} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel h-full md:h-[90vh] w-full md:max-w-2xl md:rounded-[2rem] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-headline font-bold text-on-surface">Product Insights</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface hover:text-primary transition-colors">Close</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
              {product.thumbnail_url && (
                <div 
                  className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/10 mb-4 cursor-pointer relative group flex items-center justify-center bg-zinc-950" 
                  onClick={() => setFullView(true)}
                >
                  <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-label uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">View Full Screen</span>
                  </div>
                </div>
              )}
              <h3 className="text-3xl font-headline font-bold text-on-surface">{product.name}</h3>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-headline font-bold text-secondary">
                  {getPrimaryPrice(product)}
                </p>
                <div className={cn("px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-wider", product.published ? "bg-primary/20 text-primary border border-primary/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700")}>
                  {product.published ? "Published" : "Unpublished"}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <div className="relative group">
                <button 
                  onClick={() => setShowVariantManager(true)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-xs font-label font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,224,255,0.1)] text-center",
                    "bg-[#00e0ff]/10 text-[#00e0ff] border border-[#00e0ff]/30 hover:bg-[#00e0ff]/20"
                  )}
                >
                  Manage Variants
                </button>
              </div>

              <button 
                  onClick={async () => {
                      if (product.published) await gumroadService.disableProduct(product.id);
                      else await gumroadService.enableProduct(product.id);
                      onClose();
                      window.location.reload();
                  }}
                  className={cn("w-full px-4 py-3 rounded-xl text-xs font-label font-bold uppercase tracking-widest transition-all text-center", 
                    product.published ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" : "bg-green-500/20 text-green-500 border border-green-500/30"
                  )}
              >
                  {product.published ? "Disable Product" : "Enable Product"}
              </button>
              
              <HoldButton 
                  onComplete={async () => {
                      await gumroadService.deleteProduct(product.id);
                      onClose();
                      window.location.reload();
                  }}
                  actionText="Delete"
                  className="w-full px-4 py-3 rounded-xl text-xs font-label font-bold uppercase tracking-widest bg-red-600/10 text-red-500 border border-red-500/30 flex items-center justify-center gap-2 transition-all"
              >
                  Delete Product
              </HoldButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-2">Total Revenue</span>
                <p className="font-headline text-xl text-on-surface">{formatPrice(product.sales_usd_cents, 'USD')}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-2">Total Sales</span>
                <p className="font-headline text-xl text-on-surface">{product.sales_count}</p>
              </div>
            </div>

            {product.description && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-label text-sm uppercase tracking-widest text-on-surface">Description</h4>
                <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{product.description}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="font-label text-sm uppercase tracking-widest text-on-surface">Technical Metadata</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">Asset Type</span>
                  <p className="font-mono text-sm text-on-surface">{product.file_type || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">File Size</span>
                  <p className="font-mono text-sm text-on-surface">{product.file_size || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">License Model</span>
                  <p className="font-mono text-sm text-on-surface">{product.license || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">Gumroad URL</span>
                  <a href={product.short_url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline block truncate">
                    {product.short_url}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {fullView && (
        <div className="fixed inset-0 z-[101] bg-black p-4 flex items-center justify-center cursor-pointer" onClick={() => setFullView(false)}>
           <img src={product.thumbnail_url} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  );
}
