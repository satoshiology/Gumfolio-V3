import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Edit2, Trash2, Save, ArrowLeft, Loader2, DollarSign, Layers } from "lucide-react";
import { gumroadService } from "../services/gumroadService";
import { executeAction } from "../services/ActionRegistry";
import { cn, formatPrice } from "../lib/utils";
import { Product } from "../types";

interface VariantManagerProps {
  product: Product;
  onClose: () => void;
}

export default function VariantManager({ product, onClose }: VariantManagerProps) {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = React.useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = React.useState("");
  
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [editCategoryTitle, setEditCategoryTitle] = React.useState("");

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await gumroadService.getVariantCategories(product.id);
      // For each category, we also want to fetch its variants
      const categoriesWithVariants = await Promise.all(
        res.variant_categories.map(async (cat: any) => {
          const vRes = await gumroadService.getVariants(product.id, cat.id);
          return { ...cat, variants: vRes.variants };
        })
      );
      setCategories(categoriesWithVariants);
    } catch (err: any) {
      console.error("Fetch Variants Error:", err);
      setError("Failed to load variant structure.");
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async () => {
    if (!newCategoryTitle.trim()) return;
    try {
      await gumroadService.createVariantCategory(product.id, newCategoryTitle);
      setNewCategoryTitle("");
      setShowAddCategory(false);
      fetchCategories();
    } catch (err) {
      setError("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await executeAction("deleteVariantCategory", product.id, id);
      fetchCategories();
    } catch (err) {
      console.error("Delete Category Error:", err);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryTitle.trim()) return;
    try {
      await gumroadService.updateVariantCategory(product.id, id, editCategoryTitle);
      setEditingCategoryId(null);
      fetchCategories();
    } catch (err) {
      setError("Failed to update category.");
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-on-surface-variant text-xs uppercase tracking-widest">Architecting Variant Grid...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-on-surface">
      <header className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-on-surface-variant" />
          </button>
          <div>
            <h2 className="text-xl font-headline font-bold">{product.name}</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Variant Matrix</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-bold text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <X className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        <AnimatePresence>
          {showAddCategory && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-surface-container rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">New Category (e.g. Size, Color, License)</h3>
                <div className="flex gap-3">
                  <input 
                    autoFocus
                    value={newCategoryTitle}
                    onChange={e => setNewCategoryTitle(e.target.value)}
                    placeholder="Enter category title..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                  <button 
                    onClick={handleCreateCategory}
                    className="px-6 py-2 bg-primary text-black rounded-xl font-bold text-sm"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => setShowAddCategory(false)}
                    className="p-2 text-on-surface-variant hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {categories.map((category) => (
            <CategoryRow 
              key={category.id} 
              category={category} 
              product={product} 
              onRefresh={fetchCategories}
              onDelete={() => handleDeleteCategory(category.id)}
              isEditing={editingCategoryId === category.id}
              onStartEdit={() => {
                setEditingCategoryId(category.id);
                setEditCategoryTitle(category.title);
              }}
              onCancelEdit={() => setEditingCategoryId(null)}
              editValue={editCategoryTitle}
              onEditChange={setEditCategoryTitle}
              onSave={() => handleUpdateCategory(category.id)}
            />
          ))}

          {categories.length === 0 && !showAddCategory && (
            <div className="text-center py-20 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/10">
              <Layers className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
              <p className="text-on-surface-variant text-sm font-label">No variant categories found.</p>
              <button 
                onClick={() => setShowAddCategory(true)}
                className="mt-4 text-primary text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Assemble First Category
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CategoryRow({ 
  category, 
  product, 
  onRefresh, 
  onDelete, 
  isEditing, 
  onStartEdit, 
  onCancelEdit, 
  editValue, 
  onEditChange, 
  onSave 
}: any) {
  const [showAddVariant, setShowAddVariant] = React.useState(false);
  const [variantName, setVariantName] = React.useState("");
  const [variantPrice, setVariantPrice] = React.useState<number>(0);
  const [variantMax, setVariantMax] = React.useState<string>("");

  const handleAddVariant = async () => {
    if (!variantName.trim()) return;
    try {
      await gumroadService.createVariant(product.id, category.id, variantName, variantPrice);
      setVariantName("");
      setVariantPrice(0);
      setVariantMax("");
      setShowAddVariant(false);
      onRefresh();
    } catch (err) {
      alert("Failed to add variant.");
    }
  };

  return (
    <div className="bg-surface-container-low/40 rounded-3xl border border-white/5 overflow-hidden transition-all hover:bg-surface-container-low/60">
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input 
                autoFocus
                value={editValue}
                onChange={e => onEditChange(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-primary/50 w-full"
              />
              <button onClick={onSave} className="text-primary hover:scale-110 transition-transform"><Save className="w-4 h-4" /></button>
              <button onClick={onCancelEdit} className="text-red-400 hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Layers className="w-5 h-5 text-secondary" />
               <h3 className="font-headline font-bold text-lg">{category.title}</h3>
               <button onClick={onStartEdit} className="p-1 text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100"><Edit2 className="w-3 h-3" /></button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddVariant(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
          >
            Add Option
          </button>
          <button onClick={onDelete} className="p-2 text-on-surface-variant hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {showAddVariant && (
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="mb-8 p-4 bg-zinc-900/50 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Option Name</label>
                <input 
                  value={variantName}
                  onChange={e => setVariantName(e.target.value)}
                  placeholder="e.g. Large, Red, etc"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Price Diff (Cents)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-on-surface-variant">
                     <DollarSign className="w-3 h-3" />
                   </div>
                   <input 
                    type="number"
                    value={variantPrice}
                    onChange={e => setVariantPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>
                <p className="text-[9px] text-primary/60">Relative to base price</p>
              </div>
              <div className="flex items-end gap-2">
                <button 
                  onClick={handleAddVariant}
                  className="flex-1 bg-primary text-black rounded-lg py-2 text-xs font-bold uppercase tracking-widest"
                >
                  Confirm Option
                </button>
                <button onClick={() => setShowAddVariant(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.variants?.map((variant: any) => (
             <VariantCard 
                key={variant.id} 
                variant={variant} 
                product={product} 
                category={category}
                onRefresh={onRefresh}
              />
          ))}
          {(!category.variants || category.variants.length === 0) && !showAddVariant && (
             <div className="col-span-full py-8 text-center bg-black/20 rounded-2xl border border-white/[0.02]">
                <p className="text-xs text-on-surface-variant/40 italic">No options formulated for this category.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VariantCard({ variant, product, category, onRefresh }: any) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(variant.name);
  const [editPrice, setEditPrice] = React.useState(variant.price_difference_cents);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await executeAction("deleteVariant", product.id, category.id, variant.id);
      onRefresh();
    } catch (err) {
      console.error("Delete Variant Error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await gumroadService.updateVariant(product.id, category.id, variant.id, {
        name: editName,
        price_difference_cents: editPrice
      });
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      alert("Update failed.");
    }
  };

  if (isEditing) {
    return (
      <div className="bg-zinc-900 p-4 rounded-2xl border border-primary/30 shadow-2xl space-y-3">
        <input 
          value={editName}
          onChange={e => setEditName(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          placeholder="Name"
        />
        <input 
          type="number"
          value={editPrice}
          onChange={e => setEditPrice(parseInt(e.target.value) || 0)}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
          placeholder="Price Diff"
        />
        <div className="flex gap-2">
          <button onClick={handleUpdate} className="flex-1 bg-primary text-black rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-widest">Save</button>
          <button onClick={() => setIsEditing(false)} className="px-3 bg-white/5 rounded-lg text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-primary/20 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm text-on-surface">{variant.name}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/10 rounded transition-colors text-on-surface-variant"><Edit2 className="w-3 h-3" /></button>
           <button onClick={handleDelete} className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400">
             {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
           </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1",
          variant.price_difference_cents >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        )}>
          {variant.price_difference_cents >= 0 ? '+' : ''}{formatPrice(variant.price_difference_cents, product.currency)}
        </span>
        {variant.max_purchase_count && (
          <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">Limit: {variant.max_purchase_count}</span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-30"></div>
    </div>
  );
}
