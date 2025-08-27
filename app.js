const input = document.getElementById("todo-input");
const timeInput = document.getElementById("todo-time");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");

const API_URL = "https://api-server-a6k1.onrender.com/todolists";

let todos = [];

async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    todos = await res.json();
    renderTodos();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function renderTodos() {
  todoList.innerHTML = "";
  const now = new Date();

  todos.forEach(todo => {
    const li = document.createElement("li");
    const deadline = new Date(todo.deadline);
    const overdue = deadline < now && !todo.done;

    li.className = overdue ? "overdue" : "";

    li.innerHTML = `
      <div>
        <span style="text-decoration:${todo.done ? 'line-through' : 'none'}">
          ${todo.text}
        </span>
        <small>🕒 ${deadline.toLocaleString()}</small>
      </div>
      <div>
        <button class="done-btn">✔</button>
        <button class="delete-btn">✖</button>
      </div>
    `;

    li.querySelector(".done-btn").addEventListener("click", () => toggleDone(todo._id));
    li.querySelector(".delete-btn").addEventListener("click", () => deleteTodo(todo._id));

    todoList.appendChild(li);
  });
}

async function addTodo() {
  const text = input.value.trim();
  const deadline = timeInput.value;

  if (!text || !deadline) return;

  const newTodo = { text, done: false, deadline };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo)
    });
    const data = await res.json();
    todos.push(data);
    input.value = "";
    timeInput.value = "";
    renderTodos();
  } catch (err) {
    console.error("Add error:", err);
  }
}

async function deleteTodo(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    todos = todos.filter(todo => todo._id !== id);
    renderTodos();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

async function toggleDone(id) {
  const todo = todos.find(t => t._id === id);
  const updatedDone = !todo.done;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: updatedDone })
    });
    todo.done = updatedDone;
    renderTodos();
  } catch (err) {
    console.error("Toggle error:", err);
  }
}

addBtn.addEventListener("click", addTodo);
input.addEventListener("keypress", e => { if (e.key === "Enter") addTodo(); });
timeInput.addEventListener("keypress", e => { if (e.key === "Enter") addTodo(); });

fetchTodos();
