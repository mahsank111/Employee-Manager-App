const fs = require("fs");
const path = require("path");
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");

const app = express();
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");
const bcrypt = require("bcrypt");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));
app.use(bodyParser.urlencoded({ extended: false }));

const employeesData = [];

// Defining routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const department = req.body.department;

  let existingEmployees = loadEmployees(); // Loading existing employee data
  existingEmployees.push({
    name: name,
    phone: phone,
    email: email,
    department: department,
  });

  saveEmployees(existingEmployees);

  res.redirect("/list");
});

app.get("/delete", (req, res) => {
  res.render("delete");
});

app.get("/edit", (req, res) => {
  const employees = loadEmployees(); // Loading employee data

  let selectedEmployee = null;
  if (req.query.employee) {
    selectedEmployee = employees.find(
      (employee) => employee.id === req.query.employee
    );
  }

  res.render("edit", { employees: employees, selectedEmployee });
});

// Updating route for selecting employee to edit
app.post("/select-employee", (req, res) => {
  const selectedEmployeeId = req.body.employee;
  const employees = loadEmployees(); // Loading employee data

  const selectedEmployee = employees.find(
    (employee) => employee.name === selectedEmployeeId
  );

  if (!selectedEmployee) {
    res.send("Employee not found");
  } else {
    res.render("edit", {
      employees: employees,
      selectedEmployee: selectedEmployee,
    });
  }
});

// Updating route for editing employee
app.post("/update/:name", (req, res) => {
  const namee = req.params.name;
  const { name, phone, email, department } = req.body;
  console.log(namee);

  let employees = loadEmployees(); // Loading employee data

  // Finding the index of the employee to edit
  const indexToEdit = employees.findIndex(
    (employee) => employee.name === namee
  );
  // const notMatched = employees.filter((em) => em.name != namee);
  // const matched = employees.filter((em) => em.name == namee)
  // console.log(notMatched, matched);

  if (indexToEdit !== -1) {
    // Updating employee information
    employees[indexToEdit] = {
      // id: id,
      name: name,
      phone: phone,
      email: email,
      department: department,
    };

    // Saving the updated employees to the JSON file
    saveEmployees(employees);

    res.redirect("/list"); // Redirect to the list page after editing employee
  } else {
    res.send("Employee not found");
  }
});

app.get("/list", (req, res) => {
  const employees = loadEmployees();
  res.render("list", { employees });
});

app.post("/delete", (req, res) => {
  const nameToDelete = req.body.name;

  let existingEmployees = loadEmployees();

  const indexToRemove = existingEmployees.findIndex(
    (employee) => employee.name === nameToDelete
  );

  if (indexToRemove !== -1) {
    existingEmployees.splice(indexToRemove, 1);

    saveEmployees(existingEmployees);

    res.redirect("/list");
  } else {
    res.send("Employee not found");
  }
});

// Route for rendering the signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Route for handling signup form submission
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user information (e.g., username, email, hashedPassword) to your database or file

  // Redirect to the home page after successful signup
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function loadEmployees() {
  try {
    const dataBuffer = fs.readFileSync(path.join(__dirname, "employees.json"));
    const dataJSON = dataBuffer.toString();
    return JSON.parse(dataJSON);
  } catch (error) {
    return [];
  }
}

function saveEmployees(employees) {
  const dataJSON = JSON.stringify(employees);
  fs.writeFileSync(path.join(__dirname, "employees.json"), dataJSON);
}
