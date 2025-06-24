document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todo-input");
  const addTaskButton = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const prioritySelect = document.getElementById("priority-select");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks() {
    todoList.innerHTML = "";
    let filteredTasks = tasks;
    if (currentFilter === "active") {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
      filteredTasks = tasks.filter(task => task.completed);
    }
    filteredTasks.forEach(task => renderTask(task));
  }

  function renderTask(task) {
    const li = document.createElement("li");
    li.setAttribute("data-id", task.id);
    li.setAttribute("data-priority", task.priority);
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <span class="priority-label ${task.priority}">${task.priority}</span>
      <span class="task-text">${task.text}</span>
      <button class="delete-btn">Delete</button>
    `;

    // Toggle completed status
    li.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.classList.contains("priority-label")) return;
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // Delete task
    li.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      tasks = tasks.filter(t => t.id !== task.id); // <-- Fixed bug: should be !==
      saveTasks();
      renderTasks();
    });

    // Edit task on double click
    li.querySelector(".task-text").addEventListener("dblclick", (e) => {
      e.stopPropagation();
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      input.className = "edit-input";
      li.replaceChild(input, e.target);
      input.focus();

      input.addEventListener("blur", () => {
        const newText = input.value.trim();
        if (newText) {
          task.text = newText;
          saveTasks();
          renderTasks();
        } else {
          renderTasks();
        }
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") input.blur();
      });
    });

    todoList.appendChild(li);
  }

  // Add new task
  addTaskButton.addEventListener("click", () => {
    const taskText = todoInput.value.trim();
    const priority = prioritySelect.value;
    if (taskText === "") return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: priority,
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    todoInput.value = "";
    todoInput.focus();
  });

  // Filter functionality
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      renderTasks();
    });
  });

  // Initial render
  renderTasks();
});
