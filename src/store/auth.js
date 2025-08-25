import { create } from "zustand";
import api from "../api/client";

export const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || "",
  abilities: JSON.parse(localStorage.getItem("abilities") || "[]"),

  setSession: ({ token, abilities, user }) => {
    if (token) localStorage.setItem("token", token);
    if (abilities) localStorage.setItem("abilities", JSON.stringify(abilities));
    set({
      token,
      abilities: abilities || get().abilities,
      user: user ?? get().user,
    });
  },

  clearSession: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("abilities");
    set({ token: "", abilities: [], user: null });
  },

  fetchMe: async () => {
    const res = await api.get("/auth/me");
    set({ user: res.data?.data || null });
    return res.data?.data;
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data?.data;
    get().setSession({
      token: data.token,
      abilities: data.abilities,
      user: data.user,
    });
    return data;
  },

  register: async (payload) => {
    const res = await api.post("/auth/register", payload);
    const data = res.data?.data;
    get().setSession({
      token: data.token,
      abilities: data.abilities,
      user: data.user,
    });
    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    get().clearSession();
  },

  hasAbility: (a) => get().abilities?.includes(a),
}));
