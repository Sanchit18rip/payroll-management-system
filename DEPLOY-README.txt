====================================================
 PAYROLL MANAGEMENT SYSTEM — DEPLOY GUIDE
====================================================

HOW TO RUN (on any office machine)

1) Extract this zip to a folder, e.g.  C:\payroll

2) Install dependencies (Node.js v20+ required)
   - Frontend (root folder):
       npm install
   - Backend:
       cd backend
       npm install
       cd ..

3) Configuration (.env files are already inside the zip)
   - backend/.env  → database + SMTP + JWT settings
   - .env          → VITE_API_BASE_URL (frontend → backend URL)
   These contain private credentials — do NOT share the zip outside the office.

4) Start the backend first (port 5000):
       cd backend
       node server.js
   On first start it automatically creates/updates required DB tables & columns.

5) Start the frontend:
   Option A — Development:
       npm run dev
       → open http://localhost:5173
   Option B — Production build:
       npm run build
       npm run preview
       → open the URL shown (usually http://localhost:4173)

   NOTE: The frontend calls the backend via VITE_API_BASE_URL (default http://localhost:5000).
   If the backend runs on a different machine, update .env and rebuild.

LOGINS
   - HR login and employee login happen through the app (Supabase auth).
   - Use existing office credentials; new registrations are allowed once per email.

QUICK SANITY CHECKS AFTER DEPLOY
   - HR: Payroll Management → PT column shows ₹200 for every male and for females with salary > ₹25,000
   - HR: Payroll Reports → Pay Slip download (Talent Corner format)
   - Employee: Dashboard / Attendance (self mark) / Work Logs (date-wise tasks) / Performance (reviews appear once HR applies an increment review)
   - Console should be clean: no 500 errors on /api/payroll/financial-years, no React table warnings.

SIGNUP / LOGIN FLOW (current)
   - Register with ANY email + a password of your choice (no domain restriction).
   - No verification email / OTP. Account is created as "pending HR approval".
   - HR approves from Approvals page → employee logs in with the SAME email + password.
   - Pending/rejected accounts cannot log in (backend enforces this).

DEPLOYING TO VERCEL
   - .env files are git-ignored, so set these env vars in the Vercel project dashboard
     (Project → Settings → Environment Variables) for BOTH preview & production:
       DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
       SUPABASE_URL, SUPABASE_ANON_KEY
       GMAIL_USER, GMAIL_APP_PASSWORD
     (optional) SUPABASE_SERVICE_ROLE_KEY — only needed if Supabase
     "Confirm email" is left ON, to auto-confirm signups.
   - Supabase dashboard: Authentication → Providers → Email → turn OFF
     "Confirm email" so no verification link is sent.
   - The backend auto-creates the columns it needs on first start
     (approval_status, email). Manual SQL migrations 001-006 can also be
     run in Supabase SQL Editor for the same result.
====================================================
