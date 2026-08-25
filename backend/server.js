import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import db from "./db.js";
import cron from "node-cron";
import nodemailer from "nodemailer";
import crypto from "crypto";
import PayrollFormula from "./utils/PayrollFormula.js";
import {
  requireAuth,
  requireRole,
  requireSession
} from "./authMiddleware.js";

// Load .env from backend directory regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });


const app = express();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail SMTP configuration error:", error);
  } else {
    console.log("✅ Gmail SMTP is ready");
    console.log("📧 Sender:", process.env.GMAIL_USER);
  }
});
// Office Location
const OFFICE_LAT = 19.0760;
const OFFICE_LNG = 72.8777;
const OFFICE_RADIUS_METERS = 200;

// Calculate distance between two coordinates
function distanceInMeters(lat1, lng1, lat2, lng2) {

  const R = 6371000;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}
app.use(cors());
app.use(express.json());

async function processMonthlyLeaveAccrual() {

  try {

    const today = new Date();

    // Credit only on the 1st day of every month
    if (today.getDate() !== 1) {

      return;

    }

    const currentMonth =
      today.getMonth() + 1;

    const currentYear =
      today.getFullYear();

    const employees =
      await db.query(
`
SELECT

id

FROM employees

WHERE employment_status = 'Permanent'
`
);

    for (const employee of employees.rows) {

      // Prevent duplicate credit for the same month
      const alreadyCredited =
        await db.query(
`
SELECT id

FROM leave_credit_history

WHERE employee_id = $1

AND
EXTRACT(MONTH FROM credit_date) = $2

AND
EXTRACT(YEAR FROM credit_date) = $3
`,
[
employee.id,
currentMonth,
currentYear
]
);

      if (
        alreadyCredited.rows.length > 0
      ) {

        continue;

      }      await db.query(`UPDATE leave_balance SET available_leaves = available_leaves + 1, total_leaves_earned = total_leaves_earned + 1 WHERE employee_id = $1`, [employee.id]);

      await db.query(
`
INSERT INTO leave_credit_history
(

employee_id,

credit_date,

vacation_credited,

sick_credited,

remarks

)

VALUES
(

$1,

CURRENT_DATE,

1,

1,

'Monthly Leave Credit'

)
`,
[
employee.id
]
);

    }

  }

  catch(err){

    console.log(err);

  }

}
app.get("/", (req, res) => {
  res.send("Backend Running");
});// NOTE: Authenticator routes removed — imports (otplib, qrcode, jsonwebtoken)
// were removed and frontend authenticator pages were deleted.
// If needed in the future, re-add the imports and these routes.
app.get(
  "/api/test-auth",
  requireAuth,
  (req, res) => {

    res.json({
      message: "Authentication successful",
      userId: req.user.id,
      email: req.user.email,
      role: req.userRole
    });

  }
);
app.get(
  "/api/me",
  requireAuth,
  (req, res) => {

    try {

      res.json({
        userId: req.user.id,
        email: req.user.email,
        role: req.userRole
      });

    } catch (err) {

      console.error("ME endpoint error:", err);

      res.status(500).json({
        message: "Unable to load user profile"
      });

    }

  }
);
app.get(
  "/api/outsourced-employees",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    try {

      const result =
        await db.query(

          `
          SELECT

            outsourced_employees.id,

            outsourced_employees.name,

            outsourced_employees.designation,

            outsourced_employees.salary,

            outsourced_employees.client_id

          FROM outsourced_employees

          ORDER BY outsourced_employees.id
          `

        );

      res.json(
        result.rows
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          err.message

      });

    }

  }
);
app.post(
  "/api/outsourced-employees",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    const {

      client_id,

      name,

      designation,

      salary

    } = req.body;

    try {

      await db.query(

        `
        INSERT INTO
        outsourced_employees
        (

          client_id,

          name,

          designation,

          salary

        )

        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        `,

        [

          client_id,

          name,

          designation,

          salary

        ]

      );

      res.json({

        message:
          "Outsourced employee added successfully"

      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          err.message

      });

    }

  }
);
app.get("/api/test-email", async (req, res) => {
  try {

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        message:
          "GMAIL_USER or GMAIL_APP_PASSWORD is missing in backend .env"
      });
    }

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Payroll Management System" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Payroll System Email Test",
      text: "This is a test email from the Payroll Management System.",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Payroll System Email Test</h2>

          <p>
            If you received this email, Gmail SMTP and Nodemailer
            are working correctly.
          </p>

          <p>
            <strong>Sender:</strong>
            ${process.env.GMAIL_USER}
          </p>
        </div>
      `
    });

    console.log("✅ Test email sent:", info.messageId);

    return res.json({
      success: true,
      message: "Test email sent successfully.",
      sender: process.env.GMAIL_USER,
      messageId: info.messageId
    });

  } catch (err) {

    console.error("❌ Email test error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Email sending failed.",
      code: err.code || null,
      responseCode: err.responseCode || null
    });

  }
});
app.post(
  "/api/login/send-email-otp",
  requireSession,
  async (req, res) => {

    try {

      // ==========================================
      // 1. GET SESSION INFORMATION
      // ==========================================

      const userId = req.user?.id;
      const email = req.user?.email;
      const sessionId = req.sessionId;

      if (!userId || !email || !sessionId) {

        return res.status(400).json({
          success: false,
          message: "User session information is missing."
        });

      }

      // ==========================================
      // 2. CHECK EMAIL CONFIGURATION
      // ==========================================

      if (
        !process.env.GMAIL_USER ||
        !process.env.GMAIL_APP_PASSWORD
      ) {

        console.error(
          "❌ GMAIL_USER or GMAIL_APP_PASSWORD is missing."
        );

        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured on the server."
        });

      }

      // ==========================================
      // 3. PREVENT OTP SPAM
      // ==========================================

      const recentOtp = await db.query(
        `
        SELECT id
        FROM login_otps
        WHERE user_id = $1
          AND created_at > NOW() - INTERVAL '60 seconds'
          AND used = FALSE
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [userId]
      );

      if (recentOtp.rows.length > 0) {

        return res.status(429).json({
          success: false,
          message:
            "Please wait 60 seconds before requesting another OTP."
        });

      }

      // ==========================================
      // 4. GENERATE 6-DIGIT OTP
      // ==========================================

      const otp = crypto
        .randomInt(100000, 1000000)
        .toString();

      // ==========================================
      // 5. HASH OTP
      // ==========================================

      const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      // ==========================================
      // 6. VERIFY GMAIL SMTP
      // ==========================================

      try {

        await transporter.verify();

      } catch (mailConfigError) {

        console.error(
          "❌ Gmail SMTP verification failed:",
          mailConfigError
        );

        return res.status(500).json({
          success: false,
          message:
            "Email service is unavailable. Please check Gmail SMTP configuration.",
          error:
            process.env.NODE_ENV === "production"
              ? undefined
              : mailConfigError.message
        });

      }

      // ==========================================
      // 7. SEND OTP EMAIL
      // ==========================================

      let mailInfo;

      try {

        mailInfo = await transporter.sendMail({

          from:
            `"Payroll Management System" <${process.env.GMAIL_USER}>`,

          to: email,

          subject:
            "Payroll System Login OTP",

          text:
            `Your Payroll System verification code is ${otp}. This OTP will expire in 5 minutes.`,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 30px;
                color: #222;
                line-height: 1.6;
              "
            >

              <h2>
                Payroll System Login
              </h2>

              <p>
                Your verification code is:
              </p>

              <div
                style="
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  margin: 20px 0;
                  padding: 15px;
                  background: #f5f5f5;
                  text-align: center;
                  border-radius: 8px;
                "
              >
                ${otp}
              </div>

              <p>
                This OTP will expire in
                <strong>5 minutes</strong>.
              </p>

              <p>
                If you did not attempt to log in,
                please ignore this email.
              </p>

              <hr
                style="
                  margin: 25px 0;
                  border: none;
                  border-top: 1px solid #ddd;
                "
              >

              <p
                style="
                  font-size: 12px;
                  color: #777;
                "
              >
                Payroll Management System
              </p>

            </div>
          `

        });

      } catch (mailError) {

        console.error(
          "❌ Nodemailer OTP error:",
          mailError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to send OTP email.",
          error:
            process.env.NODE_ENV === "production"
              ? undefined
              : mailError.message,
          code:
            process.env.NODE_ENV === "production"
              ? undefined
              : mailError.code
        });

      }

      console.log(
        "✅ Login OTP email sent:",
        mailInfo.messageId,
        "from:",
        process.env.GMAIL_USER,
        "to:",
        email
      );

      // ==========================================
      // 8. INVALIDATE PREVIOUS OTPs
      // ==========================================

      await db.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE user_id = $1
          AND used = FALSE
        `,
        [userId]
      );

      // ==========================================
      // 9. STORE NEW OTP
      // ==========================================

      await db.query(
        `
        INSERT INTO login_otps
        (
          user_id,
          email,
          otp_hash,
          expires_at,
          attempts,
          used
        )
        VALUES
        (
          $1,
          $2,
          $3,
          NOW() + INTERVAL '5 minutes',
          0,
          FALSE
        )
        `,
        [
          userId,
          email,
          otpHash
        ]
      );

      // ==========================================
      // 10. CREATE LOGIN CHALLENGE
      // ==========================================

      await db.query(
        `
        INSERT INTO login_challenges
        (
          user_id,
          session_id,
          email,
          otp_verified,
          expires_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          FALSE,
          NOW() + INTERVAL '5 minutes'
        )
        `,
        [
          userId,
          sessionId,
          email
        ]
      );

      // ==========================================
      // 11. SUCCESS RESPONSE
      // ==========================================

      return res.json({

        success: true,

        message:
          "OTP sent successfully.",

        email,

        messageId:
          mailInfo.messageId

      });

    } catch (err) {

      console.error(
        "❌ Send OTP API error:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||
          "Unable to send OTP."

      });

    }

  }
);
app.post(
  "/api/login/verify-email-otp",
  requireSession,
  async (req, res) => {

    try {

      // ==========================================
      // 1. GET SESSION / USER INFORMATION
      // ==========================================

      const userId = req.user?.id;
      const email = req.user?.email;
      const sessionId = req.sessionId;

      const cleanEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      const cleanOtp =
        String(req.body?.otp || "")
          .trim();


      console.log("");
      console.log("==========================================");
      console.log("        VERIFY EMAIL OTP");
      console.log("==========================================");
      console.log("User ID:", userId);
      console.log("Email:", cleanEmail);
      console.log("Session ID:", sessionId);
      console.log("Entered OTP:", cleanOtp);
      console.log("==========================================");


      // ==========================================
      // 2. VALIDATE USER SESSION
      // ==========================================

      if (
        !userId ||
        !cleanEmail ||
        !sessionId
      ) {

        console.error(
          "❌ Missing user/session information"
        );

        return res.status(400).json({
          success: false,
          message:
            "User session information is missing."
        });

      }


      // ==========================================
      // 3. VALIDATE OTP
      // ==========================================

      if (!cleanOtp) {

        return res.status(400).json({
          success: false,
          message:
            "OTP is required."
        });

      }


      if (!/^\d{6}$/.test(cleanOtp)) {

        return res.status(400).json({
          success: false,
          message:
            "OTP must be 6 digits."
        });

      }


      // ==========================================
      // 4. FIND LATEST ACTIVE OTP
      // ==========================================

      const otpResult =
        await db.query(
          `
          SELECT
            id,
            user_id,
            email,
            otp_hash,
            expires_at,
            attempts,
            used,
            created_at
          FROM login_otps
          WHERE user_id = $1
            AND LOWER(email) = LOWER($2)
            AND used = FALSE
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [
            userId,
            cleanEmail
          ]
        );


      // ==========================================
      // 5. NO OTP FOUND
      // ==========================================

      if (
        otpResult.rows.length === 0
      ) {

        console.error(
          "❌ No active OTP found"
        );

        return res.status(400).json({
          success: false,
          message:
            "No active OTP found. Please request a new OTP."
        });

      }


      const storedOtp =
        otpResult.rows[0];


      console.log(
        "OTP record found:",
        {
          id: storedOtp.id,
          userId: storedOtp.user_id,
          email: storedOtp.email,
          expiresAt: storedOtp.expires_at,
          attempts: storedOtp.attempts,
          used: storedOtp.used
        }
      );


      // ==========================================
      // 6. CHECK OTP EXPIRATION
      // ==========================================

      if (
        !storedOtp.expires_at ||
        new Date(storedOtp.expires_at) <= new Date()
      ) {

        await db.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE id = $1
          `,
          [
            storedOtp.id
          ]
        );


        console.error(
          "❌ OTP expired"
        );


        return res.status(400).json({
          success: false,
          message:
            "OTP has expired. Please request a new OTP."
        });

      }


      // ==========================================
      // 7. CHECK MAXIMUM ATTEMPTS
      // ==========================================

      const attempts =
        Number(
          storedOtp.attempts || 0
        );


      if (attempts >= 5) {

        await db.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE id = $1
          `,
          [
            storedOtp.id
          ]
        );


        console.error(
          "❌ Maximum OTP attempts reached"
        );


        return res.status(429).json({
          success: false,
          message:
            "Too many incorrect attempts. Please request a new OTP."
        });

      }


      // ==========================================
      // 8. HASH ENTERED OTP
      // ==========================================

      const submittedOtpHash =
        crypto
          .createHash("sha256")
          .update(cleanOtp)
          .digest("hex");


      // ==========================================
      // 9. COMPARE OTP HASH
      // ==========================================

      if (
        submittedOtpHash !==
        storedOtp.otp_hash
      ) {

        const updatedAttempts =
          attempts + 1;


        await db.query(
          `
          UPDATE login_otps
          SET attempts = $1
          WHERE id = $2
          `,
          [
            updatedAttempts,
            storedOtp.id
          ]
        );


        console.error(
          "❌ INVALID OTP"
        );

        console.error(
          "Attempts:",
          updatedAttempts
        );


        // ----------------------------------------
        // MAXIMUM ATTEMPTS REACHED
        // ----------------------------------------

        if (
          updatedAttempts >= 5
        ) {

          await db.query(
            `
            UPDATE login_otps
            SET used = TRUE
            WHERE id = $1
            `,
            [
              storedOtp.id
            ]
          );


          return res.status(429).json({
            success: false,
            message:
              "Too many incorrect attempts. Please request a new OTP."
          });

        }


        return res.status(401).json({
          success: false,
          message:
            "Invalid OTP."
        });

      }


      console.log(
        "✅ OTP HASH MATCHED"
      );


      // ==========================================
      // 10. FIND ACTIVE LOGIN CHALLENGE
      //
      // IMPORTANT:
      //
      // DO NOT MATCH session_id HERE.
      //
      // The OTP has already been validated against
      // the authenticated user + email.
      //
      // The send-email-otp API creates the challenge
      // using the session that existed at that time.
      //
      // The frontend can subsequently present a
      // different Supabase session ID, so requiring
      // session_id here causes:
      //
      // "Login challenge is invalid or expired."
      //
      // Therefore we find the latest active challenge
      // belonging to this user/email.
      // ==========================================

      const challengeResult =
        await db.query(
          `
          SELECT
            id,
            user_id,
            session_id,
            email,
            otp_verified,
            expires_at,
            created_at
          FROM login_challenges
          WHERE user_id = $1
            AND LOWER(email) = LOWER($2)
            AND otp_verified = FALSE
            AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [
            userId,
            cleanEmail
          ]
        );


      // ==========================================
      // 11. LOGIN CHALLENGE NOT FOUND
      // ==========================================

      if (
        challengeResult.rows.length === 0
      ) {

        console.error("");
        console.error(
          "=========================================="
        );
        console.error(
          "❌ NO ACTIVE LOGIN CHALLENGE"
        );
        console.error(
          "=========================================="
        );


        console.error(
          "Current request:"
        );


        console.error({
          userId,
          email: cleanEmail,
          currentSessionId: sessionId
        });


        // ----------------------------------------
        // DEBUG RECENT CHALLENGES
        // ----------------------------------------

        const recentChallenges =
          await db.query(
            `
            SELECT
              id,
              user_id,
              session_id,
              email,
              otp_verified,
              expires_at,
              created_at
            FROM login_challenges
            WHERE user_id = $1
              AND LOWER(email) = LOWER($2)
            ORDER BY created_at DESC
            LIMIT 10
            `,
            [
              userId,
              cleanEmail
            ]
          );


        console.error(
          "Recent login challenges:"
        );


        console.table(
          recentChallenges.rows.map(
            challenge => ({

              id:
                challenge.id,

              user_id:
                challenge.user_id,

              challenge_session_id:
                challenge.session_id,

              current_session_id:
                sessionId,

              session_match:
                String(
                  challenge.session_id
                ) ===
                String(
                  sessionId
                ),

              email:
                challenge.email,

              otp_verified:
                challenge.otp_verified,

              expires_at:
                challenge.expires_at,

              created_at:
                challenge.created_at

            })
          )
        );


        console.error(
          "=========================================="
        );
        console.error("");


        return res.status(400).json({
          success: false,
          message:
            "Login challenge is invalid or expired."
        });

      }


      // ==========================================
      // 12. GET CHALLENGE
      // ==========================================

      const challenge =
        challengeResult.rows[0];


      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "✅ LOGIN CHALLENGE FOUND"
      );
      console.log(
        "=========================================="
      );


      console.log({

        challengeId:
          challenge.id,

        challengeUserId:
          challenge.user_id,

        challengeEmail:
          challenge.email,

        challengeSessionId:
          challenge.session_id,

        currentSessionId:
          sessionId,

        sessionMatch:
          String(
            challenge.session_id
          ) ===
          String(
            sessionId
          ),

        expiresAt:
          challenge.expires_at,

        createdAt:
          challenge.created_at

      });


      console.log(
        "=========================================="
      );


      // ==========================================
      // 13. MARK LOGIN CHALLENGE AS VERIFIED
      // ==========================================

      const challengeUpdate =
        await db.query(
          `
          UPDATE login_challenges
          SET otp_verified = TRUE
          WHERE id = $1
            AND otp_verified = FALSE
          RETURNING id
          `,
          [
            challenge.id
          ]
        );


      // ==========================================
      // 14. MAKE SURE CHALLENGE WAS UPDATED
      // ==========================================

      if (
        challengeUpdate.rows.length === 0
      ) {

        console.error(
          "❌ Login challenge could not be verified"
        );


        return res.status(400).json({
          success: false,
          message:
            "Login challenge is invalid or has already been verified."
        });

      }


      console.log(
        "✅ LOGIN CHALLENGE VERIFIED"
      );


      // ==========================================
      // 15. MARK OTP AS USED
      // ==========================================

      await db.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE id = $1
        `,
        [
          storedOtp.id
        ]
      );


      console.log(
        "✅ OTP MARKED AS USED"
      );


      // ==========================================
      // 16. LOGIN OTP VERIFICATION SUCCESS
      // ==========================================

      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "✅ EMAIL OTP VERIFICATION SUCCESSFUL"
      );
      console.log(
        "=========================================="
      );


      console.log({
        userId,
        email: cleanEmail,
        sessionId,
        challengeId: challenge.id,
        otpId: storedOtp.id
      });


      console.log(
        "=========================================="
      );
      console.log("");


      // ==========================================
      // 17. SEND SUCCESS RESPONSE
      // ==========================================

      return res.json({

        success: true,

        message:
          "Email OTP verified successfully."

      });

    }

    catch (err) {

      // ==========================================
      // ERROR HANDLING
      // ==========================================

      console.error("");
      console.error(
        "=========================================="
      );
      console.error(
        "❌ VERIFY EMAIL OTP ERROR"
      );
      console.error(
        "=========================================="
      );
      console.error(err);
      console.error(
        "=========================================="
      );
      console.error("");


      return res.status(500).json({

        success: false,

        message:
          "Unable to verify OTP.",

        error:
          process.env.NODE_ENV === "production"
            ? undefined
            : err.message,

        code:
          process.env.NODE_ENV === "production"
            ? undefined
            : err.code

      });

    }

  }
);
app.delete(
  "/api/outsourced-employees/:id",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    try {

      await db.query(

        `
        DELETE FROM
        outsourced_employees

        WHERE id = $1
        `,

        [

          req.params.id

        ]

      );

      res.json({

        message:
          "Outsourced employee deleted successfully"

      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          err.message

      });

    }

  }
);
app.get(
  "/api/employees",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {
  try {
    const result =
  await db.query(
    `
    SELECT *
    FROM employees
    ORDER BY id ASC
    `
  );

    res.json(result.rows);

  }

  catch (err) {

    res.status(500).json(err);

  }

});

app.post(
  "/api/employees",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");    const {
  employee_code,
  name,

  email,
  phone,

  designation,

employee_type,
employment_status,

internship_duration,
joining_date,
confirmation_date,

  last_job_details,
  previous_experience,

  department,

  salary,

  bonus,
  deduction,

  gender,
  date_of_birth,
  uan_number,
  pf_account_number,
  esi_registration_number,
  bank_account_number,
  bank_name,
  ifsc_code,
  pan_number,
  work_start_date,
  work_end_date
} = req.body;
const finalEmploymentStatus =
  employment_status;

const finalConfirmationDate = null;

let probationEndDate = null;

let internshipEndDate = null;

if (employment_status === "Probation") {

  probationEndDate =
    new Date(joining_date);

  probationEndDate.setMonth(
    probationEndDate.getMonth() + 6
  );

}

if (employment_status === "Intern") {

  internshipEndDate =
    new Date(joining_date);

  if (
    internship_duration ===
    "3 Months"
  ) {

    internshipEndDate.setMonth(
      internshipEndDate.getMonth() + 3
    );

  }

  else {

    internshipEndDate.setMonth(
      internshipEndDate.getMonth() + 6
    );

  }

}
const grossSalary = PayrollFormula.grossSalary(salary);

const basicDA = PayrollFormula.basicDA(salary);

const hra = PayrollFormula.hra(salary);

const conveyanceAllowance =
  PayrollFormula.conveyance();

const medicalAllowance =
  PayrollFormula.medical();

const ta = conveyanceAllowance;
const ma = medicalAllowance;

const otherAllowance =
  PayrollFormula.otherAllowance(salary);

const pf =
  PayrollFormula.pf(salary);
    const result = await client.query(
      `      INSERT INTO employees
(
  employee_code,
  name,

  email,
  phone,

  designation,

  employee_type,
  employment_status,

  internship_duration,
  internship_end_date,

  joining_date,
  confirmation_date,
  probation_end_date,

  last_job_details,
  previous_experience,

  department,

  salary,

  hra,
  ta,
  ma,

  gross_salary,
  pf,

  bonus,
  deduction,

  gender,
  date_of_birth,
  uan_number,
  pf_account_number,
  esi_registration_number,
  bank_account_number,
  bank_name,
  ifsc_code,
  pan_number,
  work_start_date,
  work_end_date
)
VALUES
(
$1,$2,$3,$4,$5,
$6,$7,$8,$9,$10,
$11,$12,$13,$14,$15,
$16,$17,$18,$19,$20,
$21,$22,$23,$24,$25,
$26,$27,$28,$29,$30,
$31,$32,$33,$34
)
RETURNING *
      `,
      
  [
  employee_code,
  name,

  email,
  phone,

  designation,
  employee_type,
  finalEmploymentStatus,
  
  internship_duration,
  internshipEndDate,

  joining_date,
  finalConfirmationDate,
  probationEndDate,

  last_job_details,
  previous_experience,

  department,
  salary,

  hra,
  ta,
  ma,

  grossSalary,
  pf,
  bonus || 0,
  deduction || 0,

  gender || null,
  date_of_birth || null,
  uan_number || null,
  pf_account_number || null,
  esi_registration_number || null,
  bank_account_number || null,
  bank_name || null,
  ifsc_code || null,
  pan_number || null,
  work_start_date || null,
  work_end_date || null
]

    );

    const employeeId =
      result.rows[0].id;
    const documentTypes = [

"Offer Letter",

"Appointment Letter",

"Confirmation Letter",

"Increment Letter",

"Promotion Letter",

"Warning Letter",

"Experience Letter",

"Relieving Letter"

];

for (
const documentType
of documentTypes
) {

await client.query(

`
INSERT INTO
hr_documents
(

employee_id,

document_type

)

VALUES
(
$1,$2
)
`,

[
employeeId,
documentType
]

);

}

    await client.query(
`INSERT INTO leave_balance (employee_id, available_leaves, total_leaves_earned) VALUES ($1, 0, 0)`,
[employeeId]
);

    await client.query(
      `
      INSERT INTO activities
      (
        activity_type,
        employee_name,
        description
      )
      VALUES ($1, $2, $3)
      `,
      [
        'employee',
        name,
        `New employee  Added`
      ]
    );
    await client.query(
  `
  INSERT INTO attendance
  (
    employee_id,
    attendance_date,
    status
  )
  VALUES
  (
    $1,
    (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date,
    'Not Marked'
  )
  `,
  [employeeId]
);

    await client.query("COMMIT");

    // Notify HR
    try {
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'system', 'New Employee Added', $1)`,
        [`${name || 'New employee'} has been added to the system as ${employeeId}.`]
      );
      console.log('HR notification sent: New Employee Added -', name);
    } catch (e) { console.error('HR add employee notification failed:', e.message); }

    res.status(201).json({
      message: "Employee added successfully.",
      employee: result.rows[0]
    });

  }

  catch (err) {

    if (client) {
      await client.query("ROLLBACK").catch((rollbackError) => {
        console.error("Could not roll back employee creation:", rollbackError);
      });
    }

    console.error("Could not add employee:", err);

    const clientErrorCodes = ["22001", "22007", "22P02", "23502"];
    const status =
      err.code === "23505"
        ? 409
        : clientErrorCodes.includes(err.code)
          ? 400
          : 500;
    const message =
      err.code === "23505"
        ? "An employee with that code already exists."
        : err.code === "22001"
          ? "Employee code must be 20 characters or fewer."
          : err.code === "22007"
            ? "Enter a valid joining date."
            : err.code === "22P02"
              ? "Enter a valid salary and employee details."
              : err.code === "23502"
                ? "Please fill in all required employee details."
          : "Unable to add the employee. Please check the entered details.";

    res.status(status).json({
      message:
        process.env.NODE_ENV === "production"
          ? message
          : `${message} (${err.message})`
    });

  }

  finally {

    client?.release();

  }

});
app.post(
  "/api/employees/import",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    try {

      const {

        employee_code,

        name,

        department,

        salary,

        bonus,

        deduction

      } = req.body;
      const grossSalary = PayrollFormula.grossSalary(salary);

const basicDA = PayrollFormula.basicDA(salary);

const hra = PayrollFormula.hra(salary);

const conveyanceAllowance =
  PayrollFormula.conveyance();

const medicalAllowance =
  PayrollFormula.medical();

const ta = conveyanceAllowance;
const ma = medicalAllowance;

const otherAllowance =
  PayrollFormula.otherAllowance(salary);

const pf =
  PayrollFormula.pf(salary);
      const existingEmployee =
        await db.query(

          `
          SELECT id
          FROM employees
          WHERE employee_code = $1
          `,

          [employee_code]

        );

      if (

        existingEmployee.rows.length > 0

      ) {

        await db.query(

          `
          UPDATE employees

SET

  name = $1,

  department = $2,

  salary = $3,

  hra = $4,

  ta = $5,

  ma = $6,

  gross_salary = $7,

  pf = $8,

  bonus = $9,

  deduction = $10

WHERE employee_code = $11
          `,

          [

  name,

  department,

  salary,

  hra,

  ta,

  ma,

  grossSalary,

  pf,

  bonus || 0,

  deduction || 0,

  employee_code

]

        );

      }

      else {

        const result =
          await db.query(

            `
            INSERT INTO employees
(
  employee_code,
  name,
  department,
  salary,
  hra,
  ta,
  ma,
  gross_salary,
  pf,
  bonus,
  deduction
)
            VALUES
            (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
            )
            RETURNING *
            `,

            [

  employee_code,

  name,

  department,

  salary,

  hra,

  ta,

  ma,

  grossSalary,

  pf,

  bonus || 0,

  deduction || 0

]

          );

        const employeeId =
          result.rows[0].id;

        await db.query(

          `
          INSERT INTO leave_balance
          (
            employee_id,
            available_leaves,
            total_leaves_earned
          )
          VALUES ($1,$2,$3)
          `,

          [

            employeeId,

            2,

            2

          ]

        );

      }

      res.json({

        success: true

      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({

        error:
          "Import failed"

      });

    }

  }

);
app.put("/api/employees/:id", requireAuth, requireRole("hr"), async (req, res) => {

  try {

    const id = req.params.id;
    const oldEmployee = await db.query(
  `
  SELECT employment_status
  FROM employees
  WHERE id = $1
  `,
  [id]
);

const previousStatus =
  oldEmployee.rows[0]?.employment_status;
console.log("Employee ID:", id);
    const {

  employee_code,

  name,

  email,

  phone,

  designation,

  employee_type,

  employment_status,

  internship_duration,

  joining_date,

  confirmation_date,

  last_job_details,

  previous_experience,

  department,

  salary,

  gender,
  date_of_birth,
  uan_number,
  pf_account_number,
  esi_registration_number,
  bank_account_number,
  bank_name,
  ifsc_code,
  pan_number,
  work_start_date,
  work_end_date

} = req.body;
let probationStartDate = null;
let probationEndDate = null;

if (employment_status === "Probation") {

  const currentEmployee = await db.query(
    `
    SELECT
      employment_status,
      probation_start_date,
      probation_end_date
    FROM employees
    WHERE id = $1
    `,
    [id]
  );

  if (
    currentEmployee.rows[0].employment_status !== "Probation"
  ) {
    probationStartDate = new Date();

    probationEndDate = new Date();

    probationEndDate.setMonth(
      probationEndDate.getMonth() + 6
    );
  } else {
    probationStartDate =
      currentEmployee.rows[0].probation_start_date;

    probationEndDate =
      currentEmployee.rows[0].probation_end_date;
  }
}
    const grossSalary = PayrollFormula.grossSalary(salary);

const basicDA = PayrollFormula.basicDA(salary);

const hra = PayrollFormula.hra(salary);

const conveyanceAllowance =
  PayrollFormula.conveyance();

const medicalAllowance =
  PayrollFormula.medical();

const ta = conveyanceAllowance;
const ma = medicalAllowance;

const otherAllowance =
  PayrollFormula.otherAllowance(salary);

const pf =
  PayrollFormula.pf(salary);

  console.log("Received Data:", req.body);

    const result = await db.query(

`
UPDATE employees

SET

employee_code = $1,

name = $2,

email = $3,

phone = $4,

designation = $5,

employee_type = $6,

employment_status = $7,

internship_duration = $8,

joining_date = $9,

confirmation_date = $10,

last_job_details = $11,

previous_experience = $12,

department = $13,

salary = $14,

hra = $15,

ta = $16,

ma = $17,

gross_salary = $18,

pf = $19,

probation_start_date = $20,
probation_end_date = $21,

gender = $23,
date_of_birth = $24,
uan_number = $25,
pf_account_number = $26,
esi_registration_number = $27,
bank_account_number = $28,
bank_name = $29,
ifsc_code = $30,
pan_number = $31,
work_start_date = $32,
work_end_date = $33,

WHERE id = $34
`,[
employee_code,

name,

email,

phone,


designation,

employee_type,

employment_status,

internship_duration,

joining_date,

confirmation_date,

last_job_details,

previous_experience,

department,

salary,

hra,

ta,

ma,

grossSalary,

pf,

probationStartDate,

probationEndDate,

gender || null,
date_of_birth || null,
uan_number || null,
pf_account_number || null,
esi_registration_number || null,
bank_account_number || null,
bank_name || null,
ifsc_code || null,
pan_number || null,
work_start_date || null,
work_end_date || null,

id
]

);
console.log("Rows Updated:", result.rowCount);
if (
  previousStatus === "Probation" &&
  employment_status === "Permanent"
) {  await db.query(`UPDATE leave_balance SET available_leaves = available_leaves + 1, total_leaves_earned = total_leaves_earned + 1 WHERE employee_id = $1`, [id]);

}

    // Notify HR about employee update
    try {
      const empName = await db.query(`SELECT name FROM employees WHERE id = $1`, [req.params.id]);
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'system', 'Employee Updated', $1)`,
        [`${empName.rows[0]?.name || 'Employee'} details have been updated.`]
      );
    } catch (e) { console.error('HR update employee notification failed:', e.message); }

    res.json({
      message:

        "Employee Updated"

    });

  }

  catch (err) {

    console.error(err.stack);

    res.status(500).json({

      message: err.message

    });

  }

});
app.delete(
  "/api/employees/:id",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

  try {

    const id = req.params.id;

    await db.query(
  `
  DELETE FROM attendance
  WHERE employee_id = $1
  `,
  [id]
);

await db.query(
  `
  DELETE FROM leave_balance
  WHERE employee_id = $1
  `,
  [id]
);

await db.query(
  `
  DELETE FROM payroll
  WHERE employee_id = $1
  `,
  [id]
);

await db.query(
  `
  DELETE FROM employees
  WHERE id = $1
  `,
  [id]
);

    // Notify HR about employee deletion
    try {
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'system', 'Employee Deleted', $1)`,
        [`An employee record (ID: ${id}) has been removed from the system.`]
      );
    } catch (e) { console.error('HR delete employee notification failed:', e.message); }

    res.json({
      message: "Employee Deleted"
    });

  }

  catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
app.put(
  "/api/attendance/:id",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

  try {

    const id = req.params.id;
    const { status } = req.body;

    const attendanceResult =
      await db.query(
        `
        SELECT
          employee_id,
          status
        FROM attendance
        WHERE id = $1
        `,
        [id]
      );

    const employeeId =
      attendanceResult.rows[0].employee_id;

    const oldStatus =
      attendanceResult.rows[0].status;

    await db.query(
      `
      UPDATE attendance
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [status, id]
    );

    // Log attendance activity
    const employeeResult =
      await db.query(
        `
        SELECT name
        FROM employees
        WHERE id = $1
        `,
        [employeeId]
      );

    const employeeName =
      employeeResult.rows[0].name;

    await db.query(
      `
      INSERT INTO activities
      (
        activity_type,
        employee_name,
        description
      )
      VALUES ($1, $2, $3)
      `,
      [
        'attendance',
        employeeName,
        `${employeeName} marked ${status}`
      ]
    );

    // Return leave if changing FROM Paid Leave
    if (
      oldStatus === "Paid Leave" &&
      status !== "Paid Leave"
    ) {

      await db.query(
        `
        UPDATE leave_balance
        SET available_leaves =
          available_leaves + 1
        WHERE employee_id = $1
        `,
        [employeeId]
      );

    }

    // Deduct leave if changing TO Paid Leave
    if (
      oldStatus !== "Paid Leave" &&
      status === "Paid Leave"
    ) {

      await db.query(
        `
        UPDATE leave_balance
        SET available_leaves =
          available_leaves - 1
        WHERE employee_id = $1
          AND available_leaves > 0
        `,
        [employeeId]
      );

    }    // Create notification for HR manual attendance update
    try {
      const statusText = status === 'Present' ? 'Present' : status === 'Absent' ? 'Absent' : status;
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES ($1, 'attendance', 'Attendance Updated', $2)`,
        [employeeId, `Your attendance for today has been marked as ${statusText} by HR.`]
      );
    } catch (notifErr) {
      console.error('HR attendance notification failed:', notifErr.message);
    }

    res.json({
      message: "Attendance Updated"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }


});
app.get(
  "/api/attendance",
  requireAuth,
  async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT
  attendance.id,
  attendance.employee_id,
  employees.name,
  attendance.attendance_date,
  attendance.status,
  attendance.updated_at

      FROM attendance

      JOIN employees
      ON attendance.employee_id = employees.id

      WHERE attendance.attendance_date = (
  SELECT MAX(attendance_date)
  FROM attendance
)
AND (
  $1 = 'hr'
  OR employees.email = $2
)

      ORDER BY attendance.updated_at DESC
`,
[
  req.userRole,
  req.user.email
]
);
    res.json(result.rows);

  }

  catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
app.get(
  "/api/attendance/:date",
  requireAuth,
  async (req, res) => {

  try {

    const date = req.params.date;

    const result = await db.query(
      `
      SELECT
  attendance.id,
  attendance.employee_id,
  employees.name,
  attendance.attendance_date,
  attendance.status,
  attendance.updated_at

      FROM attendance

      JOIN employees
      ON attendance.employee_id = employees.id

      WHERE attendance.attendance_date = $1

AND (
  $2 = 'hr'
  OR employees.email = $3
)

ORDER BY employees.id ASC
`,
[
  date,
  req.userRole,
  req.user.email
]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
app.get("/api/attendance-summary", requireAuth, async (req, res) => {

  try {

    const result = await db.query(`
      SELECT
        employee_id,
        SUM(CASE WHEN status = 'Present' OR status = 'Paid Leave' THEN 1 ELSE 0 END) AS attended_days,
        COUNT(*) AS total_days,
        ROUND(
          (SUM(CASE WHEN status = 'Present' OR status = 'Paid Leave' THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100,
          2
        ) AS attendance_percentage
      FROM attendance
      GROUP BY employee_id
    `);

    res.json(result.rows);

  }
  catch (err) {

    console.log("Attendance summary error:", err.message);
    res.status(500).json({ message: err.message });

  }

});

app.get("/api/leave-balance", requireAuth, async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT
  leave_balance.employee_id,
  employees.name,
  leave_balance.available_leaves,
  leave_balance.total_leaves_earned
      FROM leave_balance

      JOIN employees
      ON leave_balance.employee_id = employees.id

      ORDER BY leave_balance.employee_id
      `
    );

    res.json(result.rows);

  }

  catch (err) {

    console.error("Leave balance error:", err.message);

    // Return empty array so frontend doesn't crash
    res.json([]);

  }

});
app.put("/api/leave-balance/:employeeId", requireAuth, requireRole("hr"), async (req, res) => {

  try {

    const employeeId = req.params.employeeId;
    const { available_leaves } = req.body;

    await db.query(
      `
      UPDATE leave_balance
      SET available_leaves = $1
      WHERE employee_id = $2
      `,
      [available_leaves, employeeId]
    );

    res.json({
      message: "Leave Balance Updated"
    });

  }
  catch (err) {

    console.log(err);
    res.status(500).json({
      message: err.message
    });

  }

});
app.post("/api/attendance/generate-today", requireAuth, requireRole("hr"), async (req, res) => {

  try {

    const result = await db.query(
      `
      INSERT INTO attendance
        (
          employee_id,
          attendance_date,
          status
        )

      SELECT
  id,
  (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date,
  'Not Marked'

      FROM employees

      WHERE id NOT IN (

        SELECT employee_id
        FROM attendance
        WHERE attendance_date =
          (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date

      )

      RETURNING *
      `
    );

    if (result.rows.length === 0) {

      res.json({
        message: "Today's attendance already exists"
      });

      return;

    }

    res.json({
      message: "Today's attendance generated"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

}); 
app.get("/api/monthly-attendance-summary", requireAuth, async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT
        employees.id,
        employees.name,

        SUM(
          CASE
            WHEN attendance.status = 'Present'
            THEN 1
            ELSE 0
          END
        ) AS present_days,

        SUM(
          CASE
            WHEN attendance.status = 'Absent'
            THEN 1
            ELSE 0
          END
        ) AS absent_days,

        SUM(
          CASE
            WHEN attendance.status = 'Paid Leave'
            THEN 1
            ELSE 0
          END
        ) AS paid_leave_days,

        ROUND(
          (
            SUM(
              CASE
                WHEN attendance.status = 'Present'
                OR attendance.status = 'Paid Leave'
                THEN 1
                ELSE 0
              END
            )::numeric
            /
            COUNT(*)
          ) * 100,
          2
        ) AS attendance_percentage

      FROM attendance

      JOIN employees
      ON attendance.employee_id = employees.id

      GROUP BY
        employees.id,
        employees.name

      ORDER BY employees.id
      `
    );

    res.json(result.rows);

  }  catch (err) {

    console.error("Monthly attendance summary error:", err.message);

    // Return empty array so frontend doesn't crash
    res.json([]);

  }


});
app.post("/api/process-monthly-leaves", requireAuth, async (req, res) => {

  try {

    const currentMonth =
      new Date().getMonth() + 1;

    const currentYear =
      new Date().getFullYear();

    // Check if leave_month_tracker table exists
    const trackerCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'leave_month_tracker'
      ) AS exists
    `);

    if (!trackerCheck.rows[0].exists) {
      return res.json({ message: "Already processed this month" });
    }

    const tracker =
      await db.query(
`SELECT * FROM leave_month_tracker LIMIT 1`
);

    if (
      tracker.rows.length > 0 &&
      tracker.rows[0].last_processed_month === currentMonth &&
      tracker.rows[0].last_processed_year === currentYear
    ) {
      return res.json({ message: "Already processed this month" });
    }

    // Check if leave_credit_history table exists
    const creditHistoryCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'leave_credit_history'
      ) AS exists
    `);

    if (!creditHistoryCheck.rows[0].exists) {
      return res.json({ message: "Already processed this month" });
    }

    const employees =
      await db.query(
`SELECT id FROM employees WHERE employment_status = 'Permanent'`
);

    for (const employee of employees.rows) {

      try {
        await db.query(
          `UPDATE leave_balance
          SET available_leaves = available_leaves + 1
          WHERE employee_id = $1`,
          [employee.id]
        );
      } catch (e) {
        // leave_balance might not have vacation/sick columns
      }

      try {
        await db.query(
          `INSERT INTO leave_credit_history
          (employee_id, credit_date, vacation_credited, sick_credited, remarks)
          VALUES ($1, CURRENT_DATE, 1, 1, 'Monthly Leave Credit')`,
          [employee.id]
        );
      } catch (e) {
        // table might not exist
      }
    }

    try {
      await db.query(
        `UPDATE leave_month_tracker
        SET last_processed_month = $1, last_processed_year = $2`,
        [currentMonth, currentYear]
      );
    } catch (e) {
      // table might not exist
    }

    res.json({ message: "Monthly leave credited successfully." });

  }
  catch (err) {
    console.error("Process monthly leaves error:", err.message);
    res.json({ message: "Already processed this month" });
  }

});
app.get(
  "/api/payroll",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        employees.id,
        employees.name,
        employees.department,

        COALESCE(employees.salary, 0) AS salary,
        COALESCE(employees.gross_salary, employees.salary) AS gross_salary,

        COALESCE(employees.bonus, 0) AS bonus,
        COALESCE(employees.deduction, 0) AS deduction,
        employees.hra_enabled,
employees.conveyance_enabled,
employees.medical_enabled,
employees.employee_pf_enabled,
employees.employer_pf_enabled,
employees.professional_tax_enabled,
employees.tds_enabled,
employees.gratuity_enabled,
employees.incentive_enabled,
employees.other_expense_enabled,
COALESCE(employees.esic_enabled, FALSE) AS esic_enabled,
COALESCE(employees.lwf_enabled, FALSE) AS lwf_enabled,

        COALESCE(
          SUM(
            CASE
              WHEN attendance.status = 'Present' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS present_days,

        COALESCE(
          SUM(
            CASE
              WHEN attendance.status = 'Absent' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS absent_days,

        COALESCE(
          SUM(
            CASE
              WHEN attendance.status = 'Paid Leave' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS paid_leave_days,

        COUNT(attendance.id) AS total_days

      FROM employees

      LEFT JOIN attendance
        ON attendance.employee_id = employees.id

      GROUP BY
        employees.id,
        employees.name,
        employees.department,
        employees.salary,
        employees.gross_salary,
        employees.bonus,
        employees.deduction

      ORDER BY employees.id ASC
    `);

    const payroll = result.rows.map((employee) => {
     const calculation = PayrollFormula.calculate({
  salary: employee.salary,
  bonus: employee.bonus,

  advance: 0,

  tds: employee.tds_enabled
    ? (employee.tds || 0)
    : 0,

  esic: employee.esic_enabled
    ? (employee.esic || 0)
    : 0,

  professionalTax: employee.professional_tax_enabled
    ? (Number(employee.deduction) || 0)
    : 0,

  lwf: employee.lwf_enabled
    ? (employee.lwf || 0)
    : 0,

  hraEnabled: employee.hra_enabled,
  conveyanceEnabled: employee.conveyance_enabled,
  medicalEnabled: employee.medical_enabled,
  employeePFEnabled: employee.employee_pf_enabled,
  employerPFEnabled: employee.employer_pf_enabled,
  gratuityEnabled: employee.gratuity_enabled,
  incentiveEnabled: employee.incentive_enabled,
  otherExpenseEnabled: employee.other_expense_enabled,
});

      return {
        ...employee,

        basic_da: calculation.basicDA,
        hra: calculation.hra,
        conveyance_allowance: calculation.conveyance,
        medical_allowance: calculation.medical,
        other_allowance: calculation.otherAllowance,

        pf: calculation.pf,

        total_deduction: calculation.totalDeduction,

        payable_salary: calculation.payableSalary,

net_pay: calculation.netPay,
      };
    });

    res.json(payroll);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});
app.put(
  "/api/payroll/:id",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

  try {

    const id = req.params.id;

    const {
      bonus,
      deduction
    } = req.body;

    await db.query(
      `
      UPDATE employees
      SET
        bonus = $1,
        deduction = $2
      WHERE id = $3
      `,
      [
        bonus,
        deduction,
        id
      ]
    );

    res.json({
      message: "Payroll Updated"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

app.get("/api/payroll/monthly", requireAuth, requireRole("hr"), async (req, res) => {
  try {
    const { month, year } = req.query;
 
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }
 
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
 
    const result = await db.query(
      `
      SELECT
        employees.id,
        employees.name,
        employees.department,
        COALESCE(employees.salary, 0) AS salary,
        COALESCE(employees.gross_salary, employees.salary) AS gross_salary,
        COALESCE(employees.bonus, 0) AS bonus,
        COALESCE(employees.deduction, 0) AS deduction,
        employees.hra_enabled,
        employees.conveyance_enabled,
        employees.medical_enabled,
        employees.employee_pf_enabled,
        employees.employer_pf_enabled,
        employees.professional_tax_enabled,
        employees.tds_enabled,
        employees.gratuity_enabled,
        employees.incentive_enabled,
        employees.other_expense_enabled,
        COALESCE(employees.esic_enabled, FALSE) AS esic_enabled,
        COALESCE(employees.lwf_enabled, FALSE) AS lwf_enabled,
        COALESCE(
          SUM(CASE WHEN attendance.status = 'Present' THEN 1 ELSE 0 END), 0
        ) AS present_days,
        COALESCE(
          SUM(CASE WHEN attendance.status = 'Absent' THEN 1 ELSE 0 END), 0
        ) AS absent_days,
        COALESCE(
          SUM(CASE WHEN attendance.status = 'Paid Leave' THEN 1 ELSE 0 END), 0
        ) AS paid_leave_days,
        COUNT(attendance.id) AS total_days
      FROM employees
      LEFT JOIN attendance
        ON attendance.employee_id = employees.id
        AND attendance.attendance_date >= $1
        AND attendance.attendance_date <= $2
      GROUP BY
        employees.id, employees.name, employees.department, employees.salary,
        employees.gross_salary, employees.bonus, employees.deduction,
        employees.hra_enabled, employees.conveyance_enabled,
        employees.medical_enabled, employees.employee_pf_enabled,
        employees.employer_pf_enabled, employees.professional_tax_enabled,
        employees.tds_enabled, employees.gratuity_enabled,
        employees.incentive_enabled, employees.other_expense_enabled,
        employees.esic_enabled, employees.lwf_enabled
      ORDER BY employees.id ASC
      `,
      [startDate, endDate]
    );
 
    const payroll = result.rows.map((employee) => {
      const calculation = PayrollFormula.calculate({
        salary: employee.salary,
        bonus: employee.bonus,
        advance: 0,
        tds: employee.tds_enabled ? (employee.tds || 0) : 0,
        esic: employee.esic_enabled ? (employee.esic || 0) : 0,
        professionalTax: employee.professional_tax_enabled
          ? (Number(employee.deduction) || 0)
          : 0,
        lwf: employee.lwf_enabled ? (employee.lwf || 0) : 0,
        hraEnabled: employee.hra_enabled,
        conveyanceEnabled: employee.conveyance_enabled,
        medicalEnabled: employee.medical_enabled,
        employeePFEnabled: employee.employee_pf_enabled,
        employerPFEnabled: employee.employer_pf_enabled,
        gratuityEnabled: employee.gratuity_enabled,
        incentiveEnabled: employee.incentive_enabled,
        otherExpenseEnabled: employee.other_expense_enabled,
      });
 
      return {
        ...employee,
        basic_da: calculation.basicDA,
        hra: calculation.hra,
        conveyance_allowance: calculation.conveyance,
        medical_allowance: calculation.medical,
        other_allowance: calculation.otherAllowance,
        pf: calculation.pf,
        total_deduction: calculation.totalDeduction,
        payable_salary: calculation.payableSalary,
        net_pay: calculation.netPay,
      };
    });
 
    res.json(payroll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/payroll/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT *
      FROM employees
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const employee = result.rows[0];

    const attendanceSummary = await db.query(
  `
  SELECT
    COUNT(*) FILTER (WHERE status = 'Present') AS present_days,
    COUNT(*) FILTER (WHERE status = 'Absent') AS absent_days,
    COUNT(*) FILTER (WHERE status = 'Paid Leave') AS paid_leave_days,
    COUNT(*) AS total_days
  FROM attendance
  WHERE employee_id = $1
  `,
  [id]
);

const attendance = attendanceSummary.rows[0];

    const calculation = PayrollFormula.calculate({
  salary: employee.salary,

  bonus: employee.bonus,
  advance: employee.advance || 0,
  tds: employee.tds || 0,
  esic: employee.esic || 0,
  professionalTax: employee.professional_tax || 0,
  lwf: employee.lwf || 0,

  hraEnabled: employee.hra_enabled,
  conveyanceEnabled: employee.conveyance_enabled,
  medicalEnabled: employee.medical_enabled,
  employeePFEnabled: employee.employee_pf_enabled,
  employerPFEnabled: employee.employer_pf_enabled,
  gratuityEnabled: employee.gratuity_enabled,
  incentiveEnabled: employee.incentive_enabled,
  otherExpenseEnabled: employee.other_expense_enabled,
});

    res.json({

  ...employee,

  // Salary Breakdown
  gross_salary: calculation.grossSalary,
  basic_da: calculation.basicDA,
  hra: calculation.hra,
  conveyance_allowance: calculation.conveyance,
  medical_allowance: calculation.medical,
  other_allowance: calculation.otherAllowance,

  // Employee Deductions
  pf: calculation.pf,
  esic: calculation.esic,
  professional_tax: calculation.professionalTax,
  lwf: calculation.lwf,
  tds: calculation.tds,
  advance: calculation.advance,
  total_deduction: calculation.totalDeduction,

  // Employer Contributions
  employer_pf: calculation.employerPF,
  employer_esic: calculation.employerESIC,
  employer_lwf: calculation.employerLWF,
  gratuity: calculation.gratuityEmployer,

  // CTC
  monthly_ctc: calculation.monthlyCTC,
  annual_ctc: calculation.annualCTC,

  // Final Salary
  bonus: calculation.bonus,
  net_pay: calculation.netPay,
  payable_salary: calculation.payableSalary,

  present_days: Number(attendance.present_days),
absent_days: Number(attendance.absent_days),
paid_leave_days: Number(attendance.paid_leave_days),
total_days: Number(attendance.total_days),

});
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});
app.put(  "/api/employees/:id/payroll-settings", requireAuth, requireRole("hr"), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      hra,
      conveyance,
      medical,
      employeePF,
      employerPF,
      professionalTax,
      tds,
      gratuity,
      incentive,
      otherExpense,
      esic,
      lwf,
    } = req.body;

    const result = await db.query(
      `UPDATE employees
       SET
         hra_enabled = $1,
         conveyance_enabled = $2,
         medical_enabled = $3,
         employee_pf_enabled = $4,
         employer_pf_enabled = $5,
         professional_tax_enabled = $6,
         tds_enabled = $7,
         gratuity_enabled = $8,
         incentive_enabled = $9,
         other_expense_enabled = $10,
         esic_enabled = COALESCE($11, FALSE),
         lwf_enabled = COALESCE($12, FALSE)
       WHERE id = $13
       RETURNING *`,
      [
        hra,
        conveyance,
        medical,
        employeePF,
        employerPF,
        professionalTax,
        tds,
        gratuity,
        incentive,
        otherExpense,
        esic || false,
        lwf || false,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update payroll settings",
    });
  }
});
app.get(
  "/api/recent-activities",
  requireAuth,
  async (req, res) => {

    try {

      const result =
  await db.query(
    `
    SELECT *
    FROM activities

    WHERE
      (
        created_at
        AT TIME ZONE
        'Asia/Kolkata'
      )::date =
      (
        CURRENT_TIMESTAMP
        AT TIME ZONE
        'Asia/Kolkata'
      )::date

    ORDER BY
      created_at DESC

    LIMIT 3
    `
  )

      res.json(result.rows)

    }

    catch (err) {

      console.error("Recent activities error:", err.message)

      // Return empty array so frontend doesn't crash
      res.json([])

    }

  }
)
app.get(
  "/api/leaves",
  requireAuth,
  async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT
        leaves_table.*,
        employees.name AS employee_name

      FROM leaves_table

      JOIN employees
      ON leaves_table.employee_id =
         employees.id

      ORDER BY leaves_table.id DESC
      `
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});

app.post(
  "/api/leaves",
  requireAuth,
  async (req, res) => {

  try {

    const {
  employee_id,
  leave_type,
  half_day_session,
  start_date,
  end_date,
  reason
} = req.body;
    const employee = await db.query(
  `
  SELECT
    employment_status
  FROM employees
  WHERE id = $1
  `,
  [employee_id]
);

if (employee.rows.length === 0) {

  return res.status(404).json({
    message: "Employee not found"
  });

}

const employmentStatus =
  employee.rows[0].employment_status;
if (
  employmentStatus === "Probation"
) {

  if (
    leave_type === "Vacation Leave" ||

    leave_type === "Sick Leave" ||

    leave_type === "Half Day"
  ) {

    return res.status(400).json({

      message:
        "You are on probation. Vacation Leave, Sick Leave and Half Day Leave are not available until confirmation."

    });

  }

}
    await db.query(
      `
      INSERT INTO leaves_table
(
employee_id,
leave_type,
half_day_session,
start_date,
end_date,
reason,
status
)
     VALUES
(
$1,
$2,
$3,
$4,
$5,
$6,
$7
)
      `,
      [
employee_id,
leave_type,
half_day_session,
start_date,
end_date,
reason,
'Pending'
]
    );

    // Create notification for leave application
    try {
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES ($1, 'leave', 'Leave Application Submitted', $2)`,
        [employee_id, `Your ${leave_type} request (${start_date} to ${end_date}) has been submitted and is pending approval.`]
      );
      // Notify HR
      try {
        const empName = await db.query(`SELECT name FROM employees WHERE id = $1`, [employee_id]);
        await db.query(
          `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'leave', 'New Leave Application', $1)`,
          [`${empName.rows[0]?.name || 'Employee'} has applied for ${leave_type} (${start_date} to ${end_date}).`]
        );
      } catch (e) { console.error('HR leave notification failed:', e.message); }
    } catch (notifErr) {
      console.error('Leave apply notification failed:', notifErr.message);
    }

    res.json({
      message:
        "Leave Applied"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});

app.put(
  "/api/leaves/:id",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    try {

      const id = req.params.id;
      const { status } = req.body;

      // ==========================================
      // 1. VALIDATE STATUS
      // ==========================================

      if (!["Approved", "Rejected"].includes(status)) {

        return res.status(400).json({
          message: "Invalid leave status."
        });

      }


      // ==========================================
      // 2. GET THE LEAVE REQUEST
      // ==========================================

      const leaveResult = await db.query(
        `
        SELECT
          id,
          employee_id,
          leave_type,
          start_date,
          end_date,
          status
        FROM leaves_table
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );


      if (leaveResult.rows.length === 0) {

        return res.status(404).json({
          message: "Leave request not found."
        });

      }


      const leave = leaveResult.rows[0];


      // ==========================================
      // 3. PREVENT APPROVING AN ALREADY APPROVED
      // ==========================================

      if (leave.status === "Approved") {

        return res.status(400).json({
          message: "Leave has already been approved."
        });

      }


      // ==========================================
      // 4. CALCULATE LEAVE DAYS
      // ==========================================

      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      const difference =
        Math.ceil(
          (end - start) /
          (1000 * 60 * 60 * 24)
        ) + 1;


      const leaveDays =
        leave.leave_type === "Half Day"
          ? 0.5
          : difference;


      // ==========================================
      // 5. CHECK LEAVE BALANCE
      // ==========================================

      if (
        status === "Approved" &&
        leave.leave_type !== "Unpaid Leave"
      ) {

        const balanceResult = await db.query(
          `
          SELECT available_leaves
          FROM leave_balance
          WHERE employee_id = $1
          `,
          [leave.employee_id]
        );


        if (balanceResult.rows.length === 0) {

          return res.status(400).json({
            message: "Leave balance record not found."
          });

        }


        const availableLeaves =
          Number(
            balanceResult.rows[0].available_leaves
          );


        if (availableLeaves < leaveDays) {

          return res.status(400).json({
            message:
              `Insufficient leave balance. Employee has only ${availableLeaves} leave(s).`
          });

        }

      }


      // ==========================================
      // 6. UPDATE LEAVE STATUS
      // ==========================================

      await db.query(
        `
        UPDATE leaves_table
        SET status = $1
        WHERE id = $2
        `,
        [
          status,
          id
        ]
      );


      // ==========================================
      // 7. IF APPROVED
      // ==========================================

      if (status === "Approved") {


        // ------------------------------------------
        // Deduct leave balance
        // ------------------------------------------

        if (leave.leave_type !== "Unpaid Leave") {

          await db.query(
            `
            UPDATE leave_balance
            SET available_leaves =
                available_leaves - $1
            WHERE employee_id = $2
            `,
            [
              leaveDays,
              leave.employee_id
            ]
          );

        }


        // ------------------------------------------
        // Determine attendance status
        // ------------------------------------------

        let attendanceStatus;


        if (leave.leave_type === "Half Day") {

          attendanceStatus = "Present";

        }

        else if (leave.leave_type === "Unpaid Leave") {

          attendanceStatus = "Absent";

        }

        else {

          attendanceStatus = "Paid Leave";

        }


                const currentDate =
          new Date(leave.start_date);

        const lastDate =
          new Date(leave.end_date);


        while (currentDate <= lastDate) {

          const attendanceResult =
            await db.query(
              `
              INSERT INTO attendance
              (
                employee_id,
                attendance_date,
                status,
                updated_at
              )
              VALUES
              (
                $1,
                $2,
                $3,
                CURRENT_TIMESTAMP
              )
              ON CONFLICT
              (
                employee_id,
                attendance_date
              )
              DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP
              `,
              [
                leave.employee_id,
                currentDate
                  .toISOString()
                  .split("T")[0],
                attendanceStatus
              ]
            );


          currentDate.setDate(
            currentDate.getDate() + 1
          );

        }

      }


      // ==========================================
      // 8. CREATE NOTIFICATION
      // ==========================================

      await db.query(
        `
        INSERT INTO notifications
        (
          employee_id,
          type,
          title,
          body
        )
        VALUES
        (
          $1,
          'leave',
          $2,
          $3
        )
        `,
        [
          leave.employee_id,

          status === "Approved"
            ? "Leave Approved"
            : "Leave Rejected",

          status === "Approved"
            ? `Your ${leave.leave_type} request (${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}) has been approved.`
            : `Your ${leave.leave_type} request (${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}) has been rejected.`
        ]
      );


      // ==========================================
      // 9. SUCCESS RESPONSE
      // ==========================================

      return res.json({
        message: "Leave Updated"
      });


    }

    catch (err) {

      console.error(
        "Leave update error:",
        err
      );

      return res.status(500).json({
        message:
          err.message ||
          "Failed to update leave."
      });

    }

  }
);
app.get("/api/performance", requireAuth, async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT *
      FROM performance

      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
app.post("/api/performance", requireAuth, async (req, res) => {

  try {

    const {

      employee_name,

      rating,

      feedback

    } = req.body;

    await db.query(
      `
      INSERT INTO performance
      (

        employee_name,

        rating,

        feedback

      )

      VALUES ($1, $2, $3)
      `,
      [

        employee_name,

        rating,

        feedback

      ]
    );

    res.json({

      message:
        "Performance Added"

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
app.get(
  "/api/performance-reviews",
  requireAuth,
  async (req, res) => {

    try {

      const result =
        await db.query(
          `
          SELECT

performance_reviews.*,

employees.salary,

employees.name

FROM performance_reviews

JOIN employees

ON employees.id =
   performance_reviews.employee_id


          ORDER BY review_date DESC
          `
        );

      res.json(
        result.rows
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.post(
  "/api/performance-reviews",
  requireAuth,
  async (req, res) => {

    try {

      const {

        employee_id,

        review_date,

        rating,

        kpi_score,

        manager_remarks

      } = req.body;

      let incrementPercentage = 0;

      if (rating >= 4.5)
        incrementPercentage = 15;

      else if (rating >= 4.0)
        incrementPercentage = 10;

      else if (rating >= 3.5)
        incrementPercentage = 5;

      const employee =
        await db.query(
          `
          SELECT salary
          FROM employees
          WHERE id = $1
          `,
          [employee_id]
        );

      const basicSalary =
        Number(
          employee.rows[0].salary
        );

      const incrementAmount =
        (
          basicSalary *
          incrementPercentage
        ) / 100;

      await db.query(
        `
        INSERT INTO
        performance_reviews
        (

          employee_id,

          review_date,

          rating,

          kpi_score,

          manager_remarks,

          increment_percentage,

          increment_amount

        )

        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7
        )
        `,
        [

          employee_id,

          review_date,

          rating,

          kpi_score,

          manager_remarks,

          incrementPercentage,

          incrementAmount

        ]
      );

      // Create notification for increment/performance review
      try {
        if (incrementAmount > 0) {
          await db.query(
            `INSERT INTO notifications (employee_id, type, title, body) VALUES ($1, 'payroll', 'Salary Increment Approved', $2)`,
            [employee_id, `Congratulations! You have received a ${incrementPercentage}% increment (₹${Number(incrementAmount).toLocaleString('en-IN')}/month) based on your rating of ${rating}/5.`]
          );
        }
        // Notify HR
        const empName = await db.query(`SELECT name FROM employees WHERE id = $1`, [employee_id]);
        await db.query(
          `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'payroll', 'Performance Review Added', $1)`,
          [`${empName.rows[0]?.name || 'Employee'} rated ${rating}/5${incrementAmount > 0 ? ` with ${incrementPercentage}% increment` : ''}.`]
        );
      } catch (notifErr) {
        console.error('Increment notification failed:', notifErr.message);
      }

      res.json({
        message:
          "Performance Review Added"
      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.put(
  "/api/performance-reviews/:id",
  requireAuth,
  async (req, res) => {

    try {

      const {
        rating,
        kpi_score,
        manager_remarks
      } = req.body;

      let incrementPercentage = 0;

      if (rating >= 4.5)
        incrementPercentage = 15;

      else if (rating >= 4.0)
        incrementPercentage = 10;

      else if (rating >= 3.5)
        incrementPercentage = 5;

      const review =
        await db.query(
          `
          SELECT
            performance_reviews.*,
            employees.salary

          FROM performance_reviews

          JOIN employees

          ON employees.id =
             performance_reviews.employee_id

          WHERE performance_reviews.id = $1
          `,
          [req.params.id]
        );
        if (
  review.rows[0]
    .increment_applied
) {

  return res.status(400).json({
    message:
      "Increment already applied"
  });

}

      const salary =
        Number(
          review.rows[0].salary
        );

      const incrementAmount =
        (
          salary *
          incrementPercentage
        ) / 100;

      const result =
        await db.query(
          `
          UPDATE performance_reviews

          SET

          rating = $1,

          kpi_score = $2,

          manager_remarks = $3,

          increment_percentage = $4,

          increment_amount = $5

          WHERE id = $6

          RETURNING *
          `,
          [
            rating,
            kpi_score,
            manager_remarks,
            incrementPercentage,
            incrementAmount,
            req.params.id
          ]
        );

      res.json(
        result.rows[0]
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.delete(
  "/api/performance-reviews/:id",
  requireAuth,
  async (req, res) => {

    try {

      await db.query(
        `
        DELETE FROM
        performance_reviews
        WHERE id = $1
        `,
        [req.params.id]
      );

      res.json({
        message:
          "Review Deleted"
      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.put(
  "/api/apply-increment/:id",
  requireAuth,
  async (req, res) => {

    try {

      const review =
        await db.query(
          `
          SELECT

performance_reviews.*,

employees.salary,

employees.name

FROM performance_reviews

          JOIN employees

          ON employees.id =
             performance_reviews.employee_id

          WHERE performance_reviews.id = $1
          `,
          [req.params.id]
        );

      if (
        review.rows.length === 0
      ) {

        return res.status(404).json({
          message:
            "Review not found"
        });

      }

      const reviewData = review.rows[0];
      const employeeId = reviewData.employee_id;
      const currentSalary = Number(reviewData.salary) || 0;
      const incrementPercent = Number(reviewData.increment_percentage) || 0;
      const incrementAmount = Math.round(currentSalary * incrementPercent / 100);
      const newSalary = currentSalary + incrementAmount;

      const grossSalary = PayrollFormula.grossSalary(newSalary);

const basicDA = PayrollFormula.basicDA(newSalary);

const hra = PayrollFormula.hra(newSalary);

const conveyanceAllowance =
  PayrollFormula.conveyance();

const medicalAllowance =
  PayrollFormula.medical();

const ta = conveyanceAllowance;
const ma = medicalAllowance;

const otherAllowance =
  PayrollFormula.otherAllowance(newSalary);

const pf =
  PayrollFormula.pf(newSalary);

      await db.query(
        `
        UPDATE employees

SET

salary = $1,

hra = $2,

ta = $3,

ma = $4,

gross_salary = $5,

pf = $6

WHERE id = $7
        `,
        [
          newSalary,
          hra,
          ta,
          ma,
          grossSalary,
          pf,
          employeeId
        ]
      );
      
      const historyResult =
await db.query(
  `
  INSERT INTO increment_history
  (
    employee_id,
    employee_name,
    old_salary,
    increment_percent,
    increment_amount,
    new_salary
  )
  VALUES
  (
    $1,$2,$3,$4,$5,$6
  )
  RETURNING *
  `,
  [
    employeeId,
    review.rows[0].name,
    currentSalary,
    review.rows[0].increment_percentage,
    incrementAmount,
    newSalary
  ]
);


      await db.query(
  `
  UPDATE performance_reviews

  SET increment_applied = TRUE

  WHERE id = $1
  `,
  [req.params.id]
)

      res.json({

        message:
          "Increment Applied",

        newSalary

      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.get(
  "/api/hr-documents",
  requireAuth,
  async (req, res) => {

    try {

      const result =
        await db.query(
          `
          SELECT

          hr_documents.*,

          employees.name

          FROM hr_documents

          JOIN employees

          ON hr_documents.employee_id =
             employees.id

          ORDER BY employees.name
          `
        );

      res.json(
        result.rows
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.post(
  "/api/hr-documents",
  requireAuth,
  async (req, res) => {

    try {

      const {

        employee_id,

        document_type

      } = req.body;
      const existing =
await db.query(
  `
  SELECT *
  FROM hr_documents

  WHERE employee_id = $1
  AND document_type = $2
  `,
  [
    employee_id,
    document_type
  ]
);

if (
  existing.rows.length > 0
) {

  return res.status(400)
  .json({
    message:
      "Document already exists"
  });

}
      const result =
        await db.query(
          `
          INSERT INTO
          hr_documents
          (

            employee_id,

            document_type

          )

          VALUES
          (
            $1,$2
          )

          RETURNING *
          `,
          [

            employee_id,

            document_type

          ]
        );

      res.json(
        result.rows[0]
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }  }
);
app.delete(
  "/api/hr-documents/:id",
  requireAuth,
  async (req, res) => {

    try {

      await db.query(
        `
        DELETE FROM
        hr_documents
        WHERE id = $1
        `,
        [req.params.id]
      );

      res.json({
        message:
          "Document Deleted"
      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.put(
  "/api/hr-documents/:id",
  requireAuth,
  async (req, res) => {

    try {

      const {
        status
      } = req.body;

      const uploadDate =

status === "Uploaded"

? new Date()

: null;

await db.query(
  `
  UPDATE hr_documents

  SET

  status = $1,

  upload_date = $2

  WHERE id = $3
  `,
  [
    status,
    uploadDate,
    req.params.id
  ]
);
      res.json({
        message:
          "Document Updated"
      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.get(
  "/api/increment-history",
  requireAuth,
  async (req, res) => {

    try {

      const result =
        await db.query(
          `
          SELECT *

          FROM increment_history

          ORDER BY
          effective_date DESC,
          id DESC
          `
        );

      res.json(
        result.rows
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);

// javascript
app.get("/api/increment-history/monthly", requireAuth, async (req, res) => {
  try {
    const { month, year } = req.query;
 
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }
 
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
 
    const result = await db.query(
      `
      SELECT *
      FROM increment_history
      WHERE effective_date >= $1 AND effective_date <= $2
      ORDER BY effective_date DESC, id DESC
      `,
      [startDate, endDate]
    );
 
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }});
app.get(
  "/api/leave-balance/:employeeId",
  requireAuth,
  async (req, res) => {

    try {

      const result =
        await db.query(
          `
          SELECT *

          FROM leave_balance

          WHERE employee_id = $1
          `,
          [req.params.employeeId]
        );

      res.json(
        result.rows[0]
      );

    }

    catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);
app.put(
  "/api/confirm-employee/:id",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {    try {

      const employee =
await db.query(
`
SELECT

employment_status,
probation_end_date

FROM employees

WHERE id = $1
`,
[req.params.id]
);

      if (
        employee.rows.length === 0
      ) {

        return res.status(404).json({
          message: "Employee not found"
        });

      }

const employeeData =
employee.rows[0];

      if (
        employeeData.employment_status ===
        "Permanent"
      ) {

        return res.status(400).json({
          message:
            "Employee is already permanent"
        });

      }

if (
  employeeData.probation_end_date
) {
const today =
new Date();
const probationEnd =
new Date(
employeeData.probation_end_date
);
if (
today < probationEnd
) {
return res.status(400).json({
message:
"Probation period is not over yet."
});
}
}

      await db.query(
        `
        UPDATE employees

        SET

        employment_status = 'Permanent',

        confirmation_date =
        CURRENT_DATE

        WHERE id = $1
        `,
        [req.params.id]
      );
      console.log("Employee updated to Permanent");      await db.query(`UPDATE leave_balance SET available_leaves = available_leaves + 2, total_leaves_earned = total_leaves_earned + 2 WHERE employee_id = $1`, [req.params.id]);

      res.json({

        message:
          "Employee confirmed successfully"

      });

    }

    catch (err) {

      console.log(err);

      res.status(500).json(err);

    }

  }
);
app.put("/api/employees/:id/accept-terms", requireAuth, async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(
      `
      UPDATE employees
      SET terms_accepted_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Terms accepted successfully."
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});
app.put("/api/employees/:id/face-enroll", requireAuth, async (req, res) => {

  try {

    const { id } = req.params;
    const { face_descriptor } = req.body;

    const existing = await db.query(
      `
      SELECT id, name, employee_code, face_descriptor
      FROM employees
      WHERE face_descriptor IS NOT NULL
      AND id != $1
      `,
      [id]
    );

    function euclideanDistance(a, b) {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
      }
      return Math.sqrt(sum);
    }

    for (const row of existing.rows) {

      const storedDescriptor = JSON.parse(row.face_descriptor);
      const distance = euclideanDistance(storedDescriptor, face_descriptor);

      if (distance < 0.6) {

        return res.status(409).json({
          success: false,
          message: `This face is already enrolled under ${row.name} (${row.employee_code || 'EMP' + row.id}). Each employee must enroll with their own face.`
        });

      }

    }

    await db.query(
      `
      UPDATE employees
      SET face_descriptor = $1
      WHERE id = $2
      `,
      [JSON.stringify(face_descriptor), id]
    );

    res.json({
      success: true,
      message: "Face enrolled successfully."
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});
app.get("/api/employee-dashboard/:id", requireAuth, async (req, res) => {

  try {

    const { id } = req.params;

    // Employee
    const employee = await db.query(
      `SELECT * FROM employees WHERE id = $1`,
      [id]
    );

    if (employee.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    // Attendance
    const attendance = await db.query(
      `
      SELECT *
      FROM attendance
      WHERE employee_id = $1
      ORDER BY attendance_date DESC
      `,
      [id]
    );

    // Attendance Summary
    const attendanceSummary = await db.query(
      `
      SELECT
      COUNT(*) FILTER (WHERE status='Present') AS present_days,
      COUNT(*) FILTER (WHERE status='Absent') AS absent_days,
      COUNT(*) FILTER (WHERE status='Paid Leave') AS paid_leave_days,
      COUNT(*) AS total_days
      FROM attendance
      WHERE employee_id = $1
      `,
      [id]
    );

    // Leave Balance
    const leaveBalance = await db.query(
      `
      SELECT *
      FROM leave_balance
      WHERE employee_id = $1
      `,
      [id]
    );
    const leaves = await db.query(
`
SELECT *
FROM leaves_table
WHERE employee_id = $1
ORDER BY id DESC
`,
[id]
);
    // Performance
    const performance = await db.query(
`
SELECT *
FROM performance
WHERE employee_name = $1
ORDER BY created_at DESC
`,
[
  employee.rows[0].name
]
);

    // Salary Increments
    const increments = await db.query(
`
SELECT *
FROM increment_history
WHERE employee_id = $1
ORDER BY effective_date DESC
`,
[id]
);

    res.json({

  employee: employee.rows[0],

  attendance: attendance.rows,

  attendanceSummary:
    attendanceSummary.rows[0],

  leaveBalance:
    leaveBalance.rows[0] || null,

  leaves:
    leaves.rows,

  performance:
    performance.rows,

  increments:
    increments.rows,

  payableSalary:
    employee.rows[0].gross_salary

});

  }

  catch(err){

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

app.get("/api/employees/by-email/:email", requireAuth, async (req, res) => {

  try {

    const { email } = req.params;

    const result = await db.query(
      `
      SELECT *
      FROM employees
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Employee not found"
      });

    }

    res.json(result.rows[0]);

  }

  catch(err){

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});
app.post("/api/attendance/self-mark", requireAuth, async (req, res) => {
console.log("Attendance API Hit");
console.log(req.body);
  try {

    const {
      employee_id,
      photo_url,
      latitude,
      longitude,
      face_match,
      face_distance,
      attendance_type
    } = req.body;

    // Face not detected
    if (!face_match) {

      return res.status(400).json({
        success: false,
        message: "Face not detected."
      });

    }

    // Check today's attendance
    const todayAttendance = await db.query(
      `
      SELECT *
      FROM attendance
      WHERE employee_id = $1
      AND attendance_date =
      (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
      `,
      [employee_id]
    );

    if (todayAttendance.rows.length > 0) {

      await db.query(
        `
        UPDATE attendance

        SET        status = 'Present',

        photo_url = $1,

        latitude = $2,

        longitude = $3,

        face_match_distance = $4,

        attendance_type = $6,

        marked_at = CURRENT_TIMESTAMP,

        updated_at = CURRENT_TIMESTAMP

        WHERE employee_id = $5

        AND attendance_date =
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date

        `,

        [

          photo_url,

          latitude,

          longitude,

          face_distance,

          employee_id,

          attendance_type || null

        ]
      );

    }

    else {

      await db.query(
        `        INSERT INTO attendance
        (

          employee_id,

          attendance_date,

          status,

          photo_url,

          latitude,

          longitude,

          face_match_distance,

          attendance_type,

          marked_at
        )

        VALUES

        (

          $1,

          (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date,

          'Present',

          $2,

          $3,

          $4,

          $5,

          $6,

          CURRENT_TIMESTAMP
        )

        `,

        [

          employee_id,

          photo_url,

          latitude,

          longitude,

          face_distance,

          attendance_type || null
        ]
      );

    }    // Create notification for attendance marked
    try {
      const empResult = await db.query(`SELECT name FROM employees WHERE id = $1`, [employee_id]);
      const empName = empResult.rows[0]?.name || 'Employee';
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES ($1, 'attendance', 'Attendance Marked', $2)`,
        [employee_id, `${empName}, your attendance has been marked as Present for today.`]
      );
      // Notify HR
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'attendance', 'Employee Attendance', $1)`,
        [`${empName} has marked attendance as Present today.`]
      );
    } catch (notifErr) {
      console.error('Attendance notification failed:', notifErr.message);
    }

    res.json({
      success: true,
      message: "Attendance marked successfully."
    });

  }
  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }});

// ============================================
// SELF-MARK EXIT
// ============================================
app.post("/api/attendance/self-mark-exit", requireAuth, async (req, res) => {
  try {
    const { employee_id, latitude, longitude, face_match } = req.body;

    if (!face_match) {
      return res.status(400).json({ success: false, message: "Face not detected." });
    }

    // Get today's attendance record
    const todayAttendance = await db.query(
      `SELECT * FROM attendance
       WHERE employee_id = $1
       AND attendance_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
      [employee_id]
    );

    if (todayAttendance.rows.length === 0) {
      return res.status(400).json({ success: false, message: "No check-in found for today." });
    }

    await db.query(
      `UPDATE attendance
       SET check_out_time = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $1
       AND attendance_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
      [employee_id]
    );

    res.json({ success: true, message: "Exit marked successfully." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/employees/:id", requireAuth, async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT *
      FROM employees
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Employee not found"
      });

    }

    res.json(result.rows[0]);

  }

  catch (err) {

    console.log(err);
    res.status(500).json({
      message: err.message
    });

  }

});
// ============================================
// CRON: Daily Absent Notification at 11:59 PM
// ============================================
cron.schedule("59 23 * * *", async () => {
  try {
    console.log("Running daily attendance summary at 11:59 PM...");
    const today = new Date().toISOString().split('T')[0];

    // Count total active employees
    const totalResult = await db.query(
      `SELECT COUNT(*) AS total FROM employees WHERE employment_status IN ('Permanent', 'Probation', 'Intern')`
    );
    const totalEmployees = Number(totalResult.rows[0]?.total || 0);

    // Count present employees today
    const presentResult = await db.query(
      `SELECT COUNT(DISTINCT employee_id) AS present FROM attendance WHERE attendance_date = $1 AND status = 'Present'`,
      [today]
    );
    const presentCount = Number(presentResult.rows[0]?.present || 0);

    // Count on leave today
    const leaveResult = await db.query(
      `SELECT COUNT(DISTINCT employee_id) AS on_leave FROM attendance WHERE attendance_date = $1 AND status = 'Paid Leave'`,
      [today]
    );
    const leaveCount = Number(leaveResult.rows[0]?.on_leave || 0);

    // Absent = total - present - leave
    const absentCount = Math.max(0, totalEmployees - presentCount - leaveCount);

    console.log(`Today: Present=${presentCount}, Absent=${absentCount}, Leave=${leaveCount}, Total=${totalEmployees}`);

    // Get list of absent employee names
    let absentNames = '';
    if (absentCount > 0) {
      const absentResult = await db.query(
        `SELECT e.name FROM employees e
         WHERE e.employment_status IN ('Permanent', 'Probation', 'Intern')
         AND e.id NOT IN (
           SELECT a.employee_id FROM attendance a WHERE a.attendance_date = $1
         )
         ORDER BY e.name ASC`,
        [today]
      );
      absentNames = absentResult.rows.map(r => r.name).join(', ');
    }

    // Send ONE summary notification to HR
    const summaryBody = [
      `📊 Attendance Summary for ${today}`,
      `✅ Present: ${presentCount}`,
      `❌ Absent: ${absentCount}`,
      `🌴 On Leave: ${leaveCount}`,
      `👥 Total: ${totalEmployees}`,
      absentNames ? `\nAbsent employees: ${absentNames}` : '',
    ].filter(Boolean).join('\n');

    await db.query(
      `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'attendance', 'Daily Attendance Summary', $1)`,
      [summaryBody]
    );
    console.log('Daily attendance summary notification sent to HR.');

  } catch (err) {
    console.error("Daily attendance summary cron failed:", err.message);
  }
});

cron.schedule("0 0 1 * *", async () => {

  try {

    console.log("Monthly leave credit started...");    await db.query(
      `
      UPDATE leave_balance
      SET
      available_leaves = available_leaves + 2,
      total_leaves_earned = total_leaves_earned + 2
      WHERE employee_id IN (

        SELECT id
        FROM employees
        WHERE employment_status = 'Permanent'

      )
      `
    );

    // Notify all permanent employees about leave credit
    try {
      const permanentEmps = await db.query(`SELECT id FROM employees WHERE employment_status = 'Permanent'`);
      for (const emp of permanentEmps.rows) {
        await db.query(
          `INSERT INTO notifications (employee_id, type, title, body) VALUES ($1, 'leave', 'Monthly Leave Credited', '2 leaves have been credited to your account for this month. Check your updated leave balance on the dashboard.')`,
          [emp.id]
        );
      }
    } catch (notifErr) {
      console.error('Leave credit notification failed:', notifErr.message);
    }

    console.log("Monthly leave credit completed.");

  } catch (err) {

    console.error("Monthly leave credit failed:", err);

  }

});
app.post("/api/work-logs/generate-slots", requireAuth, async (req, res) => {

  try {

    const { employee_id, slot_hours } = req.body;

    const hoursPerSlot = slot_hours || 2;

    const existing = await db.query(
      `
      SELECT id
      FROM work_logs
      WHERE employee_id = $1
      AND attendance_date =
      (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
      `,
      [employee_id]
    );

    if (existing.rows.length > 0) {

      return res.json({
        message: "Today's slots already generated"
      });

    }

    const workStartHour = 10;
    const workEndHour =23;

    let currentHour = workStartHour;

    while (currentHour < workEndHour) {

      const slotStart = new Date();
      slotStart.setHours(currentHour, 0, 0, 0);

      const slotEnd = new Date();
      slotEnd.setHours(currentHour + hoursPerSlot, 0, 0, 0);

      await db.query(
        `
        INSERT INTO work_logs
        (
          employee_id,
          status,
          percent_complete,
          slot_start_time,
          slot_end_time,
          attendance_date
        )
        VALUES
        (
          $1,
          'Pending',
          0,
          $2,
          $3,
          (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
        )
        `,
        [employee_id, slotStart, slotEnd]
      );

      currentHour += hoursPerSlot;

    }

    res.json({
      message: "Slots generated"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});



app.post("/api/work-logs/:id", requireAuth, async (req, res) => {

  try {

    const { id } = req.params;

    const {
      task_title,
      related_to,
      status,
      percent_complete,
      screenshot_url
    } = req.body;

    const finalPercent =
      status === "Completed" ? 100 : percent_complete;

    await db.query(
      `
      UPDATE work_logs

      SET

      task_title = $1,

      related_to = $2,

      status = $3,

      percent_complete = $4,

      screenshot_url = $5,

      submitted_at = CURRENT_TIMESTAMP

      WHERE id = $6
      `,
      [
        task_title,
        related_to,
        status,
        finalPercent,
        screenshot_url,
        id
      ]
    );

    // Notify HR about work log submission
    try {
      const wlEmp = await db.query(`SELECT e.name FROM work_logs w JOIN employees e ON w.employee_id = e.id WHERE w.id = $1`, [id]);
      await db.query(
        `INSERT INTO notifications (employee_id, type, title, body) VALUES (0, 'document', 'Work Log Submitted', $1)`,
        [`${wlEmp.rows[0]?.name || 'Employee'} submitted: ${task_title || 'No title'} (${status}).`]
      );
    } catch (e) { console.error('HR work log notification failed:', e.message); }

    res.json({
      message: "Work log updated"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});





app.get("/api/work-logs/:employeeId", requireAuth, async (req, res) => {

  try {

    const { employeeId } = req.params;

    const result = await db.query(
      `
      SELECT *
      FROM work_logs
      WHERE employee_id = $1
      AND attendance_date =
      (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
      ORDER BY slot_start_time ASC
      `,
      [employeeId]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});


app.get("/api/work-logs", requireAuth, async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT
        work_logs.*,
        employees.name AS employee_name,
        employees.department

      FROM work_logs

      JOIN employees
      ON work_logs.employee_id = employees.id

      ORDER BY work_logs.attendance_date DESC, work_logs.slot_start_time DESC
      `
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});
app.get("/api/notifications/:employeeId", requireAuth, async (req, res) => {

  try {

    const { employeeId } = req.params;

    // HR sees ALL notifications (system, attendance, leaves, everything)
    if (employeeId === 'hr') {
      const result = await db.query(
        `SELECT id, employee_id, type, title, body, is_read, created_at
         FROM notifications
         ORDER BY is_read ASC, created_at DESC`
      );
      return res.json(result.rows);
    }

    // Employee sees their own + HR notifications
    const result = await db.query(
      `
      SELECT
        id,
        employee_id,
        type,
        title,
        body,
        is_read,
        created_at
      FROM notifications
      WHERE employee_id = $1 OR employee_id IS NULL
      ORDER BY is_read ASC, created_at DESC
      `,
      [employeeId]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      message: "Notification marked as read"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});
app.put("/api/notifications/read-all", requireAuth, async (req, res) => {

  try {

    const { employee_id } = req.body;

    if (employee_id === 'hr') {
      await db.query(`UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE`);
    } else {
      await db.query(
        `UPDATE notifications SET is_read = TRUE WHERE employee_id = $1 AND is_read = FALSE`,
        [employee_id]
      );
    }

    res.json({
      message: "All notifications marked as read"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

app.get("/api/notifications/:employeeId/unread-count", requireAuth, async (req, res) => {

  try {

    const { employeeId } = req.params;

    let query, params;
    if (employeeId === 'hr') {
      query = `SELECT COUNT(*)::int AS count FROM notifications WHERE is_read = FALSE`;
      params = [];
    } else {
      query = `SELECT COUNT(*)::int AS count FROM notifications WHERE (employee_id = $1 OR employee_id IS NULL) AND is_read = FALSE`;
      params = [employeeId];
    }
    const result = await db.query(query, params);

    res.json({
      count: Number(result.rows[0].count)
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

// ============================================
// DELETE SINGLE NOTIFICATION
// ============================================
app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM notifications WHERE id = $1`, [id]);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// CLEAR ALL NOTIFICATIONS FOR EMPLOYEE
// ============================================
app.delete("/api/notifications/clear-all", requireAuth, async (req, res) => {
  try {
    const { employee_id } = req.body;
    if (employee_id === 'hr') {
      await db.query(`DELETE FROM notifications`);
    } else {
      await db.query(`DELETE FROM notifications WHERE employee_id = $1`, [employee_id]);
    }
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error("Clear notifications error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// FINANCIAL YEARS
// ============================================
app.get("/api/payroll/financial-years", requireAuth, async (req, res) => {
  try {
    const result = await db.query(`SELECT year_label FROM financial_years ORDER BY year_label DESC`);
    res.json(result.rows.map(r => r.year_label));
  } catch (err) {
    console.error("Financial years error:", err.message);
    res.json(["2024-2025", "2025-2026"]);
  }
});

// ============================================
// PAYROLL ALL (for PaySheet / PaySlip)
// ============================================
app.get("/api/payroll/all", requireAuth, async (req, res) => {
  try {
    const { financialYear } = req.query;
    if (!financialYear) {
      return res.status(400).json({ message: "Financial year is required." });
    }

    // Parse financial year to get date range (Apr 1 to Mar 31)
    const [startYear] = financialYear.split("-").map(Number);
    const startDate = `${startYear}-04-01`;
    const endDate = `${startYear + 1}-03-31`;

    const result = await db.query(
      `
      SELECT
        p.id,
        p.employee_id AS "EmployeeID",
        p.financial_year AS "FinancialYear",
        p.month AS "Month",
        p.fixed_gross_salary AS "FixedGrossSalary",
        p.basic_da AS "BasicDA",
        p.leaves_taken AS "LeavesTaken",
        p.paid_leaves AS "PaidLeaves",
        p.advance AS "Advance",
        p.revenue_generated AS "RevenueGenerated"
      FROM payroll p
      WHERE p.financial_year = $1
      ORDER BY p.employee_id, p.month
      `,
      [financialYear]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Payroll all error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// INCENTIVE PAYMENTS
// ============================================
app.get("/api/incentive-payments", requireAuth, async (req, res) => {
  try {
    const { financialYear } = req.query;
    let query = `SELECT * FROM incentive_payments`;
    const params = [];
    if (financialYear) {
      query += ` WHERE financial_year = $1`;
      params.push(financialYear);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Incentive payments error:", err.message);
    res.json([]);
  }
});

app.post("/api/incentive-payments", requireAuth, async (req, res) => {
  try {
    const { employeeId, financialYear, month, paidOnDate } = req.body;
    if (!employeeId || !financialYear || !month || !paidOnDate) {
      return res.status(400).json({ message: "All fields are required." });
    }
    await db.query(
      `
      INSERT INTO incentive_payments (employee_id, financial_year, month, paid_on_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (employee_id, financial_year, month)
      DO UPDATE SET paid_on_date = $4
      `,
      [employeeId, financialYear, month, paidOnDate]
    );
    res.json({ message: "Incentive payment saved successfully." });
  } catch (err) {
    console.error("Incentive payment save error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// INVOICES
// ============================================
app.get("/api/invoices", requireAuth, async (req, res) => {
  try {
    const { financial_year, status, search } = req.query;
    let query = `SELECT * FROM invoices WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (financial_year) {
      query += ` AND financial_year = $${paramIndex}`;
      params.push(financial_year);
      paramIndex++;
    }
    if (status) {
      query += ` AND (status = $${paramIndex} OR lifecycle_state = $${paramIndex})`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (client_name ILIKE $${paramIndex} OR candidate_name ILIKE $${paramIndex} OR invoice_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC, id DESC`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Invoices list error:", err.message);
    res.json([]);
  }
});

app.post("/api/invoices", requireAuth, requireRole("hr"), async (req, res) => {
  try {
    const {
      invoice_number, client_name, salary_cost, service_charge, total_amount,
      billing_month, due_date, status, employee_count, employer_statutory,
      subtotal, gst_type, cgst, sgst, igst, lifecycle_state,
      franchise_name, team_leader, company_address, company_city, pin_code, state,
      contact_person, contact_number, contact_email, gst_number, industry, sub_industry,
      service_charge_percent, credit_period, replacement_period,
      candidate_name, candidate_phone, candidate_email, post_of_candidate,
      year_of_exp, source_of_resume, date_of_joining, annual_salary_offered,
      name_of_bd, bill_number, bill_date,
      our_share, franchisee_share, franchisee_gst,
      month_of_bill, financial_year, amount_received, date_received, paid_on_date,
      amount_due, tds, credit_date, credit_note_no,
      soa_no, debit_correction, gst_paid_status, tally_updated, remarks
    } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (
        invoice_number, client_name, salary_cost, service_charge, total_amount,
        billing_month, due_date, status, employee_count, employer_statutory,
        subtotal, gst_type, cgst, sgst, igst, lifecycle_state,
        franchise_name, team_leader, company_address, company_city, pin_code, state,
        contact_person, contact_number, contact_email, gst_number, industry, sub_industry,
        service_charge_percent, credit_period, replacement_period,
        candidate_name, candidate_phone, candidate_email, post_of_candidate,
        year_of_exp, source_of_resume, date_of_joining, annual_salary_offered,
        name_of_bd, bill_number, bill_date,
        our_share, franchisee_share, franchisee_gst,
        month_of_bill, financial_year, amount_received, date_received, paid_on_date,
        amount_due, tds, credit_date, credit_note_no,
        soa_no, debit_correction, gst_paid_status, tally_updated, remarks
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
        $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
        $51,$52,$53,$54,$55,$56,$57,$58,$59
      ) RETURNING *
      `,
      [
        invoice_number, client_name, salary_cost || 0, service_charge || 0, total_amount || 0,
        billing_month, due_date, status || 'Pending', employee_count || 0, employer_statutory || 0,
        subtotal || 0, gst_type || 'Intra-State (CGST+SGST)', cgst || 0, sgst || 0, igst || 0, lifecycle_state || 'Pending',
        franchise_name, team_leader, company_address, company_city, pin_code, state,
        contact_person, contact_number, contact_email, gst_number, industry, sub_industry,
        service_charge_percent, credit_period, replacement_period,
        candidate_name, candidate_phone, candidate_email, post_of_candidate,
        year_of_exp, source_of_resume, date_of_joining, annual_salary_offered,
        name_of_bd, bill_number, bill_date,
        our_share || 0, franchisee_share || 0, franchisee_gst || 0,
        month_of_bill, financial_year, amount_received || 0, date_received, paid_on_date,
        amount_due || 0, tds || 0, credit_date, credit_note_no,
        soa_no, debit_correction || 0, gst_paid_status, tally_updated, remarks
      ]
    );

    res.status(201).json({ message: "Invoice created successfully", invoice: result.rows[0] });
  } catch (err) {
    console.error("Invoice create error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/invoices/:id", requireAuth, requireRole("hr"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoice_number, client_name, salary_cost, service_charge, total_amount,
      billing_month, due_date, status, employee_count, employer_statutory,
      subtotal, gst_type, cgst, sgst, igst, lifecycle_state,
      franchise_name, team_leader, company_address, company_city, pin_code, state,
      contact_person, contact_number, contact_email, gst_number, industry, sub_industry,
      service_charge_percent, credit_period, replacement_period,
      candidate_name, candidate_phone, candidate_email, post_of_candidate,
      year_of_exp, source_of_resume, date_of_joining, annual_salary_offered,
      name_of_bd, bill_number, bill_date,
      our_share, franchisee_share, franchisee_gst,
      month_of_bill, financial_year, amount_received, date_received, paid_on_date,
      amount_due, tds, credit_date, credit_note_no,
      soa_no, debit_correction, gst_paid_status, tally_updated, remarks
    } = req.body;

    const result = await db.query(
      `UPDATE invoices SET
        invoice_number=$1, client_name=$2, salary_cost=$3, service_charge=$4, total_amount=$5,
        billing_month=$6, due_date=$7, status=$8, employee_count=$9, employer_statutory=$10,
        subtotal=$11, gst_type=$12, cgst=$13, sgst=$14, igst=$15, lifecycle_state=$16,
        franchise_name=$17, team_leader=$18, company_address=$19, company_city=$20, pin_code=$21, state=$22,
        contact_person=$23, contact_number=$24, contact_email=$25, gst_number=$26, industry=$27, sub_industry=$28,
        service_charge_percent=$29, credit_period=$30, replacement_period=$31,
        candidate_name=$32, candidate_phone=$33, candidate_email=$34, post_of_candidate=$35,
        year_of_exp=$36, source_of_resume=$37, date_of_joining=$38, annual_salary_offered=$39,
        name_of_bd=$40, bill_number=$41, bill_date=$42,
        our_share=$43, franchisee_share=$44, franchisee_gst=$45,
        month_of_bill=$46, financial_year=$47, amount_received=$48, date_received=$49, paid_on_date=$50,
        amount_due=$51, tds=$52, credit_date=$53, credit_note_no=$54,
        soa_no=$55, debit_correction=$56, gst_paid_status=$57, tally_updated=$58, remarks=$59
      WHERE id = $60
      RETURNING *
      `,
      [
        invoice_number, client_name, salary_cost, service_charge, total_amount,
        billing_month, due_date, status, employee_count, employer_statutory,
        subtotal, gst_type, cgst, sgst, igst, lifecycle_state,
        franchise_name, team_leader, company_address, company_city, pin_code, state,
        contact_person, contact_number, contact_email, gst_number, industry, sub_industry,
        service_charge_percent, credit_period, replacement_period,
        candidate_name, candidate_phone, candidate_email, post_of_candidate,
        year_of_exp, source_of_resume, date_of_joining, annual_salary_offered,
        name_of_bd, bill_number, bill_date,
        our_share, franchisee_share, franchisee_gst,
        month_of_bill, financial_year, amount_received, date_received, paid_on_date,
        amount_due, tds, credit_date, credit_note_no,
        soa_no, debit_correction, gst_paid_status, tally_updated, remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice updated successfully", invoice: result.rows[0] });
  } catch (err) {
    console.error("Invoice update error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/invoices/:id", requireAuth, requireRole("hr"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Invoice delete error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// EMPLOYEE-SIDE PAYROLL (self-view only)
// ============================================
app.get("/api/employee-payroll/:id/monthly", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const empResult = await db.query(`SELECT * FROM employees WHERE id = $1`, [id]);
    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const employee = empResult.rows[0];

    const attResult = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) AS present_days,
        COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END), 0) AS absent_days,
        COALESCE(SUM(CASE WHEN status = 'Paid Leave' THEN 1 ELSE 0 END), 0) AS paid_leave_days,
        COUNT(id) AS total_days
      FROM attendance
      WHERE employee_id = $1 AND attendance_date >= $2 AND attendance_date <= $3
    `, [id, startDate, endDate]);
    const attendance = attResult.rows[0];

    const calculation = PayrollFormula.calculate({
      salary: employee.salary,
      bonus: employee.bonus,
      advance: employee.advance || 0,
      tds: employee.tds || 0,
      esic: employee.esic || 0,
      professionalTax: employee.professional_tax || 0,
      lwf: employee.lwf || 0,
      hraEnabled: employee.hra_enabled,
      conveyanceEnabled: employee.conveyance_enabled,
      medicalEnabled: employee.medical_enabled,
      employeePFEnabled: employee.employee_pf_enabled,
      employerPFEnabled: employee.employer_pf_enabled,
      gratuityEnabled: employee.gratuity_enabled,
      incentiveEnabled: employee.incentive_enabled,
      otherExpenseEnabled: employee.other_expense_enabled,
    });

    res.json({
      month: Number(month),
      year: Number(year),
      employee: {
        id: employee.id,
        name: employee.name,
        employee_code: employee.employee_code,
        department: employee.department,
        designation: employee.designation,
      },
      earnings: {
        basic_da: calculation.basicDA,
        hra: calculation.hra,
        conveyance: calculation.conveyance,
        medical: calculation.medical,
        other_allowance: calculation.otherAllowance,
        bonus: calculation.bonus,
        gross_salary: calculation.grossSalary,
      },
      deductions: {
        pf: calculation.pf,
        esic: calculation.esic,
        professional_tax: calculation.professionalTax,
        lwf: calculation.lwf,
        tds: calculation.tds,
        advance: calculation.advance,
        total_deduction: calculation.totalDeduction,
      },
      employer_contributions: {
        employer_pf: calculation.employerPF,
        employer_esic: calculation.employerESIC,
        employer_lwf: calculation.employerLWF,
        gratuity: calculation.gratuityEmployer,
      },
      ctc: {
        monthly: calculation.monthlyCTC,
        annual: calculation.annualCTC,
      },
      net_pay: calculation.netPay,
      payable_salary: calculation.payableSalary,
      attendance: {
        present_days: Number(attendance.present_days),
        absent_days: Number(attendance.absent_days),
        paid_leave_days: Number(attendance.paid_leave_days),
        total_days: Number(attendance.total_days),
      },
    });
  } catch (err) {
    console.error("Employee payroll error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// EMPLOYEE-SIDE ATTENDANCE (self-view only)
// ============================================
app.get("/api/employee-attendance/:id/monthly", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    let result;
    try {
      result = await db.query(`
        SELECT attendance_date, status, marked_at AS check_in_time, check_out_time, attendance_type
        FROM attendance
        WHERE employee_id = $1 AND attendance_date >= $2 AND attendance_date <= $3
        ORDER BY attendance_date ASC
      `, [id, startDate, endDate]);
    } catch (colErr) {
      // Fallback if columns like marked_at or attendance_type don't exist
      result = await db.query(`
        SELECT attendance_date, status, check_out_time
        FROM attendance
        WHERE employee_id = $1 AND attendance_date >= $2 AND attendance_date <= $3
        ORDER BY attendance_date ASC
      `, [id, startDate, endDate]);
    }

    let summary;
    try {
      summary = await db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) AS present_days,
          COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END), 0) AS absent_days,
          COALESCE(SUM(CASE WHEN status = 'Paid Leave' THEN 1 ELSE 0 END), 0) AS paid_leave_days,
          COALESCE(SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END), 0) AS half_day_days,
          COUNT(*) AS total_days
      FROM attendance
      WHERE employee_id = $1 AND attendance_date >= $2 AND attendance_date <= $3
    `, [id, startDate, endDate]);
    } catch (summaryErr) {
      // Simpler fallback
      summary = { rows: [{ present_days: 0, absent_days: 0, paid_leave_days: 0, half_day_days: 0, total_days: 0 }] };
    }

    res.json({
      attendance: result.rows,
      summary: summary.rows[0],
    });
  } catch (err) {
    console.error("Employee attendance error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// EMPLOYEE-SIDE WORK LOGS SUMMARY
// ============================================
app.get("/api/employee-worklogs/:id/summary", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT
        attendance_date,
        COUNT(*) AS total_slots,
        COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'Missed') AS missed,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress
      FROM work_logs
      WHERE employee_id = $1
      GROUP BY attendance_date
      ORDER BY attendance_date DESC
      LIMIT 30
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Employee worklogs summary error:", err.message);
    res.json([]);
  }
});

// ============================================
// EMPLOYEE-SIDE MONTHLY ATTENDANCE (year view)
// ============================================
app.get("/api/employee-attendance/:id/yearly", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ message: "Year is required." });
    }
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const result = await db.query(`
      SELECT
        EXTRACT(MONTH FROM attendance_date) AS month,
        COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) AS present_days,
        COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END), 0) AS absent_days,
        COALESCE(SUM(CASE WHEN status = 'Paid Leave' THEN 1 ELSE 0 END), 0) AS paid_leave_days,
        COALESCE(SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END), 0) AS half_day_days,
        COUNT(id) AS total_days,
        ROUND(
          (SUM(CASE WHEN status IN ('Present', 'Paid Leave') THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(id), 0)) * 100, 1
        ) AS attendance_percentage
      FROM attendance
      WHERE employee_id = $1 AND attendance_date >= $2 AND attendance_date <= $3
      GROUP BY EXTRACT(MONTH FROM attendance_date)
      ORDER BY month ASC
    `, [id, startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error("Employee yearly attendance error:", err.message);
    res.json([]);
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server Running on Port 5000");
  });
}

// ============================================
// HR DOCUMENT TEMPLATES - GET
// ============================================
app.get(
  "/api/hr-documents/templates",
  requireAuth,
  async (req, res) => {

    try {

      const result = await db.query(
        `
        SELECT *
        FROM hr_document_templates
        ORDER BY id ASC
        `
      );

      res.json(result.rows);

    } catch (err) {

      console.error(
        "Get document templates error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ============================================
// HR DOCUMENT TEMPLATES - SAVE
// ============================================
app.post(
  "/api/hr-documents/templates",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    try {

      const {
        name,
        document_type,
        content
      } = req.body;

      if (!name || !document_type || !content) {

        return res.status(400).json({
          message: "Template name, document type and content are required."
        });

      }

      const result = await db.query(
        `
        INSERT INTO hr_document_templates
        (
          name,
          document_type,
          content
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING *
        `,
        [
          name,
          document_type,
          content
        ]
      );

      res.status(201).json({
        message: "Document template saved successfully.",
        template: result.rows[0]
      });

    } catch (err) {

      console.error(
        "Save document template error:",
        err.message
      );

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ============================================
// HR DOCUMENT - SEND EMAIL
// ============================================
// ============================================================
// HR DOCUMENT - SEND EMAIL
// ============================================================

// ============================================
// HR DOCUMENT - SEND EMAIL
// ============================================

app.post(
  "/api/hr-documents/send",
  requireAuth,
  requireRole("hr"),
  async (req, res) => {

    try {

      const {
        employee_id,
        document_type,
        subject,
        content
      } = req.body;

      // -----------------------------------------
      // VALIDATE REQUEST
      // -----------------------------------------

      if (
        !employee_id ||
        !document_type ||
        !content
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Employee, document type and document content are required."
        });
      }

      // -----------------------------------------
      // VALIDATE GMAIL CONFIGURATION
      // -----------------------------------------

      if (
        !process.env.GMAIL_USER ||
        !process.env.GMAIL_APP_PASSWORD
      ) {

        console.error(
          "❌ GMAIL_USER or GMAIL_APP_PASSWORD is missing."
        );

        return res.status(500).json({
          success: false,
          message:
            "Gmail email service is not configured on the server."
        });

      }

      // -----------------------------------------
      // GET EMPLOYEE
      // -----------------------------------------

      const employeeResult =
        await db.query(
          `
          SELECT
            id,
            name,
            email,
            employee_code
          FROM employees
          WHERE id = $1
          `,
          [employee_id]
        );

      if (employeeResult.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message: "Employee not found."
        });

      }

      const employee =
        employeeResult.rows[0];

      // -----------------------------------------
      // CHECK EMPLOYEE EMAIL
      // -----------------------------------------

      const cleanEmployeeEmail =
        String(employee.email || "").trim();

      if (!cleanEmployeeEmail) {

        return res.status(400).json({
          success: false,
          message:
            "Employee does not have an email address."
        });

      }

      // -----------------------------------------
      // VALIDATE EMAIL
      // -----------------------------------------

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmployeeEmail)) {

        return res.status(400).json({
          success: false,
          message:
            "Employee email address is invalid."
        });

      }

      // -----------------------------------------
      // VERIFY SMTP
      // -----------------------------------------

      await transporter.verify();

      // -----------------------------------------
      // EMAIL SUBJECT
      // -----------------------------------------

      const emailSubject =
        String(subject || "").trim() ||
        `${document_type} - Payroll Management System`;

      // -----------------------------------------
      // ESCAPE HTML
      // -----------------------------------------

      const escapeHtml = (value) =>
        String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      const safeEmployeeName =
        escapeHtml(employee.name || "Employee");

      const safeSubject =
        escapeHtml(emailSubject);

      const safeContent =
        escapeHtml(String(content))
          .replace(/\r\n/g, "<br>")
          .replace(/\n/g, "<br>");

      // -----------------------------------------
      // CREATE HTML EMAIL
      // -----------------------------------------

      const htmlContent = `
        <!DOCTYPE html>

        <html>

        <head>
          <meta charset="UTF-8">
          <title>${safeSubject}</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f6f8;
            font-family:Arial,Helvetica,sans-serif;
          "
        >

          <div
            style="
              max-width:700px;
              margin:40px auto;
              background:#ffffff;
              border-radius:12px;
              padding:35px;
              color:#1f2937;
              line-height:1.7;
              box-shadow:0 4px 20px rgba(0,0,0,.08);
            "
          >

            <h2>
              Dear ${safeEmployeeName},
            </h2>

            <div>
              ${safeContent}
            </div>

            <hr
              style="
                margin:30px 0;
                border:none;
                border-top:1px solid #e5e7eb;
              "
            >

            <p>
              Regards,<br>
              <strong>HR Department</strong><br>
              Payroll Management System
            </p>

          </div>

        </body>

        </html>
      `;

      // -----------------------------------------
      // SEND EMAIL
      // -----------------------------------------

      const mailInfo =
        await transporter.sendMail({

          from:
            `"Payroll Management System" <${process.env.GMAIL_USER}>`,

          to:
            cleanEmployeeEmail,

          subject:
            emailSubject,

          text:
            String(content),

          html:
            htmlContent

        });

      // -----------------------------------------
      // LOG
      // -----------------------------------------

      console.log(
        "=========================================="
      );

      console.log(
        "✅ HR DOCUMENT EMAIL SENT"
      );

      console.log(
        "From:",
        process.env.GMAIL_USER
      );

      console.log(
        "To:",
        cleanEmployeeEmail
      );

      console.log(
        "Subject:",
        emailSubject
      );

      console.log(
        "Message ID:",
        mailInfo.messageId
      );

      console.log(
        "=========================================="
      );

      // -----------------------------------------
      // UPDATE HR DOCUMENT RECORD
      // -----------------------------------------

      try {

        const existingDocument =
          await db.query(
            `
            SELECT id
            FROM hr_documents
            WHERE employee_id = $1
              AND document_type = $2
            LIMIT 1
            `,
            [
              employee_id,
              document_type
            ]
          );

        if (
          existingDocument.rows.length > 0
        ) {

          await db.query(
            `
            UPDATE hr_documents
            SET
              status = 'Uploaded',
              upload_date = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [
              existingDocument.rows[0].id
            ]
          );

        } else {

          await db.query(
            `
            INSERT INTO hr_documents
            (
              employee_id,
              document_type,
              status,
              upload_date
            )
            VALUES
            (
              $1,
              $2,
              'Uploaded',
              CURRENT_TIMESTAMP
            )
            `,
            [
              employee_id,
              document_type
            ]
          );

        }

      } catch (dbError) {

        console.error(
          "⚠ HR document history update failed:",
          dbError.message
        );

      }

      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------

      return res.json({

        success: true,

        message:
          `HR document sent successfully to ${cleanEmployeeEmail}.`,

        sender:
          process.env.GMAIL_USER,

        recipient:
          cleanEmployeeEmail,

        messageId:
          mailInfo.messageId || null

      });

    } catch (err) {

      console.error(
        "❌ HR DOCUMENT EMAIL ERROR:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          err.message ||
          "Failed to send HR document email."

      });

    }

  }
);
export default app;
