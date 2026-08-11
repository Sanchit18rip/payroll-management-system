class PayrollFormula {
  static grossSalary(salary) {
    return Number(salary) || 0;
  }

  static basicDA(salary) {
    return Math.round(this.grossSalary(salary) * 0.5);
  }

  static hra(salary) {
    return Math.round(this.basicDA(salary) * 0.5);
  }

  static conveyance() {
    return 1200;
  }

  static medical() {
    return 1000;
  }

  static otherAllowance(salary) {
    return Math.max(
      0,
      this.grossSalary(salary) -
        this.basicDA(salary) -
        this.hra(salary) -
        this.conveyance() -
        this.medical()
    );
  }

  static pf(salary) {
    return Math.round(this.basicDA(salary) * 0.12);
  }

  static calculate(employee) {

  console.log("================================");
  console.log("Employee Object:", employee);

  const grossSalary = Number(employee.salary) || 0;

  console.log("Gross Salary:", grossSalary);

  

  

    const bonus = Number(employee.bonus) || 0;
    const advance = Number(employee.advance) || 0;
    const tds = Number(employee.tds) || 0;
    const esic = Number(employee.esic) || 0;
    const professionalTax = Number(employee.professionalTax) || 0;
    const lwf = Number(employee.lwf) || 0;

    // ===========================
    // SALARY BREAKUP
    // ===========================

const basicDA = Math.round(grossSalary * 0.50);

const hra =
  employee.hraEnabled
    ? Math.round(basicDA * 0.50)
    : 0;

const conveyance =
  employee.conveyanceEnabled
    ? 1200
    : 0;

const medical =
  employee.medicalEnabled
    ? 1000
    : 0;

const otherAllowance =
  employee.otherExpenseEnabled
    ? grossSalary -
      basicDA -
      hra -
      conveyance -
      medical
    : 0;

// Employee PF
const pf =
  employee.employeePFEnabled
    ? Math.round(basicDA * 0.12)
    : 0;

// Employer PF
const employerPF =
  employee.employerPFEnabled
    ? Math.round(basicDA * 0.12)
    : 0;

// Employer ESIC
const employerESIC = 0;

// Employer LWF
const employerLWF = 0;

// Gratuity
const gratuityEmployer =
  employee.gratuityEnabled
    ? Math.round(basicDA * 0.0481)
    : 0;

const monthlyCTC =
  grossSalary +
  employerPF +
  employerESIC +
  employerLWF +
  gratuityEmployer;

const totalDeduction =
  pf +
  esic +
  professionalTax +
  lwf +
  tds +
  advance;

const annualCTC =
  monthlyCTC * 12;

// ===========================
// FINAL SALARY
// ===========================


const finalBonus =
  employee.incentiveEnabled
    ? bonus
    : 0;

const netPay =
  grossSalary - totalDeduction;

const payableSalary =
  netPay + finalBonus;

return {
  grossSalary,
  basicDA,
  hra,
  conveyance,
  medical,
  otherAllowance,

  // Employee Deductions
  pf,
  esic,
  professionalTax,
  lwf,
  tds,
  advance,
  totalDeduction,

  // Earnings
  bonus: finalBonus,

  // Employer Contributions
  employerPF,
  employerESIC,
  employerLWF,
  gratuityEmployer,

  // CTC
  monthlyCTC,
  annualCTC,

  // Final Salary
  netPay,
  payableSalary
};
  }
}

export default PayrollFormula;
