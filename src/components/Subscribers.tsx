import * as React from "react";
import { gumroadService } from "../services/gumroadService";
import { Product } from "../types";
import { Loader2, Users, Search } from "lucide-react";
import { cn } from "../lib/utils";

export default function SubscribersView() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  const [subscribers, setSubscribers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [subLoading, setSubLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    async function loadProducts() {
      const data = await gumroadService.getProducts();
      setProducts(data.products);
      if (data.products.length > 0) setSelectedProductId(data.products[0].id);
      setLoading(false);
    }
    loadProducts();
  }, []);

  React.useEffect(() => {
    if (!selectedProductId) return;
    async function loadSubscribers() {
      setSubLoading(true);
      const data = await gumroadService.getSubscribers(selectedProductId!);
      setSubscribers(data.subscribers);
      setSubLoading(false);
    }
    loadSubscribers();
  }, [selectedProductId]);

  const filteredSubscribers = (subscribers || []).filter(sub => 
    sub.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center p-8 text-on-surface-variant"><Loader2 className="animate-spin mx-auto w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-headline text-3xl font-bold">Fans</h2>
        <select 
          value={selectedProductId || ""} 
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="bg-surface-container-high rounded-xl p-3 border border-white/10 font-label text-sm uppercase tracking-widest text-on-surface w-full"
        >
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-on-surface-variant">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface border border-white/10 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      <div className="neuro-panel p-6">
        {subLoading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto w-8 h-8" /></div>
        ) : filteredSubscribers.length === 0 ? (
          <p className="text-center text-on-surface-variant py-10">
            {searchQuery ? "No fans match your search." : "No fans found for this product."}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredSubscribers.map(sub => (
              <div key={sub.id} className="flex items-center gap-4 p-4 border border-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">{sub.user_email}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{sub.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant">Created</p>
                  <p className="text-xs font-mono">{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}</p>
                  {sub.subscription_failed_at && (
                    <p className="text-[10px] text-red-500">Failed: {new Date(sub.subscription_failed_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
