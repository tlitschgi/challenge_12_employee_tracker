// Import
const inquirer = require("inquirer");
const { Pool } = require("pg");

// Define PORT
const PORT = process.env.PORT || 3001;

// Execute main function to list choices of action to take
async function main() {
  while (true) {
    try {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Exit",
          ],
        },
      ]);

      // Execute function (or exit) based on action chosen
      switch (action) {
        case "View All Employees":
          await viewAllEmployees();
          break;
        case "Add Employee":
          await addEmployee();
          break;
        case "Update Employee Role":
          await updateEmployeeRole();
          break;
        case "View All Roles":
          await viewAllRoles();
          break;
        case "Add Role":
          await addRole();
          break;
        case "View All Departments":
          await viewAllDepartments();
          break;
        case "Add Department":
          await addDepartment();
          break;
        case "Exit":
          console.log("Goodbye!");
          process.exit(0);
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  }
}

// User and password login and access to database
const pool = new Pool({
  user: "postgres",
  password: "adminadmin",
  host: "localhost",
  database: "employee_db",
});

// Execute function to view employees in employee table in employee database
async function viewAllEmployees() {
  console.log("Viewing all employees...");
  const client = await pool.connect();

  try {
    // Fetch employees
    const { rows } = await client.query(`
      SELECT e.id, e.first_name, e.last_name, r.title
      FROM employee e
      JOIN role r ON e.role_id = r.id
      ORDER BY e.id
    `);

    if (rows.length === 0) {
      console.log("No employees found.");
    } else {
      console.table(rows);
    }
  } catch (error) {
    console.error("Error in viewAllEmployees function:", error);
  } finally {
    client.release();
  }
}

// Execute function to add new employee in employee table in employee database
async function addEmployee() {
  console.log("Adding an employee...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: roles } = await client.query("SELECT id, title FROM role");
    console.log("Selected roles...");

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the first name of the new employee?",
        validate: (input) => (input ? true : "This field is required."),
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the last_name of the new employee?",
        validate: (input) => (input ? true : "This field is required."),
      },
      {
        type: "list",
        name: "role_id",
        message: "What role does this employee belong to?",
        choices: roles.map((rl) => ({
          name: rl.title,
          value: rl.id,
        })),
      },
    ]);

    // Add new employee into employee table in employee databse
    const result = await client.query(
      "INSERT INTO employee (first_name, last_name, role_id) VALUES ($1, $2, $3) RETURNING *",
      [answers.first_name, answers.last_name, answers.role_id]
    );

    await client.query("COMMIT");

    console.log(`Added new employee: ${result.rows[0].last_name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in addEmployee function:", error);
    if (error.constraint) {
      console.error("Constraint violation:", error.constraint);
    }
  } finally {
    client.release();
  }
}

// Execute function to update existing employee in employee table in employee database
async function updateEmployeeRole() {
  console.log("Updating employee role...");
  const client = await pool.connect();

  try {
    // Fetch employees
    const { rows: employees } = await client.query(`
      SELECT id, first_name, last_name 
      FROM employee
      ORDER BY last_name, first_name
    `);

    if (employees.length === 0) {
      console.log("No employees found. Please add employees first.");
      return;
    }

    // Fetch roles
    const { rows: roles } = await client.query(`
      SELECT id, title
      FROM role
      ORDER BY title
    `);

    if (roles.length === 0) {
      console.log("No roles found. Please add roles first.");
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee's role do you want to update?",
        choices: employees.map((emp) => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id,
        })),
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to assign to the selected employee?",
        choices: roles.map((rl) => ({
          name: rl.title,
          value: rl.id,
        })),
      },
    ]);

    // Update employee's role in employee table
    await client.query("BEGIN");
    const result = await client.query(
      "UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *",
      [answers.roleId, answers.employeeId]
    );
    await client.query("COMMIT");

    const updatedEmployee = result.rows[0];
    console.log(
      `Updated role for ${updatedEmployee.first_name} ${updatedEmployee.last_name}`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in updateEmployeeRole function:", error);
  } finally {
    client.release();
  }
}

// Execute function to view roles in role table in employee database
async function viewAllRoles() {
  console.log("Viewing all roles...");
  const client = await pool.connect();

  try {
    // Fetch roles
    const { rows } = await client.query(`
      SELECT r.id, r.title, r.salary, d.name AS department
      FROM role r
      JOIN department d ON r.department_id = d.id
      ORDER BY r.id
    `);

    if (rows.length === 0) {
      console.log("No roles found.");
    } else {
      console.table(rows);
    }
  } catch (error) {
    console.error("Error in viewAllRoles function:", error);
  } finally {
    client.release();
  }
}

// Execute function to add new role to role table in employee database
async function addRole() {
  console.log("Adding roles...");

  const client = await pool.connect();

  try {
    // Fetch departments
    await client.query("BEGIN");

    const { rows: departments } = await client.query(
      "SELECT id, name FROM department"
    );
    console.log("Selected departments...");

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "What is the title of the new role?",
        validate: (input) => (input ? true : "This field is required."),
      },
      {
        type: "number",
        name: "salary",
        message: "What is the salary for this role?",
        validate: (input) =>
          input > 0 ? true : "Please enter a valid salary.",
      },
      {
        type: "list",
        name: "department_id",
        message: "Which department does this role belong to?",
        choices: departments.map((dept) => ({
          name: dept.name,
          value: dept.id,
        })),
      },
    ]);

    // Add new role into role table in employee database
    const result = await client.query(
      "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *",
      [answers.title, answers.salary, answers.department_id]
    );

    await client.query("COMMIT");

    console.log(`Added new role: ${result.rows[0].title}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in addRole function:", error);
    if (error.constraint) {
      console.error("Constraint violation:", error.constraint);
    }
  } finally {
    client.release();
  }
}

// Execute function to view departments in department table in employee database
async function viewAllDepartments() {
  console.log("Viewing all departments...");
  const client = await pool.connect();

  try {
    // Fetch departments
    const { rows } = await client.query(`
      SELECT d.id, d.name AS department
      FROM department d
      ORDER BY d.id
    `);

    if (rows.length === 0) {
      console.log("No departments found.");
    } else {
      console.table(rows);
    }
  } catch (error) {
    console.error("Error in viewAllDepartments function:", error);
  } finally {
    client.release();
  }
}

// Execute function to add new department to department table in employee database
async function addDepartment() {
  console.log("Adding a department...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the new department?",
        validate: (input) => (input ? true : "This field is required."),
      },
    ]);

    // Add new department into department table in employee database
    const result = await client.query(
      "INSERT INTO department (name) VALUES ($1) RETURNING *",
      [answers.name]
    );

    await client.query("COMMIT");

    console.log(`Added new department: ${result.rows[0].name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in addDepartment function:", error);
    if (error.constraint) {
      console.error("Constraint violation:", error.constraint);
    }
  } finally {
    client.release();
  }
}

// Execute main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});