import { jsPDF } from "jspdf";

/* ─── helpers ─── */
const fc = (num) => {
  if (num == null) return "0.00";
  const s = Number(num).toFixed(2).toString();
  const [ip, fp] = s.split(".");
  const last3 = ip.length > 3 ? ip.slice(ip.length - 3) : ip;
  const rest = ip.slice(0, ip.length - 3);
  const fmt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest ? fmt + "," : ""}${last3}.${fp}`;
};

const numberToWordsIndian = (num) => {
  if (num === 0) return "Zero";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n) => {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return `${tens[Math.floor(n / 10)]} ${units[n % 10]}`.trim();
    return `${units[Math.floor(n / 100)]} Hundred ${convert(n % 100)}`.trim();
  };
  let crore = Math.floor(num / 10000000);
  let lakh = Math.floor((num % 10000000) / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let hundred = Math.floor(num % 1000);
  let result = [];
  if (crore > 0) result.push(`${convert(crore)} Crore`);
  if (lakh > 0) result.push(`${convert(lakh)} Lakh`);
  if (thousand > 0) result.push(`${convert(thousand)} Thousand`);
  if (hundred > 0) result.push(convert(hundred));
  return result.join(" ").trim() || "Zero";
};

/* ─── image loader ─── */
const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

/**
 * NOTE: This is the canonical HR payslip format ("Deepti's format").
 * Keep in sync with the layout used in HR PaySlip page.
 *
 * @param {object} emp        Full employee row (name, employee_code, department,
 *                            designation, bank/pf/pan details, joining_date, ...)
 * @param {object} salary     Computed salary object:
 *                            { fixedGrossSalary, earnBasic, earnHRA, earnConv, earnMed,
 *                              earnOther, hraFull, convFull, medFull, otherFull,
 *                              pf, esic, pt, lwf, tds }
 * @param {string} period     e.g. "1 Apr 2026 to 30 Apr 2026"
 * @param {string} monthName  e.g. "April" (used in filename)
 * @param {string|number} yearLabel e.g. "2025-2026" (used in filename)
 */
export const generatePayslipPDF = async (emp, salary, period, monthName, yearLabel) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth(); // 210
  const ph = doc.internal.pageSize.getHeight(); // 297
  const LM = 15; // left margin
  const RM = pw - 15; // right margin = 195
  const CW = RM - LM; // content width = 180

  // Load stamp, signature & logo images
  const [stampImg, sigImg, logoImg] = await Promise.all([
    loadImage("/images/Stamp.jpeg"),
    loadImage("/images/Sign.jpeg"),
    loadImage("/images/Logo.png"),
  ]);

  let y = 15;

  /* ──────────────────────────────────────────────
     COMPANY HEADER (outside border — logo + text)
     ────────────────────────────────────────────── */

  // Logo — top-left corner (big)
  const logoW = 30;
  const logoH = 30;
  if (logoImg) {
    doc.addImage(logoImg, "PNG", LM, y - 4, logoW, logoH);
  }

  // Company name & address — left-aligned block, all lines start from same X
  const textX = LM + logoW + 6; // text starts right of the logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Talent Corner HR Services Pvt. Ltd.", textX, y + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("708/709, Bhaveshwar Arcade NX", textX, y + 12);
  doc.text("Opp Shreyas Cinema, LBS Marg, Ghatkopar(W),", textX, y + 17);
  doc.text("Mumbai-400086", textX, y + 22);
  doc.text("UDYAM Reg No. : UDYAM-MH-19-0067990 (Micro)", textX, y + 27);
  doc.text("E-Mail : accounts@talentcorner.in", textX, y + 32);

  y += 32 + 3; // text span (32mm) + small gap (3mm)

  /* ──────────────────────────────────────────────
     BORDERED BOX — contains entire payslip content
     ────────────────────────────────────────────── */
  const boxTop = y;
  const boxBottom = ph - 15;

  // Draw the border rectangle
  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.rect(LM - 2, boxTop, CW + 4, boxBottom - boxTop);

  y = boxTop + 5;

  /* ── "Pay Slip" heading ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Pay Slip", LM + 2, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`for ${period}`, LM + 2, y);
  y += 5;

  /* ── Separator line ── */
  doc.setLineWidth(0.3);
  doc.line(LM + 2, y, RM - 2, y);
  y += 6;

  /* ── "Pay Slip for [period]" centered ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Pay Slip for ${period}`, pw / 2, y, { align: "center" });
  y += 5;

  /* ── Employee name centered ── */
  doc.setFontSize(12);
  doc.text((emp.full_name || emp.name || "N/A").toUpperCase(), pw / 2, y, { align: "center" });
  y += 5;

  /* ── Separator line ── */
  doc.setLineWidth(0.3);
  doc.line(LM + 2, y, RM - 2, y);
  y += 7;

  /* ──────────────────────────────────────────────
     EMPLOYEE DETAILS — two-column layout
     ────────────────────────────────────────────── */
  const lc = LM + 2;  // left column X = 17
  const rc = pw / 2 + 5; // right column X = 110
  const lv = lc + 36; // left value X = 53
  const rv = rc + 44; // right value X = 154 (space for long labels like "PR Account Number (PRAN):")
  doc.setFontSize(9);

  const leftRows = [
    ["Employee Number:", emp.employee_code || emp.id || "N/A"],
    ["Function:", emp.department || "N/A"],
    ["Designation:", emp.designation || "N/A"],
    ["Location:", emp.location || emp.address || "Head Office"],
    ["Bank Details:", `Name - ${(emp.full_name || emp.name || "N/A").toUpperCase()}`],
    ["", `BRANCH - ${(emp.bank_name || "N/A").toUpperCase()}`],
    ["", `IFSC code - ${(emp.ifsc_code || "N/A").toUpperCase()}`],
    ["", `ACC NO. ${emp.bank_account_number || "N/A"}`],
    ["Date of joining:", emp.joining_date ? new Date(emp.joining_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"],
  ];

  const rightRows = [
    ["Tax Regime:", "Regular Tax Regime"],
    ["Income Tax Number", ""],
    ["(PAN):", emp.pan_number || "N/A"],
    ["Universal Account", ""],
    ["Number (UAN):", emp.uan_number || "N/A"],
    ["PF account number:", emp.pf_account_number || "N/A"],
    ["ESI Number:", emp.esi_registration_number || "N/A"],
    ["", ""],
    ["PR Account Number (PRAN):", emp.pr_account_number || "N/A"],
  ];

  for (let i = 0; i < Math.max(leftRows.length, rightRows.length); i++) {
    // Left column
    if (i < leftRows.length) {
      const [label, val] = leftRows[i];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (label) doc.text(label, lc, y);
      doc.setFont("helvetica", "bold");
      doc.text(String(val), lv, y);
    }
    // Right column
    if (i < rightRows.length) {
      const [label, val] = rightRows[i];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (label) doc.text(label, rc, y);
      if (val) {
        doc.setFont("helvetica", "bold");
        doc.text(String(val), rv, y);
      }
    }
    y += 5;
  }
  y += 2;

  /* ── Separator line ── */
  doc.setLineWidth(0.3);
  doc.line(LM + 2, y, RM - 2, y);
  y += 6;

  /* ──────────────────────────────────────────────
     EARNINGS & DEDUCTIONS TABLE
     ────────────────────────────────────────────── */
  // Earnings — only employee earnings (Gratuity is employer contribution, NOT added to earnings)
  const earnings = [
    { label: "Basic Salary", amount: salary.earnBasic },
    { label: "HRA", amount: salary.earnHRA },
    { label: "Convenance Expenses", amount: salary.earnConv },
    { label: "Medical Allowance", amount: salary.earnMed },
    { label: "Other Expenses", amount: salary.earnOther },
  ];

  // Deductions — only employee deductions
  const deductions = [
    { label: "Provident Fund", amount: salary.pf },
    { label: "ESIC", amount: salary.esic },
    { label: "Professional Tax", amount: salary.pt },
    { label: "LWF", amount: salary.lwf },
    { label: "TDS", amount: salary.tds },
  ];

  // Table column positions — everything INSIDE the bordered box
  // Box runs from LM-2 (13mm) to RM+2 (197mm)
  const tL = LM + 2;   // table left = 17mm
  const tR = RM - 2;   // table right = 193mm
  const midX = pw / 2; // exact center = 105mm

  // Earnings half (17mm to 105mm = 88mm)
  const eLabelX = tL;      // 17mm
  const eAmtX = tL + 50;   // 67mm — centered (no Gross Salary column)

  // Deductions half (105mm to 193mm = 88mm)
  const dLabelX = midX + 2; // 107mm
  const dAmtX = midX + 50;  // 157mm — centered (no Gross Salary column)

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(tL, y, tR - tL, 7, "F");
  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.line(tL, y, tR, y);
  doc.line(tL, y + 7, tR, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("Earnings", eLabelX + 1, y + 5);
  doc.text("Amount", eAmtX + 1, y + 5);
  doc.line(midX, y, midX, y + 7); // center divider
  doc.text("Deductions", dLabelX + 1, y + 5);
  doc.text("Amount", dAmtX + 1, y + 5);
  y += 7;

  // Data rows
  const maxRows = Math.max(earnings.length, deductions.length);
  for (let i = 0; i < maxRows; i++) {
    doc.setDrawColor(220);
    doc.setLineWidth(0.1);

    // Earnings side
    if (i < earnings.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(earnings[i].label, eLabelX + 1, y + 5);
      doc.text(fc(earnings[i].amount), eAmtX + 1, y + 5);
    }

    // Center divider
    doc.line(midX, y, midX, y + 6);

    // Deductions side
    if (i < deductions.length && deductions[i].amount !== 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(deductions[i].label, dLabelX + 1, y + 5);
      doc.text(fc(deductions[i].amount), dAmtX + 1, y + 5);
    }

    y += 6;
    doc.line(tL, y, tR, y);
  }

  // Totals
  const totE = earnings.reduce((s, i) => s + (i.amount || 0), 0);
  const totD = deductions.reduce((s, i) => s + (i.amount || 0), 0);
  // Net = Total Earnings - Total Deductions (must match the earnings shown on the slip)
  const net = totE - totD;

  y += 1;
  doc.setFillColor(241, 245, 249);
  doc.rect(tL, y, tR - tL, 7, "F");
  doc.setDrawColor(160);
  doc.setLineWidth(0.3);
  doc.line(tL, y, tR, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Total Earnings", eLabelX + 1, y + 5);
  doc.text(fc(totE), eAmtX + 1, y + 5);
  doc.line(midX, y, midX, y + 7);
  doc.text("Total Deductions", dLabelX + 1, y + 5);
  doc.text(fc(totD), dAmtX + 1, y + 5);
  y += 7;
  doc.line(tL, y, tR, y);

  // Net Amount row
  y += 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Net Amount", dLabelX + 1, y + 5);
  doc.text(fc(net), dAmtX + 1, y + 5);
  y += 7;
  doc.line(tL, y, tR, y);
  y += 5;

  /* ── Amount in words ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Amount (in words):", LM + 2, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`INR ${numberToWordsIndian(Math.round(net))} Rupees only`, LM + 2, y);
  y += 8;

  /* ── Separator line ── */
  doc.setLineWidth(0.3);
  doc.line(LM + 2, y, RM - 2, y);
  y += 5;

  /* ──────────────────────────────────────────────
     SIGNATURE & STAMP — right after separator, inside the box
     ────────────────────────────────────────────── */
  // Position signature block right below the separator line
  const signStampY = y + 2;
  const stampSize = 22;
  const sigW = 26;
  const sigH = 13;

  // Stamp on right side
  const stampX = RM - stampSize - 5;
  if (stampImg) {
    doc.addImage(stampImg, "JPEG", stampX, signStampY, stampSize, stampSize);
  }

  // Signature immediately LEFT of the stamp
  if (sigImg) {
    const sigX = stampX - sigW - 8;
    doc.addImage(sigImg, "JPEG", sigX, signStampY + 4, sigW, sigH);
  }

  // "Authorised Signatory" below stamp, right-aligned
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Authorised Signatory", RM - 5, signStampY + stampSize + 4, { align: "right" });

  // Save
  const safeName = (emp.full_name || emp.name || "Employee").replace(/[^a-zA-Z0-9]/g, "_");
  const yearPart = yearLabel ? `_${yearLabel}` : "";
  doc.save(`Payslip_${safeName}_${monthName || "FullYear"}${yearPart}.pdf`);
};