const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io";
const API_AUTH = `${XANO_BASE_URL}/api:MkIm7vH1`;
const API_DATA = `${XANO_BASE_URL}/api:tijara`;

// A thin wrapper over fetch to automatically attach the auth token and retry on 429 rate limits
async function fetchWithAuth(url, options = {}, retries = 4, delay = 1500) {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 429 && retries > 0) {
      console.warn(`Rate limit hit (429) for ${url}. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithAuth(url, options, retries - 1, delay * 1.5);
    }

    if (!response.ok) {
      let errorMsg;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || JSON.stringify(errorData);
      } catch {
        errorMsg = response.statusText || "Network response was not ok";
      }
      throw new Error(errorMsg);
    }

    // Handle empty responses (like 204 No Content or empty 200 OK for DELETE)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (retries > 0 && (error.message && (error.message.includes("429") || error.message.includes("rate limit") || error.message.includes("Whoa there")))) {
      console.warn(`Caught Rate limit error for ${url}. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithAuth(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

// 🛡️ دالة مساعدة لضمان أن البيانات المرتجعة عبارة عن Array دائمًا ومنع الـ Crash في الكومبوننتس
function ensureArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  // في Xano أحياناً البيانات بتغلف جوة object بمفتاح مثل data أو الاصلي، هنا بنفكها بأمان
  if (data.data && Array.isArray(data.data)) return data.data;
  if (typeof data === "object") {
    const values = Object.values(data);
    const foundArray = values.find((val) => Array.isArray(val));
    if (foundArray) return foundArray;
  }
  return [];
}

export const authAPI = {
  login: (email, password) =>
    fetchWithAuth(`${API_AUTH}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (fullName, email, password, userName, businessName) =>
    fetchWithAuth(`${API_AUTH}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, userName, businessName }),
    }),

  // POST /user/update — custom Xano endpoint to update profile fields
  // (Xano's built-in /auth/me is GET-only; this must be a custom endpoint you create)
  updateMe: (fields) =>
    fetchWithAuth(`${API_AUTH}/user/update`, {
      method: 'POST',
      body: JSON.stringify(fields),
    }),

  // POST /auth/password — change password (currentPassword + newPassword)
  changePassword: (currentPassword, newPassword) =>
    fetchWithAuth(`${API_AUTH}/auth/password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  me: () => fetchWithAuth(`${API_AUTH}/auth/me`, { method: "GET" }),

  // Send Google access_token to Xano for server-side verification via Google's userinfo endpoint
  // Xano calls https://www.googleapis.com/oauth2/v3/userinfo to verify, finds/creates user, returns authToken
  googleOAuth: (access_token) =>
    fetchWithAuth(`${API_AUTH}/auth/google-oauth`, {
      method: "POST",
      body: JSON.stringify({ access_token }),
    }),
};

export const dataAPI = {
  // Products
  getProducts: async () => {
    const res = await fetchWithAuth(`${API_DATA}/product`, { method: "GET" });
    return ensureArray(res); // ضمان رجوع Array
  },
  addProduct: (product) =>
    fetchWithAuth(`${API_DATA}/product`, {
      method: "POST",
      body: JSON.stringify(product),
    }),
  updateProduct: (id, updates) =>
    fetchWithAuth(`${API_DATA}/product/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  deleteProduct: (id) =>
    fetchWithAuth(`${API_DATA}/product/${id}`, { method: "DELETE" }),

  // Sales
  getSales: async () => {
    const res = await fetchWithAuth(`${API_DATA}/sale`, { method: "GET" });
    return ensureArray(res); // ضمان رجوع Array
  },
  addSale: (sale) =>
    fetchWithAuth(`${API_DATA}/sale`, {
      method: "POST",
      body: JSON.stringify(sale),
    }),

  // Expenses
  getExpenses: async () => {
    const res = await fetchWithAuth(`${API_DATA}/expense`, { method: "GET" });
    return ensureArray(res); // ضمان رجوع Array
  },
  addExpense: (expense) =>
    fetchWithAuth(`${API_DATA}/expense`, {
      method: "POST",
      body: JSON.stringify(expense),
    }),
  deleteExpense: (id) =>
    fetchWithAuth(`${API_DATA}/expense/${id}`, { method: "DELETE" }),


  getSuppliers: async () => {
    const res = await fetchWithAuth(`${API_DATA}/supplier`, { method: "GET" });
    return ensureArray(res);
  },
  addSupplier: (supplier) =>
    fetchWithAuth(`${API_DATA}/supplier`, {
      method: "POST",
      body: JSON.stringify(supplier),
    }),
  updateSupplier: (id, updates) =>
    fetchWithAuth(`${API_DATA}/supplier/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  deleteSupplier: (id) =>
    fetchWithAuth(`${API_DATA}/supplier/${id}`, { method: "DELETE" }),

  // Debts
  getDebts: async () => {
    const res = await fetchWithAuth(`${API_DATA}/debt`, {
      method: "GET",
    });
    return ensureArray(res);
  },

  addDebt: (debt) =>
    fetchWithAuth(`${API_DATA}/debt`, {
      method: "POST",
      body: JSON.stringify(debt),
    }),

  updateDebt: (id, updates) =>
    fetchWithAuth(`${API_DATA}/debt/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteDebt: (id) =>
    fetchWithAuth(`${API_DATA}/debt/${id}`, {
      method: "DELETE",
    }),
};
