const API_URL = "https://dummyjson.com/todos";
const ITEMS_PER_PAGE = 10;

let todos = [];
let currentPage = 1;

// Elements
const todoList = document.getElementById("todoList");
const searchInput = document.getElementById("searchInput");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const pagination = document.getElementById("pagination");
const addTodoForm = document.getElementById("addTodoForm");
const newTodoInput = document.getElementById("newTodoInput");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const filterBtn = document.getElementById("filterBtn");

// Fetch Todos from API
async function fetchTodos() {
  try {
    showLoading(true);
    const res = await fetch(`${API_URL}?limit=100`);
    if (!res.ok) throw new Error("Failed to fetch todos.");
    const data = await res.json();
    todos = data.todos.map(todo => ({
      ...todo,
      createdAt: getRandomDate(), // Simulate createdAt field
    }));
    renderTodos();
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

// Generate random date for filtering simulation
function getRandomDate() {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Render Todos
function renderTodos() {
  const filtered = applyFilters();
  const paginated = paginate(filtered, currentPage);
  todoList.innerHTML = "";

  if (paginated.length === 0) {
    todoList.innerHTML = "<li class='list-group-item text-center'>No tasks found.</li>";
    pagination.innerHTML = "";
    return;
  }

  paginated.forEach(todo => {
    const li = document.createElement("li");
    li.className = `list-group-item ${todo.completed ? "completed" : ""}`;
    li.textContent = todo.todo + " (Created: " + todo.createdAt.toISOString().split("T")[0] + ")";
    todoList.appendChild(li);
  });

  renderPagination(filtered.length);
}

// Filter logic
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const from = fromDate.value ? new Date(fromDate.value) : null;
  const to = toDate.value ? new Date(toDate.value) : null;

  return todos.filter(todo => {
    const taskMatch = todo.todo.toLowerCase().includes(searchTerm);
    const date = new Date(todo.createdAt);
    const dateMatch =
      (!from || date >= from) &&
      (!to || date <= to);
    return taskMatch && dateMatch;
  });
}

// Pagination
function paginate(array, page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return array.slice(start, start + ITEMS_PER_PAGE);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.addEventListener("click", () => {
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(li);
  }
}

// Add new todo
addTodoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const task = newTodoInput.value.trim();
  if (!task) return;

  try {
    showLoading(true);
    const res = await fetch(API_URL + "/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todo: task, completed: false, userId: 1 })
    });

    if (!res.ok) throw new Error("Failed to add todo.");
    const newTodo = await res.json();
    newTodo.createdAt = new Date(); // simulate
    todos.unshift(newTodo); // add to list
    newTodoInput.value = "";
    renderTodos();
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
});

// Filter button click
filterBtn.addEventListener("click", () => {
  currentPage = 1;
  renderTodos();
});

// Helpers
function showLoading(show) {
  loading.style.display = show ? "block" : "none";
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("d-none");
  setTimeout(() => errorMsg.classList.add("d-none"), 3000);
}

// Init
fetchTodos();
