import express from "express";
import cors from "cors";
import db from "./db.js";
import cron from "node-cron";
import PayrollFormula from "./utils/PayrollFormula.js";

const app = express();
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

      }

      await db.query(
`
UPDATE leave_balance

SET

vacation_available =
vacation_available + 1,

vacation_earned =
vacation_earned + 1,

sick_available =
sick_available + 1,

sick_earned =
sick_earned + 1

WHERE employee_id = $1
`,
[
employee.id
]
);

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
});

app.get(
  "/api/outsourced-employees",
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

            clients.company_name,

            clients.id AS client_id

          FROM outsourced_employees

          JOIN clients

          ON outsourced_employees.client_id =
             clients.id

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
app.delete(
  "/api/outsourced-employees/:id",
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
app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});

app.get("/api/employees", async (req, res) => {
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

app.post("/api/employees", async (req, res) => {

  try {
    console.log(req.body)
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

  bonus,
  deduction
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

const otherAllowance =
  PayrollFormula.otherAllowance(salary);

const pf =
  PayrollFormula.pf(salary);
    const result = await db.query(
      `
      INSERT INTO employees
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
  deduction
)
VALUES
(
$1,$2,$3,$4,$5,
$6,$7,$8,$9,$10,
$11,$12,$13,$14,$15,
$16,$17,$18,$19,$20,
$21,$22,$23
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
  deduction || 0
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
`,

[
employeeId,
documentType
]

);

}

    await db.query(
`
INSERT INTO leave_balance
(
employee_id,

available_leaves,
total_leaves_earned,

vacation_available,
vacation_earned,
vacation_used,

sick_available,
sick_earned,
sick_used
)

VALUES
(
$1,

0,
0,

0,
0,
0,

0,
0,
0
)
`,
[
employeeId
]
);

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
        'employee',
        name,
        `New employee  Added`
      ]
    );
    await db.query(
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

    console.log(result.rows);

    res.json({
      message: "Employee Added"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
app.post(
  "/api/employees/import",

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
app.put("/api/employees/:id", async (req, res) => {

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

  salary

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

pf = $19

probation_start_date = $20,
probation_end_date = $21,

WHERE id = $22
`,

[
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

probationStartDate,

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

id
]

);
console.log("Rows Updated:", result.rowCount);
if (
  previousStatus === "Probation" &&
  employment_status === "Permanent"
) {

  await db.query(
    `
    UPDATE leave_balance

    SET

    vacation_available =
      vacation_available + 1,

    vacation_earned =
      vacation_earned + 1,

    sick_available =
      sick_available + 1,

    sick_earned =
      sick_earned + 1

    WHERE employee_id = $1
    `,
    [id]
  );

}

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
app.delete("/api/employees/:id", async (req, res) => {

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

    res.json({
      message: "Employee Deleted"
    });

  }

  catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
app.put("/api/attendance/:id", async (req, res) => {

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
app.get("/api/attendance", async (req, res) => {

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

      ORDER BY attendance.updated_at DESC
      `
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
app.get("/api/attendance/:date", async (req, res) => {

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

      ORDER BY employees.id ASC
      `,
      [date]
    );

    res.json(result.rows);

  }

  catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
app.get("/api/attendance-summary", (req, res) => {

  const sql = `
    SELECT
      employee_id,

      SUM(
        CASE
          WHEN status = 'Present'
          OR status = 'Paid Leave'
          THEN 1
          ELSE 0
        END
      ) AS attended_days,

      COUNT(*) AS total_days,

      ROUND(
        (
          SUM(
            CASE
              WHEN status = 'Present'
              OR status = 'Paid Leave'
              THEN 1
              ELSE 0
            END
          ) / COUNT(*)
        ) * 100,
        2
      ) AS attendance_percentage

    FROM attendance

    GROUP BY employee_id
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      res.status(500).json(err);
      return;
    }

    res.json(result);

  });

});

app.get("/api/leave-balance", async (req, res) => {

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

    console.log(err);

    res.status(500).json(err);

  }

});
app.put("/api/leave-balance/:employeeId", (req, res) => {

  const employeeId = req.params.employeeId;
  const { available_leaves } = req.body;

  db.query(
    `
    UPDATE leave_balance
    SET available_leaves = ?
    WHERE employee_id = ?
    `,
    [available_leaves, employeeId],
    (err) => {

      if (err) {
        res.status(500).json(err);
        return;
      }

      res.json({
        message: "Leave Balance Updated"
      });

    }
  );

});
app.post("/api/attendance/generate-today", async (req, res) => {

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
app.get("/api/monthly-attendance-summary", async (req, res) => {

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

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
app.post("/api/process-monthly-leaves", async (req, res) => {

  try {

    const currentMonth =
      new Date().getMonth() + 1;

    const currentYear =
      new Date().getFullYear();

    const tracker =
      await db.query(
`
SELECT *

FROM leave_month_tracker

LIMIT 1
`
);

    if (

tracker.rows[0].last_processed_month === currentMonth &&

tracker.rows[0].last_processed_year === currentYear

) {

      return res.json({

        message:
          "Already processed this month"

      });

    }

    const employees =
      await db.query(
`
SELECT id

FROM employees

WHERE employment_status = 'Permanent'
`
);

    for (const employee of employees.rows) {

      await db.query(
`
UPDATE leave_balance

SET

vacation_available =
vacation_available + 1,

vacation_earned =
vacation_earned + 1,

sick_available =
sick_available + 1,

sick_earned =
sick_earned + 1

WHERE employee_id = $1
`,
[
employee.id
]
);

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

    await db.query(
`
UPDATE leave_month_tracker

SET

last_processed_month = $1,

last_processed_year = $2
`,
[
currentMonth,
currentYear
]
);

    res.json({

      message:
        "Monthly leave credited successfully."

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
app.get("/api/payroll", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        employees.id,
        employees.name,

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
app.put("/api/payroll/:id", async (req, res) => {

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
app.get("/api/payroll/:id", async (req, res) => {
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
app.put("/api/employees/:id/payroll-settings", async (req, res) => {
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
         other_expense_enabled = $10
       WHERE id = $11
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

      console.log(err)

      res.status(500)
        .json(err)

    }

  }
)
app.get("/api/leaves", async (req, res) => {

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

app.post("/api/leaves", async (req, res) => {

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

app.put("/api/leaves/:id", async (req, res) => {

  try {

    const id = req.params.id;

    const { status } = req.body;

    const leaveResult =
await db.query(
`
SELECT *

FROM leaves_table

WHERE id = $1
`,
[id]
);

if (
leaveResult.rows.length === 0
) {

return res.status(404).json({

message:
"Leave request not found."

});

}

const leave =
leaveResult.rows[0];
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
const balanceResult =
await db.query(
`
SELECT

available_leaves

FROM leave_balance

WHERE employee_id = $1
`,
[leave.employee_id]
);

const availableLeaves =
Number(
balanceResult.rows[0]
.available_leaves
);
if (
status === "Approved" &&
availableLeaves < leaveDays
) {

return res.status(400).json({

message:

`Insufficient leave balance.

Employee has only ${availableLeaves} leave(s).`

});

}

if (
leave.status === "Approved"
) {

return res.status(400).json({

message:
"Leave has already been approved."

});

}

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
    
if (status === "Approved") {

  if (leave.leave_type !== "Unpaid Leave") {

    await db.query(
      `
      UPDATE leave_balance

      SET

      available_leaves = available_leaves - $1

      WHERE employee_id = $2
      `,
      [
        leaveDays,
        leave.employee_id
      ]
    );

  }

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
console.log("=== Attendance Update ===");
console.log("Employee:", leave.employee_id);
console.log("Start:", leave.start_date);
console.log("End:", leave.end_date);
console.log("Status:", attendanceStatus);


  const currentDate = new Date(leave.start_date);
const lastDate = new Date(leave.end_date);
console.log("Current Date:", currentDate.toISOString().split("T")[0]);
console.log("Last Date:", lastDate.toISOString().split("T")[0]);
while (currentDate <= lastDate) {

  const attendanceResult = await db.query(
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
    (employee_id, attendance_date)

    DO UPDATE

    SET

    status = EXCLUDED.status,

    updated_at = CURRENT_TIMESTAMP
    `,
    [
      leave.employee_id,
      currentDate.toISOString().split("T")[0],
      attendanceStatus
    ]
  );
  console.log(
  "Attendance Rows Updated:",
  attendanceResult.rowCount
);

  currentDate.setDate(
    currentDate.getDate() + 1
  );

}

}
 

    res.json({
      message:
        "Leave Updated"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
app.get("/api/performance", async (req, res) => {

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
app.post("/api/performance", async (req, res) => {

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
app.get("/api/clients", async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT *
      FROM clients
      ORDER BY id
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

});app.post("/api/clients", async (req, res) => {

  const {

    company_name,

    contact_person,

    email,

    phone,

    service_fee_percent

  } = req.body;

  try {

    await db.query(
      `
      INSERT INTO clients
      (
        company_name,
        contact_person,
        email,
        phone,
        service_fee_percent
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        company_name,
        contact_person,
        email,
        phone,
        service_fee_percent
      ]
    );

    res.json({
      message: "Client added successfully"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});app.delete("/api/clients/:id", async (req, res) => {

  try {

    await db.query(
      `
      DELETE FROM clients
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      message: "Client deleted successfully"
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});
app.get(
  "/api/performance-reviews",
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

      const grossSalary = PayrollFormula.grossSalary(salary);

const basicDA = PayrollFormula.basicDA(salary);

const hra = PayrollFormula.hra(salary);

const conveyanceAllowance =
  PayrollFormula.conveyance();

const medicalAllowance =
  PayrollFormula.medical();

const otherAllowance =
  PayrollFormula.otherAllowance(salary);

const pf =
  PayrollFormula.pf(salary);

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
      console.log(
  JSON.stringify(
    review.rows[0],
    null,
    2
  )
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

console.log(
  "HISTORY INSERTED:",
  historyResult.rows[0]
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

    }

  }
);
app.delete(
  "/api/hr-documents/:id",
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
app.delete(
  "/api/hr-documents/:id",
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
app.get(
  "/api/employees/:id",
  async (req, res) => {

    try {

      const result =
        await db.query(
          `
          SELECT *

          FROM employees

          WHERE id = $1
          `,
          [req.params.id]
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
app.get(
  "/api/leave-balance/:employeeId",
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
  async (req, res) => {

    try {

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
const employeeData =
employee.rows[0];

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

      if (
        employee.rows.length === 0
      ) {

        return res.status(404).json({
          message: "Employee not found"
        });

      }

      if (
        employee.rows[0].employment_status ===
        "Permanent"
      ) {

        return res.status(400).json({
          message:
            "Employee is already permanent"
        });

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
      console.log("Employee updated to Permanent");

      await db.query(
        `
        UPDATE leave_balance
SET

available_leaves = available_leaves + 2,

total_leaves_earned = total_leaves_earned + 2,

vacation_available = vacation_available + 1,

vacation_earned = vacation_earned + 1,

sick_available = sick_available + 1,

sick_earned = sick_earned + 1

WHERE employee_id = $1
        `,
        [req.params.id]
      );
      const balance = await db.query(
`
SELECT *

FROM leave_balance

WHERE employee_id = $1
`,
[req.params.id]
);

console.log(balance.rows[0]);

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
app.put("/api/employees/:id/accept-terms", async (req, res) => {

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
app.put("/api/employees/:id/face-enroll", async (req, res) => {

  try {

    const { id } = req.params;
    const { face_descriptor } = req.body;

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
app.get("/api/employee-dashboard/:id", async (req, res) => {

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

app.get("/api/employees/by-email/:email", async (req, res) => {

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
app.post("/api/attendance/self-mark", async (req, res) => {
console.log("Attendance API Hit");
console.log(req.body);
  try {

    const {
      employee_id,
      photo_url,
      latitude,
      longitude,
      face_match,
      face_distance
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

        SET

        status = 'Present',

        photo_url = $1,

        latitude = $2,

        longitude = $3,

        face_match_distance = $4,

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
          employee_id
        ]
      );

    }

    else {

      await db.query(
        `
        INSERT INTO attendance
        (
          employee_id,
          attendance_date,
          status,
          photo_url,
          latitude,
          longitude,
          face_match_distance,
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
          CURRENT_TIMESTAMP
        )
        `,
        [
          employee_id,
          photo_url,
          latitude,
          longitude,
          face_distance
        ]
      );

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

  }

});
app.get("/api/employees/:id", async (req, res) => {

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
cron.schedule("0 0 1 * *", async () => {

  try {

    console.log("Monthly leave credit started...");

    await db.query(
      `
      UPDATE leave_balance

      SET

      available_leaves = available_leaves + 2,

      total_leaves_earned = total_leaves_earned + 2,

      vacation_available = vacation_available + 1,

      vacation_earned = vacation_earned + 1,

      sick_available = sick_available + 1,

      sick_earned = sick_earned + 1

      WHERE employee_id IN (

        SELECT id

        FROM employees

        WHERE employment_status = 'Permanent'

      )
      `
    );

    console.log("Monthly leave credit completed.");

  } catch (err) {

    console.error("Monthly leave credit failed:", err);

  }

});