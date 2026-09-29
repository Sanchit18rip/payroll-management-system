/** @type {import('tailwindcss').Config} */
// Tailwind is used by several pages (HRSupport, PaySlip, PaySheet,
// StatutoryCompliance, InvoiceManagement, PayrollReport).
// The system is light-theme only, so no dark: variants are needed.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
