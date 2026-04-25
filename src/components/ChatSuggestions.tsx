import * as React from "react";
import { motion } from "motion/react";
import { gumroadService } from "../services/gumroadService";
import { useChatContext } from "../context/ChatContext";
import { Product } from "../types";
import { cn } from "../lib/utils";

export function ChatSuggestions() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const { sendMessage } = useChatContext();

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await gumroadService.getProducts();
        setProducts(res.products);
      } catch (err) {
        console.error("Failed to fetch products for suggestions", err);
      }
    }
    fetchProducts();
  }, []);

  const getSuggestions = () => {
    const baseSuggestions = [
      "What's the best strategy for growth?",
      "Analyze my top performing product.",
      "How can I increase my conversion rate?",
      "Summarize my recent sales trends.",
      "Identify underperforming variants.",
      "What's my estimated revenue for next month?",
      "Draft a follow-up email for new subscribers.",
      "Compare this month's growth to last month.",
    ];

    if (products && products.length > 0) {
      const sorted = [...products].sort((a, b) => b.sales_count - a.sales_count);
      const topProduct = sorted[0];
      if (topProduct && topProduct.name) {
        baseSuggestions.push(`How is ${topProduct.name} performing?`);
        baseSuggestions.push(`Suggest improvements for ${topProduct.name}.`);
      }
    }

    // Ensure at least 10 if products empty
    if (baseSuggestions.length < 10) {
      baseSuggestions.push("What's my most popular price point?");
      baseSuggestions.push("Are my customer locations shifting?");
    }

    return baseSuggestions;
  };

  const suggestions = getSuggestions();

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div 
        className="flex gap-4 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {/* Duplicate the list for seamless looping */}
        {[...suggestions, ...suggestions].map((suggestion, index) => (
          <motion.button
            key={`${suggestion}-${index}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Subtle click sound
              const audio = new Audio("https://assets.mixkit.io/active_storage/sfx/2568/2568-preview.mp3");
              audio.volume = 0.2;
              audio.play().catch(() => {});
              sendMessage(suggestion);
            }}
            className="inline-flex items-center bg-surface-container-high/40 backdrop-blur-md border border-white/5 px-5 py-2.5 rounded-full text-[11px] font-medium text-primary hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all shadow-sm"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
      
      {/* Fade Overlays for edges */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
