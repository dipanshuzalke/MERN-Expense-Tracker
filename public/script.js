// DOM Elements
const incomeInput = document.getElementById("income");
const setIncomeButton = document.getElementById("set-income-button");
const nextMonthButton = document.getElementById("next-month-button");
const displayIncome = document.getElementById("display-income");
const incomeDisplay = document.getElementById("income-display");
const expenseForm = document.getElementById("expense-form");
const weeklyExpenseTableBody = document.querySelector(
  "#weekly-expense-table tbody"
);
const alertMessage = document.getElementById("alert-message");

// Percentage breakdown for each category
const categoryLimits = {
  food: 20, // 20%
  education: 10, // 10%
  shopping: 15, // 15%
  entertainment: 8, // 8%
  others: 20, // 20%
};

// Load previous expenses and income from localStorage
let weeklyExpenses = JSON.parse(localStorage.getItem("weeklyExpenses")) || [];
let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;

// Initialize pie chart
let ctx = document.getElementById("expenseChart").getContext("2d");
let expenseChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [
      "Food",
      "Education",
      "Shopping",
      "Entertainment",
      "Others",
      "Savings",
    ],
    datasets: [
      {
        label: "Expense Breakdown",
        data: [0, 0, 0, 0, 0, totalIncome], // Initial values for the chart
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(192, 192, 192, 0.7)",
        ],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  },
});

// Check if income is already set
if (totalIncome > 0) {
  showIncome(totalIncome);
} else {
  setIncomeButton.addEventListener("click", function () {
    totalIncome = parseFloat(incomeInput.value);
    if (isNaN(totalIncome) || totalIncome <= 0) {
      alert("Please enter a valid income.");
      return;
    }
    localStorage.setItem("totalIncome", totalIncome); // Save income in localStorage
    showIncome(totalIncome);
  });
}

nextMonthButton.addEventListener("click", function () {
  // Show the income input field for editing
  incomeInput.removeAttribute("disabled");
  incomeInput.focus(); // Focus on the input field for user convenience
  incomeInput.value = ""; // Clear the input field to allow new entry

  // Listen for when the user inputs the new income
  incomeInput.addEventListener("change", function () {
    const newIncome = parseFloat(incomeInput.value);
    if (isNaN(newIncome) || newIncome <= 0) {
      alert("Please enter a valid income.");
      incomeInput.focus(); // Keep the input field open if invalid input
      return;
    }

    // Update total income and reset expenses for the new month
    totalIncome = newIncome;
    localStorage.setItem("totalIncome", totalIncome);
    weeklyExpenses = []; // Reset the expenses for the new month
    localStorage.removeItem("weeklyExpenses"); // Remove old expenses from localStorage

    // Clear the table and chart
    weeklyExpenseTableBody.innerHTML = "";
    updateChart(0, 0, 0, 0, 0);

    // Update income display
    incomeDisplay.textContent = totalIncome;

    // Disable the income input field after setting the new income
    incomeInput.setAttribute("disabled", true);

    // Clear the alert message
    alertMessage.textContent = "";

    // Update expense limits with the new income
    updateExpenseLimits();

    // Inform the user that the income has been successfully updated
    alert("New income has been set for the next month!");
  });
});

// Function to update displayed expense limits
function updateExpenseLimits() {
  document.getElementById("food-limit").textContent = `${(
    (categoryLimits.food / 100) *
    totalIncome
  ).toFixed(2)}`;
  document.getElementById("education-limit").textContent = `${(
    (categoryLimits.education / 100) *
    totalIncome
  ).toFixed(2)}`;
  document.getElementById("shopping-limit").textContent = `${(
    (categoryLimits.shopping / 100) *
    totalIncome
  ).toFixed(2)}`;
  document.getElementById("entertainment-limit").textContent = `${(
    (categoryLimits.entertainment / 100) *
    totalIncome
  ).toFixed(2)}`;
  document.getElementById("others-limit").textContent = `${(
    (categoryLimits.others / 100) *
    totalIncome
  ).toFixed(2)}`;
}

// Show income and enable expense form
function showIncome(income) {
  displayIncome.style.display = "block";
  incomeDisplay.textContent = income;
  expenseForm.style.display = "block";
  incomeInput.disabled = true; // Disable income input after setting
  setIncomeButton.style.display = "none"; // Hide button after setting income
  nextMonthButton.style.display = "inline"; // Show next month button

  // Populate the table with previous weekly expenses
  weeklyExpenses.forEach((expense) => addWeeklyDataToTable(expense));

  // Update expense limits display
  updateExpenseLimits();

  // Update the chart with any previous expenses
  updateChartData();
}

// Update the chart with current expense data
function updateChartData() {
  let totalFood = 0,
    totalEducation = 0,
    totalShopping = 0,
    totalEntertainment = 0,
    totalOthers = 0;

  weeklyExpenses.forEach((expense) => {
    totalFood += expense.food;
    totalEducation += expense.education;
    totalShopping += expense.shopping;
    totalEntertainment += expense.entertainment;
    totalOthers += expense.others;
  });

  updateChart(
    totalFood,
    totalEducation,
    totalShopping,
    totalEntertainment,
    totalOthers
  );
}

// Event listener for form submission
expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get category expenses
  const foodExpense =
    parseFloat(document.getElementById("food-expense").value) || 0;
  const educationExpense =
    parseFloat(document.getElementById("education-expense").value) || 0;
  const shoppingExpense =
    parseFloat(document.getElementById("shopping-expense").value) || 0;
  const entertainmentExpense =
    parseFloat(document.getElementById("entertainment-expense").value) || 0;
  const othersExpense =
    parseFloat(document.getElementById("others-expense").value) || 0;

  const weekNumber = weeklyExpenses.length + 1;

  // Calculate total expenses for the week
  const totalWeeklyExpense =
    foodExpense +
    educationExpense +
    shoppingExpense +
    entertainmentExpense +
    othersExpense;

  // Calculate savings based on total income and previous week's remaining savings
  const previousSavings =
    weeklyExpenses.length > 0
      ? weeklyExpenses[weeklyExpenses.length - 1].savings // Get savings from the last entry
      : totalIncome; // If no previous entries, start with total income

  const currentSavings = previousSavings - totalWeeklyExpense; // Calculate current savings

  const weeklyData = {
    week: `Week ${weekNumber}`,
    food: foodExpense,
    education: educationExpense,
    shopping: shoppingExpense,
    entertainment: entertainmentExpense,
    others: othersExpense,
    savings: currentSavings >= 0 ? currentSavings : 0, // Ensure savings don't go below zero
  };

  // Push weekly data to weeklyExpenses array
  weeklyExpenses.push(weeklyData);

  // Save updated weekly expenses to localStorage
  localStorage.setItem("weeklyExpenses", JSON.stringify(weeklyExpenses));

  // Append weekly data to table
  addWeeklyDataToTable(weeklyData);

  // Update the chart with new expense data
  updateChartData();

  // Check if any category exceeds the limit
  checkCategoryLimits(weeklyData);

  // Reset form inputs
  expenseForm.reset();
});

// Add weekly data to the table
function addWeeklyDataToTable(weeklyData) {
  const row = document.createElement("tr");
  row.innerHTML = `
        <td>${weeklyData.week}</td>
        <td>${weeklyData.food}</td>
        <td>${weeklyData.education}</td>
        <td>${weeklyData.shopping}</td>
        <td>${weeklyData.entertainment}</td>
            <td>${weeklyData.others}</td>
            <td>${weeklyData.savings}</td>
            <td><button class="delete-btn" data-week="${weeklyData.week}">Delete</button></td>
        `;

  weeklyExpenseTableBody.appendChild(row);

  // Add event listener to the delete button
  row.querySelector(".delete-btn").addEventListener("click", function () {
    const weekToDelete = this.getAttribute("data-week");
    deleteWeekExpense(weekToDelete);
  });
}

// Update the pie chart with new data
function updateChart(food, education, shopping, entertainment, others) {
  const totalExpense = food + education + shopping + entertainment + others;
  const remainingLimit = totalIncome - totalExpense;

  expenseChart.data.datasets[0].data = [
    food,
    education,
    shopping,
    entertainment,
    others,
    remainingLimit > 0 ? remainingLimit : 0,
  ];

  expenseChart.update();
}

// Check if any category exceeds its percentage limit of total income
function checkCategoryLimits(weeklyData) {
  const limitsExceeded = [];

  if (weeklyData.food > (categoryLimits.food / 100) * totalIncome) {
    limitsExceeded.push("Food");
  }
  if (weeklyData.education > (categoryLimits.education / 100) * totalIncome) {
    limitsExceeded.push("Education");
  }
  if (weeklyData.shopping > (categoryLimits.shopping / 100) * totalIncome) {
    limitsExceeded.push("Shopping");
  }
  if (
    weeklyData.entertainment >
    (categoryLimits.entertainment / 100) * totalIncome
  ) {
    limitsExceeded.push("Entertainment");
  }
  if (weeklyData.others > (categoryLimits.others / 100) * totalIncome) {
    limitsExceeded.push("Others");
  }

  if (limitsExceeded.length > 0) {
    alertMessage.textContent = `Warning! You've exceeded the limits for: ${limitsExceeded.join(
      ", "
    )}.`;
    alertMessage.style.color = "red";
  } else {
    alertMessage.textContent = "Expenses are within limits.";
    alertMessage.style.color = "green";
  }
}

// Delete a week's expense entry from the table and localStorage
function deleteWeekExpense(weekToDelete) {
  // Remove from weeklyExpenses array
  weeklyExpenses = weeklyExpenses.filter((week) => week.week !== weekToDelete);

  // Update localStorage
  localStorage.setItem("weeklyExpenses", JSON.stringify(weeklyExpenses));

  // Remove from table
  weeklyExpenseTableBody.innerHTML = ""; // Clear the table
  weeklyExpenses.forEach((expense) => addWeeklyDataToTable(expense)); // Re-populate table

  // Update the chart data
  updateChartData();
}

// Event listener for adding next month's income
nextMonthButton.addEventListener("click", function () {
  // Show the income input field for editing
  incomeInput.removeAttribute("disabled");
  incomeInput.focus(); // Focus on the input field for user convenience
  incomeInput.value = ""; // Clear the input field to allow new entry

  // Listen for when the user inputs the new income
  incomeInput.addEventListener("change", function () {
    const newIncome = parseFloat(incomeInput.value);
    if (isNaN(newIncome) || newIncome <= 0) {
      alert("Please enter a valid income.");
      incomeInput.focus(); // Keep the input field open if invalid input
      return;
    }

    // Update total income and reset expenses for the new month
    totalIncome = newIncome;
    localStorage.setItem("totalIncome", totalIncome);
    weeklyExpenses = []; // Reset the expenses for the new month
    localStorage.removeItem("weeklyExpenses"); // Remove old expenses from localStorage

    // Clear the table and chart
    weeklyExpenseTableBody.innerHTML = "";
    updateChart(0, 0, 0, 0, 0);

    // Update income display
    incomeDisplay.textContent = totalIncome;

    // Disable the income input field after setting the new income
    incomeInput.setAttribute("disabled", true);

    // Clear the alert message
    alertMessage.textContent = "";

    // Inform the user that the income has been successfully updated
    alert("New income has been set for the next month!");
  });
});

let barCtx = document.getElementById("monthlyExpenseBarChart").getContext("2d");

let monthlyExpenseBarChart = new Chart(barCtx, {
  type: "bar",
  data: {
    labels: ["Food", "Education", "Shopping", "Entertainment", "Others"],
    datasets: [
      {
        label: "Monthly Expenses",
        data: [0, 0, 0, 0, 0], // Initialize with 0, you can update later
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Update function for bar chart
function updateBarChart(food, education, shopping, entertainment, others) {
  monthlyExpenseBarChart.data.datasets[0].data = [
    food,
    education,
    shopping,
    entertainment,
    others,
  ];
  monthlyExpenseBarChart.update();
}

let lineCtx = document
  .getElementById("weeklyExpenseLineChart")
  .getContext("2d");

let weeklyExpenseLineChart = new Chart(lineCtx, {
  type: "line",
  data: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // Example for a month with 4 weeks
    datasets: [
      {
        label: "Food",
        data: [0, 0, 0, 0], // Initialize with 0, update with real values later
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Education",
        data: [0, 0, 0, 0],
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Shopping",
        data: [0, 0, 0, 0],
        borderColor: "rgba(255, 206, 86, 1)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Entertainment",
        data: [0, 0, 0, 0],
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Others",
        data: [0, 0, 0, 0],
        borderColor: "rgba(153, 102, 255, 1)",
        fill: false,
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Update function for line chart
function updateLineChart(weekData) {
  weeklyExpenseLineChart.data.datasets.forEach((dataset, index) => {
    dataset.data = weekData[index]; // Update dataset with week data
  });
  weeklyExpenseLineChart.update();
}

let weekData = [
  [50, 100, 150, 200], // Food expenses for 4 weeks
  [80, 120, 160, 100], // Education expenses for 4 weeks
  [60, 140, 90, 180], // Shopping expenses for 4 weeks
  [30, 90, 70, 150], // Entertainment expenses for 4 weeks
  [40, 50, 60, 80], // Other expenses for 4 weeks
];

updateLineChart(weekData);

// Assuming you have already defined your bar chart as shown above

// Sample monthly expenses for the current month
const sampleMonthlyExpenses = {
  food: 300,
  education: 200,
  shopping: 150,
  entertainment: 100,
  others: 50,
};

// Update the bar chart with the sample data
updateBarChart(
  sampleMonthlyExpenses.food,
  sampleMonthlyExpenses.education,
  sampleMonthlyExpenses.shopping,
  sampleMonthlyExpenses.entertainment,
  sampleMonthlyExpenses.others
);

// Update function for bar chart
function updateBarChart(food, education, shopping, entertainment, others) {
  monthlyExpenseBarChart.data.datasets[0].data = [
    food,
    education,
    shopping,
    entertainment,
    others,
  ];
  monthlyExpenseBarChart.update();
}
