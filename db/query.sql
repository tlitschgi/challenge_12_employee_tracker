select * from department;
select * from role;
select * from employee;

SELECT e.id, 
e.first_name, 
e.last_name, 
r.title, 
d.name as department, 
r.salary,
COALESCE(m.first_name || ' ' || m.last_name, 'null') AS manager 
FROM department d, role r, employee e
LEFT JOIN employee m ON m.id = e.manager_id
WHERE d.id = r.department_id
  AND r.id = e.role_id;