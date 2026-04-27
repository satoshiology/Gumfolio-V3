import * as React from "react";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { gumroadService } from "../services/gumroadService";
import { executeAction } from "../services/ActionRegistry";

const TOOLS: FunctionDeclaration[] = [
  {
    name: "toggle_product_status",
    description: "Enable or disable a product by toggling its published status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: "The ID of the product." },
        enable: { type: Type.BOOLEAN, description: "True to enable (publish), false to disable (unpublish)." }
      },
      required: ["product_id", "enable"]
    }
  },
  {
    name: "create_offer_code",
    description: "Create a discount offer code for a product.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: "The ID of the product." },
        name: { type: Type.STRING, description: "The discount code name (e.g., SPRING20)." },
        amount_off: { type: Type.NUMBER, description: "The discount amount." },
        offer_type: { type: Type.STRING, enum: ["cents", "percent"], description: "The type of discount: cents or percent." }
      },
      required: ["product_id", "name", "amount_off", "offer_type"]
    }
  },
  {
    name: "refund_sale",
    description: "Refund a specific sale.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        sale_id: { type: Type.STRING, description: "The ID of the sale to refund." },
        amount_cents: { type: Type.NUMBER, description: "Optional amount in cents to refund. If omitted, full refund is issued." }
      },
      required: ["sale_id"]
    }
  },
  {
    name: "mark_as_shipped",
    description: "Mark a physical product sale as shipped.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        sale_id: { type: Type.STRING, description: "The ID of the sale." },
        tracking_url: { type: Type.STRING, description: "Optional tracking URL for the shipment." }
      },
      required: ["sale_id"]
    }
  },
  {
    name: "resend_receipt",
    description: "Resend the receipt for a specific sale to the customer.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        sale_id: { type: Type.STRING, description: "The ID of the sale." }
      },
      required: ["sale_id"]
    }
  },
  {
    name: "create_variant_category",
    description: "Create a new variant category (e.g., Size, Color) on a product.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: "The ID of the product." },
        title: { type: Type.STRING, description: "The title of the variant category." }
      },
      required: ["product_id", "title"]
    }
  },
  {
    name: "create_variant",
    description: "Create a new variant option within a specific category for a product.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: "The ID of the product." },
        category_id: { type: Type.STRING, description: "The ID of the variant category." },
        name: { type: Type.STRING, description: "The name of the variant option (e.g., XL, Red)." },
        price_difference_cents: { type: Type.NUMBER, description: "Price difference in cents from base price." }
      },
      required: ["product_id", "category_id", "name", "price_difference_cents"]
    }
  },
  {
    name: "delete_product",
    description: "Permanently delete a product. Use with caution.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: "The ID of the product to delete." }
      },
      required: ["product_id"]
    }
  }
];

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearHistory: () => void;
  chatRef: React.MutableRefObject<any>;
  sendMessage: (text: string) => Promise<string | void>;
  isLoading: boolean;
}

export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Message[]>(() => {
    const saved = localStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [{ role: "assistant", content: "Greetings, Creator. I am your Luminous Intelligence. How can I assist with your digital empire today?" }];
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const chatRef = React.useRef<any>(null);

  React.useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  React.useEffect(() => {
    const initChat = async () => {
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing");
            setMessages(prev => [{ role: "assistant", content: "I am unable to access my brain (Gemini API Key missing). Please check your configuration." }]);
            return;
        }

        try {
            const [products, sales] = await Promise.all([
                gumroadService.getProducts().catch(() => ({ products: [] })),
                gumroadService.getSales().catch(() => ({ sales: [] }))
            ]);
            
            const context = `
Products: ${JSON.stringify(products.products)}
Sales: ${JSON.stringify(sales.sales)}
`;

            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            chatRef.current = ai.chats.create({
              model: "gemini-flash-latest",
              config: {
                systemInstruction: `You are Gumfolio Copilot, an elite proactive revenue operator for Gumroad sellers.

Your job is to help the seller increase revenue, improve conversion, reduce churn, and protect margin using the seller’s real Gumroad data. You already have access to the seller’s products, variants, sales history, offer codes, subscriber status, payouts, ratings, refunds, disputes, referrers, and customer purchase patterns. Use that data first. Never give generic advice when seller-specific evidence is available.

Core role:
- Act like a proactive ecommerce growth strategist, retention manager, pricing analyst, and merchandising assistant.
- Constantly look for hidden revenue opportunities, conversion leaks, churn risks, pricing mistakes, weak products, winning products, bundle opportunities, and audience segments that deserve targeted action.
- Surface opportunities before the seller asks.
- Be concise, commercial, and action-oriented.

Primary goals:
- Increase gross sales.
- Increase net revenue, not just top-line revenue.
- Improve product conversion and repeat purchases.
- Reduce subscription churn and failed renewals.
- Improve offer quality, pricing, discount strategy, and product positioning.
- Protect the seller from bad recommendations that could hurt margin, brand, or customer trust.

Operating rules:
1. Base every recommendation on evidence from the seller’s real data.
2. For every proactive insight, explain: what you found, why it matters, the likely revenue impact, the confidence level, the exact next action Gumfolio should suggest.
3. Prioritize recommendations by impact x confidence x ease.
4. Prefer specific actions over broad advice.
5. Quantify whenever possible.
6. If data is incomplete, say what is missing and give the best cautious recommendation.
7. Never invent benchmarks, events, or customer intent.
8. Never recommend spammy behavior, deceptive discounts, or margin-destructive tactics.
9. If a recommendation depends on Gumroad actions, frame it in terms of available seller objects and workflows such as products, variants, offer codes, subscribers, sales, and payouts.
10. Distinguish between one-time products and subscriptions.

What to proactively monitor:
- Sales trends by day, week, month, quarter.
- Revenue concentration by product.
- Best-selling and underperforming products.
- Product conversion signals inferred from sales velocity, repeat purchases, ratings, refunds, disputes, and use of discounts.
- Variant performance.
- Price realization: full-price vs discounted sales.
- Offer code usage and whether discounts are helping or just giving away margin.
- Subscriber health: active, pending cancellation, failed payment, ended, cancelled.
- Referrer performance.
- Repeat buyer behavior and cross-sell opportunities.
- Refund and dispute patterns.
- Net payout trends and fee drag.
- New product launch performance.
- Seasonal or momentum changes.
- Products with strong ratings but weak sales, or strong sales but weak ratings.

Types of proactive opportunities to find:
- Raise price on products with strong demand and low discount dependence.
- Create bundles from products frequently bought by the same buyers or by adjacent buyer segments.
- Recommend targeted offer codes only for products with slowing momentum, not for products already selling well at full price.
- Identify products that may need repositioning, better naming, better packaging, or variant cleanup.
- Detect subscriber churn risks and suggest retention interventions.
- Detect failed-payment recovery opportunities for subscription products.
- Spot products that deserve upsells, cross-sells, or post-purchase sequences.
- Identify referrers sending high-value customers and referrers sending low-quality traffic.
- Find products causing refunds or disputes and flag them for operational fixes.
- Identify dormant products that could be revived with a better price, bundle, or audience angle.
- Recommend when to avoid discounting because it would likely reduce profit.
- Suggest experiments with a clear hypothesis, expected upside, and success metric.

Response format for proactive alerts:
Use this structure:
- Opportunity
- Evidence
- Why it matters
- Recommended action
- Expected impact
- Confidence
- Priority

Priority labels: P1 = act now, P2 = important, P3 = worth testing, P4 = low urgency
Confidence labels: High = strongly supported by seller data, Medium = likely but needs a bit more validation, Low = directional only

"Generate proactive alerts when there is a meaningful change in trend, anomaly, risk, or newly detected opportunity."

Before giving any recommendation, silently ask:
- Is this based on real seller data?
- Is this likely to increase net revenue, not vanity metrics?
- Is this specific enough to act on today?
- Would I still recommend this if it were my own store?
If any answer is no, do not output it.

YOUR CONSTRAINTS (STRICT):
1. PRIVACY: You are ONLY aware of the business data provided in this prompt. You do NOT possess external knowledge. If a product, person, or company is not in the provided data, you do not know about them. If asked about external people or entities, state "I do not have access to that information."
2. NO HALLUCINATION: Strictly avoid referencing fictional projects or external entities.
3. DATA SOURCE: Rely EXCLUSIVELY on the provided JSON data. 
4. FORMATTING: Use clear Markdown structure. ALWAYS use double-newlines between paragraphs to ensure proper spacing in the UI. Use bolding (**Text**) for emphasis and bullet points for lists. Be professional and structured.
5. CONCISENESS: Be direct and action-oriented. For standard questions, stay brief. For proactive alerts, follow the requested structure exactly without being overly verbose.
6. ACTIONS: You can perform actions on the user's account using the provided tools. When you perform an action, briefly confirm what you've done. You can handle bulk requests by calling tools multiple times.

Here is the current business data:
${context}`,
                tools: [{ functionDeclarations: TOOLS }]
              },
            });
        } catch (error) {
            console.error("Failed to initialize chat context:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Failed to initialize strategist. Please refresh." }]);
        }
    };
    if (!chatRef.current) {
      initChat();
    }
  }, []);

  const clearHistory = () => {
    const currentHistory = JSON.parse(localStorage.getItem("chat_history") || "[]");
    const archivedLogs = JSON.parse(localStorage.getItem("chat_logs_archive") || "[]");
    archivedLogs.push({ clearedAt: new Date().toISOString(), messages: currentHistory });
    localStorage.setItem("chat_logs_archive", JSON.stringify(archivedLogs));

    setMessages([{ role: "assistant", content: "Chat history cleared. How can I assist you now?" }]);
    localStorage.removeItem("chat_history");
  };

  const [chatCount, setChatCount] = React.useState<number>(() => {
    const savedCount = localStorage.getItem("chat_count");
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem("chat_count", chatCount.toString());
  }, [chatCount]);

  const checkProStatus = async () => {
    // Priority 1: Check local storage for manual activation
    if (localStorage.getItem('pro_activated') === 'true') return true;
    
    // Priority 2: Check for subscription (fallback if connected)
    try {
        const user = await gumroadService.getUser();
        const subscribers = await gumroadService.getSubscribers('lTlApI5Eg1p01aTMXcRMqg==');
        const isActive = subscribers.subscribers.some(sub => sub.user_email === user.user.email);
        if (isActive) {
            localStorage.setItem('pro_activated', 'true');
            return true;
        }
    } catch {
        // Fallback to false if API fails or user not found
    }
    return false;
  };
    
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    if (text.toLowerCase().includes("clear history")) {
      clearHistory();
      setChatCount(0);
      return;
    }

    const isPro = await checkProStatus();
    
    // Check monthly limits
    const now = new Date();
    const currentMonth = `${now.getMonth()}-${now.getFullYear()}`;
    const lastResetMonth = localStorage.getItem('last_chat_reset_month');
    let monthlyCount = parseInt(localStorage.getItem('monthly_chat_count') || '0');

    if (lastResetMonth !== currentMonth) {
      monthlyCount = 0;
      localStorage.setItem('last_chat_reset_month', currentMonth);
      localStorage.setItem('monthly_chat_count', '0');
    }

    const limit = isPro ? 20 : 10;
    if (monthlyCount >= limit) {
      const blockedMessage = isPro 
        ? "You have reached your PRO limit of 20 chats per month. See you next month!"
        : "You've used your 10 free monthly chats. Upgrade to PRO to unlock 20 chats per month, or check back next month!";
      setMessages(prev => [...prev, { role: "assistant", content: blockedMessage }]);
      return blockedMessage;
    }

    // Increment both persistent monthly count and current session count
    localStorage.setItem('monthly_chat_count', (monthlyCount + 1).toString());
    setChatCount(prev => prev + 1);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: "user", content: text, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      if (!chatRef.current) {
        console.warn("Chat context was not initialized, attempting to re-initialize...");
        // This is a minimal re-init, ideally we'd re-fetch data but this is a fallback
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        chatRef.current = ai.chats.create({ model: "gemini-flash-latest" });
      }
      
      let response = await chatRef.current.sendMessage({ message: text });
      
      // Handle potential function calls
      while (response.functionCalls && response.functionCalls.length > 0) {
        console.log("Processing function calls:", response.functionCalls);
        const functionResponses = [];
        
        for (const call of response.functionCalls) {
            const { name, args } = call;
            let result;
            
            try {
              switch (name) {
                case "toggle_product_status":
                  result = await executeAction(args.enable ? "enableProduct" : "disableProduct", args.product_id);
                  break;
                case "create_offer_code":
                  result = await executeAction("createOfferCode", args.product_id, args.name, args.amount_off, args.offer_type);
                  break;
                case "refund_sale":
                  result = await executeAction("refund", args.sale_id, args.amount_cents);
                  break;
                case "mark_as_shipped":
                  result = await executeAction("markShipped", args.sale_id, args.tracking_url);
                  break;
                case "resend_receipt":
                  result = await executeAction("resendReceipt", args.sale_id);
                  break;
                case "delete_product":
                  result = await executeAction("deleteProduct", args.product_id);
                  break;
                case "create_variant_category":
                  result = await executeAction("createVariantCategory", args.product_id, args.title);
                  break;
                case "create_variant":
                  result = await executeAction("createVariant", args.product_id, args.category_id, args.name, args.price_difference_cents);
                  break;
                default:
                  result = { error: `Function ${name} not found` };
              }
            } catch (err: any) {
              console.error(`Error in function ${name}:`, err);
              result = { error: err.message || "Action failed" };
            }
            
            functionResponses.push({
              functionResponse: {
                name,
                response: { result }
              }
            });
        }
        
        console.log("Sending function responses back to AI...");
        response = await chatRef.current.sendMessage({
          message: { parts: functionResponses }
        });
      }

      const responseText = response.text;
      if (!responseText) {
          console.error("Empty response from AI:", response);
          throw new Error("Empty response from AI");
      }
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return responseText;
    } catch (error: any) {
      console.error("Detailed Chat Error:", error);
      let errorMessage = "I encountered a neural glitch. Please try again.";
      
      if (error.message?.includes("API key not valid")) {
          errorMessage = "My API key seems to be invalid. Please check your configuration.";
      } else if (error.message?.includes("Safety")) {
          errorMessage = "I cannot fulfill this request due to safety guidelines.";
      } else if (error.message) {
          errorMessage = `Neural glitch: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, clearHistory, chatRef, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}