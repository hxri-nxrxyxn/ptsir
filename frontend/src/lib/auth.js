// src/lib/auth.js
import { writable } from "svelte/store";
import { browser } from "$app/environment";

// Initialize state from localStorage if it exists
const initialToken = browser ? localStorage.getItem("jwt_token") : null;
const initialUser = browser
  ? JSON.parse(localStorage.getItem("user_info") || "null")
  : null;

// Create the writable store
const { subscribe, set } = writable({
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken,
});

export const auth = {
  subscribe,
  // You would call this function from your login page
  login: (token, user) => {
    if (browser) {
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user_info", JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  // You would call this from a logout button
  logout: () => {
    if (browser) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_info");
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
};
