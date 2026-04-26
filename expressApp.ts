import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GUMROAD_CLIENT_ID = process.env.GUMROAD_CLIENT_ID;
const GUMROAD_CLIENT_SECRET = process.env.GUMROAD_CLIENT_SECRET;

// Agent Configuration State
const agentIntegrations: { [key: string]: boolean } = {
    gumroad: true
};

export const app = express();
export function setupApp() {

  const PORT = 3000;

  app.use(express.json());

  const GUMROAD_API_BASE = "https://api.gumroad.com/v2";

  // Robust Gumroad Mutation Helper
  async function gumroadMutation(method: 'put' | 'post' | 'delete', path: string, accessToken: string, data: any = {}) {
    const url = `${GUMROAD_API_BASE}${path}`;
    
    // Per AGENTS.md lessons and Gumroad docs:
    // PUT/POST: access_token in body as x-www-form-urlencoded
    // DELETE: access_token as query param
    
    const bodyParams = new URLSearchParams();
    if (method !== 'delete') {
      bodyParams.append("access_token", accessToken);
    }

    if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                bodyParams.append(key, String(val));
            }
        });
    }

    const finalUrl = method === 'delete' 
      ? `${url}${url.includes('?') ? '&' : '?'}access_token=${accessToken}` 
      : url;

    console.log(`[Gumroad] Executing ${method.toUpperCase()} ${path}`);
    
    try {
      const response = await axios({
        method,
        url: finalUrl,
        data: method !== 'delete' ? bodyParams.toString() : undefined,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          // We intentionally avoid Authorization: Bearer header here as it clashes with access_token in body/params on some endpoints
        }
      });

      if (response.data && response.data.success === false) {
        console.error(`[Gumroad Audit] Action rejected for ${path}:`, response.data);
        throw new Error(response.data.message || "Operation rejected by Gumroad");
      }

      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error(`[Gumroad API Error] ${method.toUpperCase()} ${path}:`, JSON.stringify(errorData || error.message, null, 2));
      
      // If Gumroad says "Something broke", it's usually an auth format issue.
      if (errorData?.message === "Something broke") {
        throw new Error("Gumroad API rejected the request format. Please check authentication configuration.");
      }
      
      throw error;
    }
  }

  // The user specifically requested this exact redirect URI
  const EXACT_REDIRECT_URI = process.env.APP_URL || process.env.URL || "https://gumfolio-v13-520825105178.us-west1.run.app/";

  // OAuth Routes
  app.get("/api/auth/url", (req, res) => {
    const params = new URLSearchParams({
      client_id: GUMROAD_CLIENT_ID,
      redirect_uri: EXACT_REDIRECT_URI,
      response_type: "code",
      scope: "account view_profile edit_products view_sales view_payouts mark_sales_as_shipped edit_sales",
    });

    const authUrl = `https://gumroad.com/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  const handleOAuthCallback = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { code } = req.query;
    if (!code) {
      return next();
    }

    try {
      // Gumroad expects form-urlencoded data, matching the cURL --data flags
      const tokenParams = new URLSearchParams({
        client_id: GUMROAD_CLIENT_ID,
        client_secret: GUMROAD_CLIENT_SECRET,
        code: code as string,
        redirect_uri: EXACT_REDIRECT_URI,
      });

      const response = await axios.post("https://api.gumroad.com/oauth/token", tokenParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;

      res.send(`
        <html>
          <body>
            <script type='text/javascript' nonce='VtqWy31hAFc47ufkm63XNg==' src='https://aistudio.google.com/LYfyLPcXby-aK5IpMkhBtY645_cu4AF90a203lWxnx4oaVPI9VIxv-b2aIFM5n4BGeoYJb1DaC86fUyrYddCSs82p0iFKuYpzEHRgzkLDML0Xy8ac62qXu5MreOliTtR_ljN08J0ERG4dTStsWAOH7GILtXm-87kyJQd6lY5NfHOI_T29XjVqIRAjEW6gZEpfRqwQZ_q2UJzD7NlsaQzgUF1Z-ozmmYvC1Fv6bAAzfzv1alI46foMIXeR5s_KQ7FJeCX7sDUfEfYWj0Cuf5m3cFIabCc8Us6rHOMrPZSAuOERN7RvuYZh-HvCsPThT2Ddbk-nS-3Z7r_LaHKD2APIOQS_y20Mzx0bort2XZEymEYkamkAsp0yOw3ZSgwHa4CuA0IW9womtoWqNMEt2z1EEZFmiZrUL9vg9MosJEBSuENEfr_xoOkiYraGTti1ZpU-RqDEhGzN154XeMqFGB_KWNFteOVlI1RTbPbCh7YYW0uliYlKub-leeT_V9vsvhlbETEK5JBFmS_CAbVPKPq8-mbpADgWWCyFOYxHsG2A1Pw-qHN_ZsxbnBgfMXcafqte1S9MdH726f_YB8UOsq-2UqIbRcCEQMZXuZyS05mDdm67kM98A'></script><script type="text/javascript" nonce="Zb1rCQAlF07XZOfC6v8E+A==" src="https://aistudio.google.com/SpaeBV7yCg0tUqkKv_Uxs0Q0ssOfT89XwFDsSm0q418vnZXjigyc7YshZ3HROatWRZ_7_I6W8WPSoeDGUg2qaOOEbaPsgEx90UUUtrAblH_hVkl6x8jeU2A6rQtw3gJ0X30kTgk5hArSmbK8JEQMM--Hacr-f7OMFi6fR6Uiq4cQtCpEaUMOYJmFKO4LVdWNEMPBW0J-gFxgnvKkom59OAreJGF-P-pDLT4gBuB4fp-7l7mVY4d4dj816e1kRDgtthX0YtyOPjbgLQBGh4GVzf50JrCMS5wQO4fAhFYdHSIns7YF_4tq2fVls0cTq4J7bs0M35ewNRujCMHRKh-SYvzDMby7GTMKB14X4E3Xm3bJN-UpDQRi06_CkMba0zkFXEGTa53Vue-DI-VUTni0dzCUVgheaJS04fyiLis0TBC4IQNTgNNqYHFdLlNVEecX1lZ_NdSISjcdqwo_N1ay_tp49_GdPG1O3j6QWJUYAEX3q3w0OwA2f-l7mfhl-CH8-UKGdMD1i_z71cbKS_YXjDfgqNMF_qluvxNnnV-_JhxSc1vzM61vI5AlLhTKxckzWvv-XiGOrFz_ZAhgasu2RoIV9EgXYQjLN6QhOa5qOZ8DtEl_Dw"></script><script>
              // 1. Save token to localStorage so the main window can detect it
              try {
                localStorage.setItem('gumroad_access_token', '${access_token}');
              } catch (e) {
                console.error('localStorage error:', e);
              }

              // 2. Try postMessage as a secondary method
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${access_token}' }, '*');
              }

              // 3. Attempt to close the popup
              window.close();

              // 4. Fallback: if the window refuses to close, redirect to the app
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            </script>
            <p>Authentication successful. This window should close automatically...</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth Token Exchange Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed. Please try again.");
    }
  };

  app.get(["/auth/callback", "/auth/callback/"], handleOAuthCallback);
  app.get("/", handleOAuthCallback);

  // API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        return res.status(401).json({ error: "Gumroad Access Token not provided" });
      }
      const response = await axios.get(`${GUMROAD_API_BASE}/products`, {
        params: { access_token: accessToken },
      });
      
      // Normalize products to ensure 'published' exists (sometimes Gumroad uses is_published)
      if (response.data && response.data.products) {
          response.data.products = response.data.products.map((p: any) => ({
              ...p,
              published: p.published !== undefined ? p.published : (p.is_published !== undefined ? p.is_published : false)
          }));
      }
      
      res.json(response.data);
    } catch (error: any) {
      console.error("Gumroad Products Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch products" });
    }
  });

  app.get("/api/sales", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        return res.status(401).json({ error: "Gumroad Access Token not provided" });
      }
      const response = await axios.get(`${GUMROAD_API_BASE}/sales`, {
        params: { access_token: accessToken },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Gumroad Sales Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch sales" });
    }
  });

  app.get("/api/user", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        return res.status(401).json({ error: "Gumroad Access Token not provided" });
      }
      const response = await axios.get(`${GUMROAD_API_BASE}/user`, {
        params: { access_token: accessToken },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Gumroad User Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch user" });
    }
  });

  app.get("/api/payouts", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        return res.status(401).json({ error: "Gumroad Access Token not provided" });
      }
      const response = await axios.get(`${GUMROAD_API_BASE}/payouts`, {
        params: { access_token: accessToken },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Gumroad Payouts Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch payouts" });
    }
  });

  // Action Routes
  app.put("/api/sales/:id/refund", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', `/sales/${req.params.id}/refund`, accessToken, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to refund sale" });
    }
  });

  app.post("/api/sales/:id/resend_receipt", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('post', `/sales/${req.params.id}/resend_receipt`, accessToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to resend receipt" });
    }
  });

  app.put("/api/sales/:id/mark_as_shipped", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', `/sales/${req.params.id}/mark_as_shipped`, accessToken, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to mark as shipped" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('delete', `/products/${req.params.id}`, accessToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to delete product" });
    }
  });

  app.put("/api/products/:id/enable", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', `/products/${req.params.id}/enable`, accessToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to enable product" });
    }
  });

  app.put("/api/products/:id/disable", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', `/products/${req.params.id}/disable`, accessToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to disable product" });
    }
  });

  // Variant Category Routes
  app.get("/api/products/:product_id/variant_categories", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const response = await axios.get(`${GUMROAD_API_BASE}/products/${req.params.product_id}/variant_categories`, {
        params: { access_token: accessToken }
      });
      res.json(response.data);
    } catch (error: any) {
       res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch variant categories" });
    }
  });

  app.post("/api/products/:product_id/variant_categories", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('post', `/products/${req.params.product_id}/variant_categories`, accessToken, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to create variant category" });
    }
  });

  app.put("/api/products/:product_id/variant_categories/:id", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', `/products/${req.params.product_id}/variant_categories/${req.params.id}`, accessToken, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to update variant category" });
    }
  });

  app.delete("/api/products/:product_id/variant_categories/:id", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('delete', `/products/${req.params.product_id}/variant_categories/${req.params.id}`, accessToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to delete variant category" });
    }
  });

  // Variant Routes
  app.get("/api/products/:product_id/variant_categories/:category_id/variants", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const response = await axios.get(`${GUMROAD_API_BASE}/products/${req.params.product_id}/variant_categories/${req.params.category_id}/variants`, {
        params: { access_token: accessToken }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch variants" });
    }
  });

  app.post("/api/products/:product_id/variant_categories/:category_id/variants", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('post', `/products/${req.params.product_id}/variant_categories/${req.params.category_id}/variants`, accessToken, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to create variant" });
    }
  });

  app.put("/api/products/:product_id/variant_categories/:category_id/variants/:id", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', `/products/${req.params.product_id}/variant_categories/${req.params.category_id}/variants/${req.params.id}`, accessToken, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to update variant" });
    }
  });

  app.delete("/api/products/:product_id/variant_categories/:category_id/variants/:id", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('delete', `/products/${req.params.product_id}/variant_categories/${req.params.category_id}/variants/${req.params.id}`, accessToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to delete variant" });
    }
  });

  app.post("/api/products/:product_id/offer_codes", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      
      const params = new URLSearchParams();
      params.append("access_token", accessToken);
      Object.entries(req.body).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      const response = await axios.post(`${GUMROAD_API_BASE}/products/${req.params.product_id}/offer_codes`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Gumroad Offer Code Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to create offer" });
    }
  });

  app.post("/api/verify-license", async (req, res) => {
    const { product_id, license_key, increment_uses } = req.body;
    try {
      const params = new URLSearchParams();
      params.append("product_id", product_id);
      params.append("license_key", license_key);
      params.append("increment_uses_count", increment_uses === true ? "true" : "false");
      
      const response = await axios.post(`${GUMROAD_API_BASE}/licenses/verify`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Gumroad License Verify Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to verify license" });
    }
  });

  app.put("/api/licenses/:license_key/enable", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', '/licenses/enable', accessToken, {
          license_key: req.params.license_key,
          product_id: req.body.product_id
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to enable license" });
    }
  });

  app.put("/api/licenses/:license_key/disable", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', '/licenses/disable', accessToken, {
        license_key: req.params.license_key,
        product_id: req.body.product_id
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to disable license" });
    }
  });

  app.put("/api/licenses/:license_key/decrement-uses", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', '/licenses/decrement_uses_count', accessToken, {
        license_key: req.params.license_key,
        product_id: req.body.product_id
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to decrement uses" });
    }
  });

  app.put("/api/licenses/:license_key/rotate", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      const result = await gumroadMutation('put', '/licenses/rotate', accessToken, {
        license_key: req.params.license_key,
        product_id: req.body.product_id
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message || "Failed to rotate license" });
    }
  });

  app.post("/api/agent/config", async (req, res) => {
      const { integrationId, enabled } = req.body;
      agentIntegrations[integrationId] = enabled;
      res.json({ success: true, agentIntegrations });
  });

  app.post("/api/agent/run", async (req, res) => {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
      
      const { instructions, model } = req.body;
      const { createServerAgent } = await import("./server_services/AgentOrchestrator.js");
      const agent = createServerAgent(accessToken, agentIntegrations, model);
      const result = await agent.run(instructions);
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Agent Run Error:", error);
      res.status(500).json({ error: "Agent failed to run" });
    }
  });
  
  }
