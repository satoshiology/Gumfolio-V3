import { gumroadService } from "../services/gumroadService";
import { actionConfirmationService } from "./ActionConfirmationService";

export type ImpactLevel = "low" | "high";

export interface RegistryAction {
  id: string;
  name: string;
  impact: ImpactLevel;
  requiresConfirmation: boolean; // New flag for UI flow
  execute: (...args: any[]) => Promise<any>;
}

export const ActionRegistry = new Map<string, RegistryAction>();

// Initialize Actions
ActionRegistry.set("refund", {
  id: "refund",
  name: "Refund Sale",
  impact: "high",
  requiresConfirmation: true,
  execute: (saleId: string, amountCents?: number) => gumroadService.refundSale(saleId, amountCents),
});

ActionRegistry.set("resendReceipt", {
  id: "resendReceipt",
  name: "Resend Receipt",
  impact: "low",
  requiresConfirmation: false,
  execute: (saleId: string) => gumroadService.resendReceipt(saleId),
});

ActionRegistry.set("verifyLicense", {
  id: "verifyLicense",
  name: "Verify License",
  impact: "low",
  requiresConfirmation: false,
  execute: (productId: string, licenseKey: string, incrementUses: boolean) => 
    gumroadService.verifyLicense(productId, licenseKey, incrementUses),
});

ActionRegistry.set("enableLicense", {
  id: "enableLicense",
  name: "Enable License",
  impact: "high",
  requiresConfirmation: true,
  execute: (productId: string, licenseKey: string) => 
    gumroadService.enableLicense(productId, licenseKey),
});

ActionRegistry.set("disableLicense", {
  id: "disableLicense",
  name: "Disable/Revoke License",
  impact: "high",
  requiresConfirmation: true,
  execute: (productId: string, licenseKey: string) => 
    gumroadService.disableLicense(productId, licenseKey),
});

ActionRegistry.set("decrementLicenseUses", {
  id: "decrementLicenseUses",
  name: "Decrease Usages",
  impact: "high",
  requiresConfirmation: true,
  execute: (productId: string, licenseKey: string) => 
    gumroadService.decrementLicenseUses(productId, licenseKey),
});

ActionRegistry.set("rotateLicense", {
  id: "rotateLicense",
  name: "Rotate License",
  impact: "high",
  requiresConfirmation: true,
  execute: (productId: string, licenseKey: string) => 
    gumroadService.rotateLicense(productId, licenseKey),
});

ActionRegistry.set("markShipped", {
  id: "markShipped",
  name: "Mark as Shipped",
  impact: "low",
  requiresConfirmation: false,
  execute: (saleId: string, trackingUrl?: string) => gumroadService.markSaleAsShipped(saleId, trackingUrl),
});

ActionRegistry.set("enableProduct", {
    id: "enableProduct",
    name: "Publish Product",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string) => gumroadService.enableProduct(productId),
});

ActionRegistry.set("disableProduct", {
    id: "disableProduct",
    name: "Unpublish Product",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string) => gumroadService.disableProduct(productId),
});

ActionRegistry.set("deleteProduct", {
    id: "deleteProduct",
    name: "Delete Product",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string) => gumroadService.deleteProduct(productId),
});

ActionRegistry.set("createVariant", {
    id: "createVariant",
    name: "Create Product Variant",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string, categoryId: string, name: string, priceDifferenceCents: number) => gumroadService.createVariant(productId, categoryId, name, priceDifferenceCents),
});

ActionRegistry.set("createVariantCategory", {
    id: "createVariantCategory",
    name: "Create Variant Category",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string, title: string) => gumroadService.createVariantCategory(productId, title),
});

ActionRegistry.set("deleteVariantCategory", {
    id: "deleteVariantCategory",
    name: "Delete Variant Category",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string, categoryId: string) => gumroadService.deleteVariantCategory(productId, categoryId),
});

ActionRegistry.set("deleteVariant", {
    id: "deleteVariant",
    name: "Delete Product Variant",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string, categoryId: string, variantId: string) => gumroadService.deleteVariant(productId, categoryId, variantId),
});

ActionRegistry.set("createOfferCode", {
    id: "createOfferCode",
    name: "Create Offer Code",
    impact: "high",
    requiresConfirmation: true,
    execute: (productId: string, name: string, amountOff: number, offerType: 'cents' | 'percent') => gumroadService.createOffer(productId, name, amountOff, offerType),
});

export async function executeAction(id: string, ...args: any[]) {
  const action = ActionRegistry.get(id);
  if (!action) throw new Error(`Action ${id} not found`);
  
  if (action.requiresConfirmation) {
      await actionConfirmationService.requestConfirmation(id, action.name, args);
  }
  
  return await action.execute(...args);
}
