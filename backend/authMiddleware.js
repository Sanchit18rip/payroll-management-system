import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import db from "./db.js";


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
// EXISTING SUPABASE SESSION
// ----------------------------------------

let tokenPayload;
    try {
      tokenPayload = JSON.parse(
        Buffer.from(
          token.split(".")[1],
          "base64"
        ).toString()
      );
    } catch (parseErr) {
      return res.status(401).json({
        message: "Invalid token format",
        detail: parseErr.message
      });
    }

    const sessionId =
      tokenPayload.session_id;

    if (!sessionId) {
      return res.status(401).json({
        message: "Session ID not found",
        detail: "JWT payload has no session_id"
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

    // --------------------------------------------------
    // Get the user's role.
    // If employee_profiles table doesn't exist or any
    // DB error occurs, default to "hr" so the user
    // is not blocked.
    // --------------------------------------------------

    try {

      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'employee_profiles'
        ) AS exists
      `);

      if (!tableCheck.rows[0].exists) {
        req.userRole = "hr";
        return next();
      }

      const profileResult = await db.query(
        `SELECT role FROM employee_profiles WHERE id = $1 LIMIT 1`,
        [user.id]
      );

      if (profileResult.rows.length === 0) {
        req.userRole = "hr";
        return next();
      }

      req.userRole = (profileResult.rows[0].role || "hr").toLowerCase().trim();

    } catch (dbErr) {
      console.error("Role lookup failed, defaulting to hr:", dbErr.message);
      req.userRole = "hr";
    }

    // --------------------------------------------------
    // Skip OTP check for HR users.
    // --------------------------------------------------

    if (req.userRole !== "hr") {

      try {

        const tableCheck = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'login_challenges'
          ) AS exists
        `);

        if (!tableCheck.rows[0].exists) {
          return next();
        }

        const challengeResult = await db.query(
          `SELECT otp_verified, expires_at
           FROM login_challenges
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 1`,
          [user.id]
        );

        const challenge = challengeResult.rows[0];

        if (!challenge) {
          return res.status(403).json({
            message: "Email OTP verification required"
          });
        }

        // If OTP is verified, allow access regardless of expiry
        if (challenge.otp_verified) {
          return next();
        }

        // OTP not yet verified — check if challenge expired
        if (new Date(challenge.expires_at) < new Date()) {
          return res.status(403).json({
            message: "OTP expired. Please log in again."
          });
        }

        return res.status(403).json({
          message: "Email OTP verification required"
        });

      } catch (chErr) {
        console.error("OTP check failed, skipping:", chErr.message);
        return next();
      }

    }

    next();

  }

  catch (err) {

    console.error(
      "Authentication error:",
      err.message,
      err.stack
    );

    return res.status(401).json({
      message: "Authentication failed",
      detail: err.message
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