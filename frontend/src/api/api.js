// Base URL of auth-service
const AUTH = import.meta.env.VITE_AUTH_URL || "";
const TODO = import.meta.env.VITE_TODO_URL || "";

async function req(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "request_failed");
  return data;
}

export const authApi = {
  register: (body) =>
    req(`${AUTH}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  login: (body) =>
    req(`${AUTH}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  logout: () =>
    req(`${AUTH}/auth/logout`, { method: "POST" }),

  me: () => req(`${AUTH}/me`),

  /** Exchange httpOnly cookie for a Bearer token (used by todo-service) */
  token: () => req(`${AUTH}/token`),

  googleUrl: () => `${AUTH}/auth/google`,
};

export const todoApi = {
  _bearer: null,

  async _headers() {
    if (!this._bearer) {
      const { token } = await authApi.token();
      this._bearer = token;
    }
    return { Authorization: `Bearer ${this._bearer}`, "Content-Type": "application/json" };
  },

  async getAll() {
    const headers = await this._headers();
    return req(`${TODO}/todos`, { headers });
  },

  async create(body) {
    const headers = await this._headers();
    return req(`${TODO}/todos`, { method: "POST", headers, body: JSON.stringify(body) });
  },

  async update(id, body) {
    const headers = await this._headers();
    return req(`${TODO}/todos/${id}`, { method: "PATCH", headers, body: JSON.stringify(body) });
  },

  async remove(id) {
    const headers = await this._headers();
    return req(`${TODO}/todos/${id}`, { method: "DELETE", headers });
  },

  async search(q) {
    const headers = await this._headers();
    return req(`${TODO}/todos/search?q=${encodeURIComponent(q)}`, { headers });
  },
};

export const paymentApi = {
  createOrder: async () => {
    const data = await req(`${AUTH}/premium/order`, { method: "POST" });
    return data; // { order, keyId }
  },
};
