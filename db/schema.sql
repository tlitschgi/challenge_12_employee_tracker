-- Drops the employee_db if it exists currently --
DROP DATABASE IF EXISTS employee_db;
-- Creates the employee_db
CREATE DATABASE employee_db;

-- Makes it so all of the following code will affect employee_db --
\c employee_db;

-- Creates the table "department" within employee_db --
CREATE TABLE department (
  -- Creates a numeric column called "id" --
  id SERIAL PRIMARY KEY,
  -- Creates a string column called "name" which can hold up to 30 characters --
  name VARCHAR(30) UNIQUE NOT NULL
);

-- Creates the table "role" within employee_db --
CREATE TABLE role (
  -- Creates a numeric column called "id" --
  id SERIAL PRIMARY KEY,
  -- Creates a string column called "title" which can hold up to 30 characters --
  title VARCHAR(30) UNIQUE NOT NULL,
  -- Creates a decimal column called "title" which can hold up to 30 characters --
  salary DECIMAL NOT NULL,
  -- Creates a numeric column called "department" --
 department_id INT,
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

-- Creates the table "employee" within employee_db --
CREATE TABLE employee (
  -- Creates a numeric column called "id" --
  id SERIAL PRIMARY KEY,
  -- Creates a string column called "first_name" which can hold up to 30 characters --
  first_name VARCHAR(30) NOT NULL,
  -- Creates a string column called "last_name" which can hold up to 30 characters --
  last_name VARCHAR(30) NOT NULL,
  -- Creates a numeric column called "role_id" --
  role_id INT,
  FOREIGN KEY (role_id)
  REFERENCES role(id)
  ON DELETE SET NULL,
  -- Creates a numeric column called "manager_id" --
  manager_id INT,
  FOREIGN KEY (manager_id) 
  REFERENCES employee(id) 
  ON DELETE SET NULL
);