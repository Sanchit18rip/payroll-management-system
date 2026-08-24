import { supabase } from "./supabaseClient";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export const apiFetch = async (url, options = {}) => {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("You are not logged in");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // If 403 Forbidden and not on login page, redirect to login
  if (response.status === 403 && !window.location.hash.includes("#/login")) {
    console.warn("Session expired or access denied. Redirecting to login.");
    localStorage.removeItem("payroll_keep_signed_in");
    sessionStorage.removeItem("payroll_session_only");
    window.location.hash = "#/login";
    throw new Error("Session expired. Please log in again.");
  }

  return response;
};