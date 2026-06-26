const XANO_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io';
const API_AUTH = `${XANO_BASE_URL}/api:MkIm7vH1`;
const API_DATA = `${XANO_BASE_URL}/api:tijara`;

// A thin wrapper over fetch to automatically attach the auth token
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMsg = response.statusText || 'Network response was not ok';
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses (like 204 No Content or empty 200 OK for DELETE)
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export const authAPI = {
  login: (email, password) => 
    fetchWithAuth(`${API_AUTH}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  signup: (name, email, password) => 
    fetchWithAuth(`${API_AUTH}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
    
  me: () => 
    fetchWithAuth(`${API_AUTH}/auth/me`, { method: 'GET' }),
};

export const dataAPI = {
  // Products
  getProducts: () => fetchWithAuth(`${API_DATA}/product`, { method: 'GET' }),
  addProduct: (product) => fetchWithAuth(`${API_DATA}/product`, { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, updates) => fetchWithAuth(`${API_DATA}/product/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteProduct: (id) => fetchWithAuth(`${API_DATA}/product/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: () => fetchWithAuth(`${API_DATA}/sale`, { method: 'GET' }),
  addSale: (sale) => fetchWithAuth(`${API_DATA}/sale`, { method: 'POST', body: JSON.stringify(sale) }),

  // Expenses
  getExpenses: () => fetchWithAuth(`${API_DATA}/expense`, { method: 'GET' }),
  addExpense: (expense) => fetchWithAuth(`${API_DATA}/expense`, { method: 'POST', body: JSON.stringify(expense) }),
  deleteExpense: (id) => fetchWithAuth(`${API_DATA}/expense/${id}`, { method: 'DELETE' }),
};
