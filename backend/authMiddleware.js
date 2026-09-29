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

  console.error("Supabase Auth Error:", error);

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
    // Approval gate for employee users.
    //
    // Email + password login is enough — no OTP or email
    // verification is required. Employees can only access
    // the system once HR has approved their registration.
    // --------------------------------------------------

    if (req.userRole !== "hr") {

      try {

        const approvalResult = await db.query(
          `SELECT approval_status
           FROM employee_profiles
           WHERE id = $1
           LIMIT 1`,
          [user.id]
        );

        const approvalStatus =
          approvalResult.rows[0]?.approval_status;

        if (approvalStatus === "pending") {
          return res.status(403).json({
            message: "Your registration is pending HR approval"
          });
        }

        if (approvalStatus === "rejected") {
          return res.status(403).json({
            message: "Your registration was rejected. Please contact HR"
          });
        }

      } catch (approvalErr) {
        console.error(
          "Approval check failed, allowing access:",
          approvalErr.message
        );
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

    console.error(
      "Session authentication error:",
      err.message
    );

    return res.status(401).json({
      message: "Authentication failed"
    });

  }

};