import { supabase } from "./supabaseClient";

export const apiFetch = async (url, options = {}) => {

  let token = null;

  // Check Google Authenticator session first
  const authenticatorToken =
    localStorage.getItem(
      "payroll_authenticator_token"
    );

  if (authenticatorToken) {

    token = authenticatorToken;

  } else {

    // Existing Supabase session
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      token = session.access_token;
    }

  }

  if (!token) {
    throw new Error("You are not logged in");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  return fetch(url, {
    ...options,
    headers
  });
};