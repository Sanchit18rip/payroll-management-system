export function calculatePayroll(employee) {

    const totalDays = Number(employee.total_days || 30);
    const paidDays =
        Number(employee.present_days || 0) +
        Number(employee.paid_leave_days || 0);

    const attendanceRatio =
        totalDays > 0 ? paidDays / totalDays : 0;

    const salary = Number(employee.salary || 0);

    const basic =
    Number(employee.basic_da) > 0
    ? Number(employee.basic_da)
    : Math.round(salary * 0.5);

    const hra =
        employee.hra_enabled ? Math.round(basic * 0.50) : 0;

    const conveyance =
        employee.conveyance_enabled ? 1200 : 0;

    const medical =
        employee.medical_enabled ? 1000 : 0;

    const other =
  employee.other_expenses_enabled
    ? Math.max(
        salary -
        basic -
        hra -
        conveyance -
        medical,
        0
      )
    : 0;

    const gross =
        basic +
        hra +
        conveyance +
        medical +
        other;

    // Attendance-adjusted earnings
    const earnedBasic = Math.round(basic * attendanceRatio);
    const earnedHRA = Math.round(hra * attendanceRatio);
    const earnedConveyance = Math.round(conveyance * attendanceRatio);
    const earnedMedical = Math.round(medical * attendanceRatio);
    const earnedOther = Math.round(other * attendanceRatio);

    const earnedGross =
        earnedBasic +
        earnedHRA +
        earnedConveyance +
        earnedMedical +
        earnedOther;

    const pfWages = earnedGross - earnedHRA;

    const employeePF =
        employee.epf_employee_enabled
            ? (pfWages < 15000
                ? Math.round(pfWages * 0.12)
                : 1800)
            : 0;

    const employerPF =
        employee.epf_employer_enabled
            ? (pfWages < 15000
                ? Math.round(pfWages * 0.12)
                : 1800)
            : 0;

    const esic =
        earnedGross <= 21000
            ? Math.round(earnedGross * 0.0075)
            : 0;

    const employerESIC =
        earnedGross <= 21000
            ? Math.round(earnedGross * 0.0325)
            : 0;

    const pt =
        employee.professional_tax_enabled ? 200 : 0;

    const tds =
        employee.tds_enabled
            ? Math.round(earnedGross * 0.10)
            : 0;

    const gratuity =
        employee.gratuity_enabled
            ? Math.round(earnedBasic * 0.0481)
            : 0;

    const incentive =
        employee.incentive_enabled
            ? Math.round(
                Number(employee.revenue_generated || 0) *
                Number(employee.incentive_percentage || 0) / 100
            )
            : 0;

    const bonus = Number(employee.bonus || 0);
    const advance = Number(employee.advance || 0);
    const deduction = Number(employee.deduction || 0);

    const totalDeduction =
        employeePF +
        esic +
        pt +
        tds +
        advance +
        deduction;

    const netPay =
        earnedGross +
        bonus +
        incentive -
        totalDeduction;

    const ctc =
        gross +
        employerPF +
        employerESIC +
        gratuity;
    console.log({
  salary,
  basic,
  hra,
  conveyance,
  medical,
  other,
  gross
});
    return {
        totalDays,
        paidDays,
        attendanceRatio,

        basic,
        hra,
        conveyance,
        medical,
        other,
        gross,

        earnedBasic,
        earnedHRA,
        earnedConveyance,
        earnedMedical,
        earnedOther,
        earnedGross,

        pfWages,
        employeePF,
        employerPF,

        esic,
        employerESIC,

        pt,
        tds,

        gratuity,

        incentive,
        advance,
        bonus,
        deduction,

        totalDeduction,

        netPay,

        ctc
    };
}