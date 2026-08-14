import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import db from "./db.js";
import jwt from "jsonwebtoken";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const requireAuth = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

   const token =
  authHeader.replace("Bearer ", "");


// ----------------------------------------
// GOOGLE AUTHENTICATOR SESSION
// ----------------------------------------

try {

  const authenticatorPayload =
    jwt.verify(
      token,
      process.env.AUTHENTICATOR_JWT_SECRET
    );

  if (
    authenticatorPayload.authMethod ===
    "authenticator"
  ) {

    req.user = {
      id: authenticatorPayload.userId,
      email: authenticatorPayload.email
    };

    req.userRole =
      authenticatorPayload.role;

    req.authMethod =
      "authenticator";

    return next();

  }

}
catch (authenticatorError) {

  // Not an Authenticator token.
  // Continue below and try the normal
  // Supabase authentication flow.

}


// ----------------------------------------
// EXISTING SUPABASE SESSION
// ----------------------------------------

const tokenPayload = JSON.parse(
  Buffer.from(
    token.split(".")[1],
    "base64"
  ).toString()
);

const sessionId =
  tokenPayload.session_id;

if (!sessionId) {
  return res.status(401).json({
    message: "Session ID not found"
  });
}
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {

  console.log("Supabase Auth Error:", error);

  return res.status(401).json({
    message: "Invalid or expired session",
    error: error?.message || "No user returned"
  });

}

    req.user = user;
    req.sessionId = sessionId;

    const { data: challenge, error: challengeError } =
  await supabase
    .from("login_challenges")
    .select("otp_verified, expires_at")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

if (
  challengeError ||
  !challenge ||
  !challenge.otp_verified ||
  new Date(challenge.expires_at) < new Date()
) {
  return res.status(403).json({
    message: "Email OTP verification required"
  });
}

const profileResult = await db.query(
  `
  SELECT role
  FROM employee_profiles
  WHERE id = $1
  LIMIT 1
  `,
  [user.id]
);

if (profileResult.rows.length === 0) {

  return res.status(403).json({
    message: "User profile not found"
  });

}

req.userRole = profileResult.rows[0].role;

next();

  }

  catch (err) {

    console.log(
      "Authentication error:",
      err.message
    );

    return res.status(401).json({
      message: "Authentication failed"
    });

  }

};
export const requireRole = (...allowedRoles) => {

  return (req, res, next) => {

    if (!req.userRole) {

      return res.status(403).json({
        message: "User role not found"
      });

    }

    if (!allowedRoles.includes(req.userRole)) {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    next();

  };

};
export const requireSession = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    const token =
      authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {

      return res.status(401).json({
        message: "Invalid or expired session"
      });

    }

    const tokenPayload = JSON.parse(
      Buffer.from(
        token.split(".")[1],
        "base64"
      ).toString()
    );

    const sessionId = tokenPayload.session_id;

    if (!sessionId) {
      return res.status(401).json({
        message: "Session ID not found"
      });
    }

    req.user = user;
    req.sessionId = sessionId;

    next();

  }

  catch (err) {

    console.log(
      "Session authentication error:",
      err.message
    );

    return res.status(401).json({
      message: "Authentication failed"
    });

  }

};