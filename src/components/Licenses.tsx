import * as React from "react";
import { Verified, CheckCircle, Loader2, AlertCircle, ShieldAlert, Search, Mail, User as UserIcon, Key as KeyIcon, X, Copy, Settings, RefreshCcw, Power, PowerOff, Plus, Minus, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { ActionRegistry } from "../services/ActionRegistry";
import { gumroadService } from "../services/gumroadService";
import { LicenseVerificationResponse, Sale } from "../types";
import { HoldButton } from "./HoldButton";
import { EmptyState } from "./EmptyState";
import { usePro } from "../hooks/usePro";


function LicenseCard({ sale, onManage }: { sale: Sale, onManage: (data: { sale: Sale, verification: LicenseVerificationResponse | null }) => void }) {
  const [verification, setVerification] = React.useState<{
    result: LicenseVerificationResponse | null;
    loading: boolean;
    error: string | null;
  }>({ result: null, loading: true, error: null });

  // Load state on mount - explicitly NOT incrementing
  React.useEffect(() => {
    let mounted = true;
    const loadVerification = async () => {
      try {
        const res = await gumroadService.verifyLicense(sale.product_id, sale.license_key || "", false);
        if (mounted) setVerification({ result: res, loading: false, error: null });
      } catch (err: any) {
        if (mounted) setVerification({ result: null, loading: false, error: err.response?.data?.message || "Load failed" });
      }
    };
    loadVerification();
    return () => { mounted = false; };
  }, [sale]);

  // Handle explicit increment action
  const handleIncrease = async () => {
    setVerification(prev => ({ ...prev, loading: true }));
    try {
        const res = await gumroadService.verifyLicense(sale.product_id, sale.license_key || "", true);
        setVerification({ result: res, loading: false, error: null });
    } catch {
        setVerification(prev => ({ ...prev, loading: false, error: "Failed to increment" }));
    }
  };

  let StatusIcon = Loader2;
  let statusText = "Verifying...";
  let statusColor = "text-on-surface-variant";
  let statusBg = "bg-white/5";

  if (!verification.loading) {
    if (sale.license_disabled) {
      StatusIcon = PowerOff;
      statusText = "Disabled";
      statusColor = "text-zinc-500";
      statusBg = "bg-zinc-500/10";
    } else if (sale.refunded) {
      StatusIcon = AlertCircle;
      statusText = "Revoked";
      statusColor = "text-red-400";
      statusBg = "bg-red-500/10";
    } else if (verification.error) {
      StatusIcon = ShieldAlert;
      statusText = "Invalid / Expired";
      statusColor = "text-orange-400";
      statusBg = "bg-orange-500/10";
    } else if (verification.result) {
      if (verification.result.uses > 5) { // Threshold for "overused"
        StatusIcon = AlertCircle;
        statusText = "Overused";
        statusColor = "text-yellow-400";
        statusBg = "bg-yellow-500/10";
      } else {
        StatusIcon = Verified;
        statusText = "Valid";
        statusColor = "text-primary";
        statusBg = "bg-primary/10";
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface-container/60 p-6 rounded-3xl border border-white/10 space-y-5 relative overflow-hidden"
    >
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary border border-white/5">
                    <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg leading-tight">{sale.email}</h4>
                  <p className="text-xs text-on-surface-variant">{sale.product_name}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="bg-black/30 rounded-2xl p-4 border border-white/5 font-mono flex justify-between items-center group/key">
              <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest block mb-1">License Key</span>
                  <code className="text-secondary text-sm break-all">{sale.license_key}</code>
              </div>
              <CopyButton text={sale.license_key || ""} />
          </div>
          
          <div className={cn("rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center w-24", statusBg, statusColor)}>
            {verification.loading ? (
              <Loader2 className="w-6 h-6 animate-spin mb-1" />
            ) : (
              <StatusIcon className="w-6 h-6 mb-1" />
            )}
            <span className="text-[10px] font-label uppercase tracking-widest block">
              {statusText}
            </span>
          </div>
        </div>

      {verification.result && !verification.loading && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Usage Count</span>
            <div className="text-on-surface font-headline font-bold text-lg flex items-center gap-2">
                {verification.result.uses}
                <div className="relative group/free">
                    <button 
                        onClick={() => handleIncrease()} 
                        className={cn(
                            "p-1 rounded-full transition-all text-primary hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-1">
                            <Plus className="w-4 h-4"/>
                        </div>
                    </button>
                </div>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Validated</span>
            <div className="text-secondary font-medium text-sm flex items-center gap-1 mt-1">
                <Verified className="w-4 h-4" /> Yes
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => onManage({ sale, verification: verification.result })}
        className="w-full mt-2 px-4 py-3 rounded-2xl text-[10px] font-label font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Settings className="w-3.5 h-3.5" />
        Manage License
      </button>
    </motion.div>
  );
}

export default function Licenses() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [salesLoading, setSalesLoading] = React.useState(false);

  const [selectedSaleForManage, setSelectedSaleForManage] = React.useState<{ sale: Sale, verification: LicenseVerificationResponse | null } | null>(null);

  React.useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const res = await gumroadService.getSales();
      setSales(res.sales.filter(s => s.license_key));
    } catch (err) {
      console.error("Failed to fetch sales for search", err);
    } finally {
      setSalesLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.license_key && (
      sale.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.license_key.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto flex flex-col items-center pb-24"
    >
      <div className="w-full mb-8 text-center">
        <span className="font-label text-[0.6875rem] uppercase tracking-[0.2em] text-secondary mb-2 block">Security Protocol</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight leading-none mb-4">Licenses</h1>
        <p className="text-on-surface-variant max-w-xs mx-auto">Search and manage existing license keys.</p>
      </div>

      <div className="w-full space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-zinc-700 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all font-label"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {salesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Accessing Secure Database...</p>
            </div>
          ) : filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <LicenseCard key={sale.id} sale={sale} onManage={setSelectedSaleForManage} />
            ))
          ) : (
            <EmptyState 
            icon={KeyIcon}
            title="No Licenses Found"
            description="It looks like there are no licenses matching your search criteria. Try a different query."
            />
          )}
        </div>
      </div>

      <p className="mt-8 font-label text-[10px] text-zinc-600 uppercase tracking-widest">Powered by Gumroad API v2.0</p>

      <AnimatePresence>
        {selectedSaleForManage && (
          <ManageModal 
            sale={selectedSaleForManage.sale} 
            verification={selectedSaleForManage.verification}
            onClose={() => setSelectedSaleForManage(null)} 
            onRefresh={fetchSales}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ManageModal({ sale, verification, onClose, onRefresh }: any) {
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  
  const [confirmAction, setConfirmAction] = React.useState<{name: string, fn: () => Promise<any>} | null>(null);
  const [liveVerification, setLiveVerification] = React.useState<LicenseVerificationResponse | null>(verification);

  // Auto-refresh verification when opening modal independently of the parent list
  React.useEffect(() => {
     let mounted = true;
     const refresh = async () => {
         try {
             const res = await ActionRegistry.get("verifyLicense")!.execute(sale.product_id, sale.license_key, false);
             if (mounted) setLiveVerification(res);
         } catch(e) {}
     };
     refresh();
     return () => { mounted = false; };
  }, [sale.product_id, sale.license_key]);

  const handleAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setConfirmAction(null);
    setLoadingAction(actionName);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await actionFn();
      setSuccessMsg(`Successfully performed: ${actionName}`);
      
      // If it returned validation details, update live state
      if (result && typeof result.uses === 'number') {
         setLiveVerification(result);
      } else {
         // Auto-fetch updated verification after action
         const res = await ActionRegistry.get("verifyLicense")!.execute(sale.product_id, sale.license_key, false).catch(()=>null);
         if (res) setLiveVerification(res);
      }
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to perform ${actionName}.`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-surface-container-low border border-white/10 rounded-3xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-surface-bright/20 hover:bg-surface-bright/40 text-on-surface transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="font-headline text-2xl font-bold mb-2">Manage License</h3>
        <p className="text-sm text-on-surface-variant mb-6 break-all">{sale.license_key}</p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {liveVerification && (
          <div className="mb-6 bg-surface-container/20 rounded-2xl p-5 border border-white/5 space-y-4">
            <DetailRow label="Current Usages" value={liveVerification.uses.toString()} isHighlight={true} />
            <DetailRow label="Purchase Date" value={new Date(liveVerification.purchase.created_at).toLocaleDateString()} />
            <DetailRow label="Purchaser Email" value={liveVerification.purchase.email} />
            {liveVerification.purchase.refunded && (
               <DetailRow label="Status" value="Refunded / Revoked" isHighlight={true} />
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-surface-container/40 p-4 rounded-xl border border-white/5">
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3 flex items-center justify-between">
                Usage Control
            </h4>
            <div className="relative group/control">
                <div className={cn("flex gap-3")}>
                  <button 
                    disabled={loadingAction !== null}
                    onClick={() => setConfirmAction({ name: 'Decrease Usages', fn: () => ActionRegistry.get("decrementLicenseUses")!.execute(sale.product_id, sale.license_key) })}
                    className="flex-1 py-3 rounded-xl bg-surface-bright/20 border border-outline-variant/15 text-on-surface font-label text-xs font-semibold hover:bg-zinc-800/60 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingAction === 'Decrease Usages' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                    Decrease
                  </button>
                  <button 
                    disabled={loadingAction !== null}
                    onClick={() => setConfirmAction({ name: 'Increase Usages', fn: () => ActionRegistry.get("verifyLicense")!.execute(sale.product_id, sale.license_key, true) })}
                    className="flex-1 py-3 rounded-xl bg-surface-bright/20 border border-outline-variant/15 text-on-surface font-label text-xs font-semibold hover:bg-zinc-800/60 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingAction === 'Increase Usages' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Increase
                  </button>
                </div>
            </div>
          </div>

          <div className="bg-surface-container/40 p-4 rounded-xl border border-white/5">
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3 flex items-center justify-between">
                Security
            </h4>
            <div className="relative group/control">
                <button 
                  disabled={loadingAction !== null}
                  onClick={() => setConfirmAction({ name: 'Rotate License', fn: () => ActionRegistry.get("rotateLicense")!.execute(sale.product_id, sale.license_key) })}
                  className={cn(
                    "w-full py-3 rounded-xl font-label text-xs font-semibold transition-all flex items-center justify-center gap-2 border bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
                  )}
                >
                  {loadingAction === 'Rotate License' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                  Rotate Key
                </button>
            </div>
          </div>

          <div className="bg-surface-container/40 p-4 rounded-xl border border-white/5">
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3 flex items-center justify-between">
                Access State
            </h4>
            <div className="relative group/control">
              <div className={cn("flex gap-3")}>
                {sale.license_disabled ? (
                  <button 
                    disabled={loadingAction !== null}
                    onClick={() => setConfirmAction({ name: 'Enable License', fn: () => ActionRegistry.get("enableLicense")!.execute(sale.product_id, sale.license_key) })}
                    className="flex-1 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-label text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 "
                  >
                    {loadingAction === 'Enable License' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    Enable
                  </button>
                ) : (
                  <button 
                    disabled={loadingAction !== null}
                    onClick={() => setConfirmAction({ name: 'Disable License', fn: () => ActionRegistry.get("disableLicense")!.execute(sale.product_id, sale.license_key) })}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-label text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 "
                  >
                    {loadingAction === 'Disable License' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PowerOff className="w-4 h-4" />}
                    Disable
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
                You are about to perform: <strong className="text-white">{confirmAction.name}</strong>. This action may affect the user's access.
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
                className="mt-4 text-sm font-label uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, isHighlight }: any) {
  return (
    <div className={cn("flex justify-between items-center py-3", !isHighlight && "border-b border-white/5")}>
      <span className="font-label text-xs text-on-surface-variant">{label}</span>
      <span className={cn("font-body text-sm font-medium", isHighlight ? "text-secondary" : "text-on-surface")}>{value}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={cn(
        "ml-4 p-2 rounded-lg transition-colors flex-shrink-0 relative overflow-hidden",
        copied ? "bg-green-500/20 text-green-400" : "bg-surface-bright/20 hover:bg-surface-bright/40 text-on-surface-variant hover:text-white"
      )}
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CheckCircle className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
