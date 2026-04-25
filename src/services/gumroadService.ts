import axios from "axios";
import { Product, Sale, LicenseVerificationResponse, User, Payout } from "../types";

export const gumroadService = {
  getToken(): string | null {
    return localStorage.getItem("gumroad_access_token");
  },

  setToken(token: string) {
    localStorage.setItem("gumroad_access_token", token);
  },

  clearToken() {
    localStorage.removeItem("gumroad_access_token");
  },

  getHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async getProducts(): Promise<{ products: Product[] }> {
    const response = await axios.get("/api/products", { headers: this.getHeaders() });
    return response.data;
  },

  async getProduct(productId: string): Promise<{ product: Product }> {
    const response = await axios.get(`/api/products/${productId}`, { headers: this.getHeaders() });
    return response.data;
  },

  async getSales(): Promise<{ sales: Sale[] }> {
    const response = await axios.get("/api/sales", { headers: this.getHeaders() });
    return response.data;
  },

  async getUser(): Promise<{ user: User }> {
    const response = await axios.get("/api/user", { headers: this.getHeaders() });
    return response.data;
  },

  async getPayouts(): Promise<{ payouts: Payout[] }> {
    const response = await axios.get("/api/payouts", { headers: this.getHeaders() });
    return response.data;
  },

  async verifyLicense(productId: string, licenseKey: string, incrementUses: boolean = false): Promise<LicenseVerificationResponse> {
    const response = await axios.post("/api/verify-license", {
      product_id: productId,
      license_key: licenseKey,
      increment_uses: incrementUses
    }, { headers: this.getHeaders() });
    return response.data;
  },

  async enableLicense(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.put(`/api/licenses/${licenseKey}/enable`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async disableLicense(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.put(`/api/licenses/${licenseKey}/disable`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async decrementLicenseUses(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.put(`/api/licenses/${licenseKey}/decrement-uses`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async rotateLicense(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.put(`/api/licenses/${licenseKey}/rotate`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async deleteProduct(productId: string): Promise<any> {
    const response = await axios.delete(`/api/products/${productId}`, { headers: this.getHeaders() });
    return response.data;
  },

  async disableProduct(productId: string): Promise<any> {
    const response = await axios.put(`/api/products/${productId}/disable`, {}, { headers: this.getHeaders() });
    return response.data;
  },

  async enableProduct(productId: string): Promise<any> {
    const response = await axios.put(`/api/products/${productId}/enable`, {}, { headers: this.getHeaders() });
    return response.data;
  },

  async getVariantCategories(productId: string): Promise<{ variant_categories: any[] }> {
    const response = await axios.get(`/api/products/${productId}/variant_categories`, { headers: this.getHeaders() });
    return response.data;
  },

  async createVariantCategory(productId: string, title: string): Promise<any> {
    const response = await axios.post(`/api/products/${productId}/variant_categories`, { title }, { headers: this.getHeaders() });
    return response.data;
  },

  async updateVariantCategory(productId: string, categoryId: string, title: string): Promise<any> {
    const response = await axios.put(`/api/products/${productId}/variant_categories/${categoryId}`, { title }, { headers: this.getHeaders() });
    return response.data;
  },

  async deleteVariantCategory(productId: string, categoryId: string): Promise<any> {
    const response = await axios.delete(`/api/products/${productId}/variant_categories/${categoryId}`, { headers: this.getHeaders() });
    return response.data;
  },

  async getVariants(productId: string, categoryId: string): Promise<{ variants: any[] }> {
    const response = await axios.get(`/api/products/${productId}/variant_categories/${categoryId}/variants`, { headers: this.getHeaders() });
    return response.data;
  },

  async createVariant(productId: string, categoryId: string, name: string, priceDifferenceCents: number): Promise<any> {
    const response = await axios.post(`/api/products/${productId}/variant_categories/${categoryId}/variants`, {
        name,
        price_difference_cents: priceDifferenceCents
    }, { headers: this.getHeaders() });
    return response.data;
  },

  async updateVariant(productId: string, categoryId: string, variantId: string, data: { name?: string, price_difference_cents?: number, max_purchase_count?: number }): Promise<any> {
    const response = await axios.put(`/api/products/${productId}/variant_categories/${categoryId}/variants/${variantId}`, data, { headers: this.getHeaders() });
    return response.data;
  },

  async deleteVariant(productId: string, categoryId: string, variantId: string): Promise<any> {
    const response = await axios.delete(`/api/products/${productId}/variant_categories/${categoryId}/variants/${variantId}`, { headers: this.getHeaders() });
    return response.data;
  },

  async createOffer(productId: string, name: string, amountOff: number, offerType: 'cents' | 'percent' = 'cents'): Promise<any> {
    const response = await axios.post(`/api/products/${productId}/offer_codes`, {
        name,
        amount_off: amountOff,
        offer_type: offerType
    }, { headers: this.getHeaders() });
    return response.data;
  },

  async markSaleAsShipped(saleId: string, trackingUrl?: string): Promise<any> {
    const response = await axios.put(`/api/sales/${saleId}/mark_as_shipped`, { tracking_url: trackingUrl }, { headers: this.getHeaders() });
    return response.data;
  },

  async resendReceipt(saleId: string): Promise<any> {
    const response = await axios.post(`/api/sales/${saleId}/resend_receipt`, {}, { headers: this.getHeaders() });
    return response.data;
  },

  async refundSale(saleId: string, amountCents?: number): Promise<any> {
    const response = await axios.put(`/api/sales/${saleId}/refund`, { amount_cents: amountCents }, { headers: this.getHeaders() });
    return response.data;
  },

  async getSubscribers(productId: string): Promise<{ subscribers: any[] }> {
    const response = await axios.get(`/api/products/${productId}/subscribers`, { headers: this.getHeaders() });
    return response.data;
  },
};
