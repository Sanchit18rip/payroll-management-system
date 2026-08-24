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

  /**
   * Calculate professional tax based on gender and earned gross.
   * Male: Rs.200 if earned gross > 25000
   * Female: Rs.200 if earned gross > 25000
   */
  static professionalTax(earnedGross, gender) {
    if (earnedGross > 25000) {
      return 200;
    }
    return 0;
  }

  /**
   * Calculate TDS (Tax Deducted at Source).
   * 10% of earned gross if TDS is enabled.
   */
  static tds(earnedGross, enabled) {
    if (!enabled) return 0;
    return Math.round(earnedGross * 0.10);
  }

  /**
   * Calculate ESIC (Employee State Insurance Corporation).
   * Employee: 0.75% of gross if gross < 21000
   * Employer: 3.25% of gross if gross < 21000
   */
  static esicEmployee(earnedGross, enabled) {
    if (!enabled || earnedGross >= 21000) return 0;
    return Math.round(earnedGross * 0.0075);
  }

  static esicEmployer(earnedGross, enabled) {
    if (!enabled || earnedGross >= 21000) return 0;
    return Math.round(earnedGross * 0.0325);
  }

  /**
   * Calculate LWF (Labour Welfare Fund).
   * Employee: Rs.25 in June and December only.
   * Employer: Rs.75 in June and December only.
   */
  static lwfEmployee(monthIndex, enabled) {
    // monthIndex 2 = June, monthIndex 8 = December (financial year starting April)
    if (!enabled || ![2, 8].includes(monthIndex)) return 0;
    return 25;
  }

  static lwfEmployer(monthIndex) {
    if (![2, 8].includes(monthIndex)) return 0;
    return 75;
  }

  static calculate(employee, monthIndex = 0) {
    const grossSalary = Number(employee.salary) || 0;
    const bonus = Number(employee.bonus) || 0;
    const advance = Number(employee.advance) || 0;

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
          basicDA - hra - conveyance - medical
        : 0;

    // ===========================
    // EMPLOYEE DEDUCTIONS
    // ===========================

    // Employee PF (12% of basicDA, max Rs.1800)
    const pf =
      employee.employeePFEnabled
        ? Math.min(Math.round(basicDA * 0.12), 1800)
        : 0;

    // Employee ESIC (0.75% if gross < 21000)
    const esic =
      employee.esicEnabled
        ? PayrollFormula.esicEmployee(grossSalary, true)
        : 0;

    // Professional Tax (Rs.200 if gross > 25000)
    const professionalTax =
      employee.professionalTaxEnabled
        ? PayrollFormula.professionalTax(grossSalary, employee.gender)
        : 0;

    // LWF Employee (Rs.25 in June/Dec only)
    const lwf =
      employee.lwfEnabled
        ? PayrollFormula.lwfEmployee(monthIndex, true)
        : 0;

    // TDS (10% of gross if enabled)
    const tds =
      PayrollFormula.tds(grossSalary, employee.tdsEnabled);

    // ===========================
    // EMPLOYER CONTRIBUTIONS
    // ===========================

    // Employer PF (12% of basicDA)
    const employerPF =
      employee.employerPFEnabled
        ? Math.min(Math.round(basicDA * 0.12), 1800)
        : 0;

    // Employer ESIC (3.25% if gross < 21000)
    const employerESIC =
      employee.esicEnabled
        ? PayrollFormula.esicEmployer(grossSalary, true)
        : 0;

    // Employer LWF (Rs.75 in June/Dec only)
    const employerLWF =
      PayrollFormula.lwfEmployer(monthIndex);

    // Gratuity monthly provision
    // Standard: (Basic+DA) x 15 x Years / 26
    // Monthly provision: basicDA x 15 / (26 x 12) = basicDA x 0.0481
    const gratuityEmployer =
      employee.gratuityEnabled
        ? Math.round(basicDA * 0.0481)
        : 0;

    // ===========================
    // TOTALS
    // ===========================

    const totalDeduction =
      pf + esic + professionalTax + lwf + tds + advance;

    const monthlyCTC =
      grossSalary +
      employerPF + employerESIC + employerLWF + gratuityEmployer;

    const annualCTC = monthlyCTC * 12;

    const netPay = grossSalary - totalDeduction;

    const finalBonus =
      employee.incentiveEnabled ? bonus : 0;

    const payableSalary = netPay + finalBonus;

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
