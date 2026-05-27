import { loadTasks, saveTasks, setSaveErrorCallback } from './storage.js';

let tasks = [];

function renderList(taskList) {
  const ul = document.getElementById('task-list');
  ul.innerHTML = '';

  const incomplete = taskList.filter(t => !t.completed);
  const completed = taskList.filter(t => t.completed);
  const sorted = [...incomplete, ...completed];

  for (const task of sorted) {
    const li = document.createElement('li');
    if (task.completed) {
      li.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.id = task.id;
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', handleToggleComplete);

    const span = document.createElement('span');
    span.textContent = task.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.dataset.id = task.id;
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', handleDelete);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  }
}

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError() {
  const el = document.getElementById('error-message');
  el.textContent = '';
  el.style.display = 'none';
}

function showPersistenceWarning() {
  const ul = document.getElementById('task-list');
  const warning = document.createElement('p');
  warning.textContent = 'Could not save — changes may not persist';
  warning.style.color = 'orange';
  ul.parentNode.insertBefore(warning, ul);
  setTimeout(() => warning.remove(), 4000);
}

function handleAddTask() {
  try {
    const input = document.getElementById('task-input');
    const name = input.value.trim();

    if (!name) {
      showError('Task name is required');
      return;
    }

    clearError();

    const task = {
      id: crypto.randomUUID(),
      name,
      completed: false,
    };

    tasks.push(task);
    saveTasks(tasks);
    renderList(tasks);
    input.value = '';
  } catch (err) {
    console.error('handleAddTask error', err);
  }
}

function handleToggleComplete(event) {
  try {
    const id = event.target.dataset.id;
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = event.target.checked;
      saveTasks(tasks);
      renderList(tasks);
    }
  } catch (err) {
    console.error('handleToggleComplete error', err);
  }
}

function handleDelete(event) {
  try {
    const id = event.target.dataset.id;
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderList(tasks);
  } catch (err) {
    console.error('handleDelete error', err);
  }
}

function handleClearCompleted() {
  try {
    tasks = tasks.filter(t => !t.completed);
    saveTasks(tasks);
    renderList(tasks);
  } catch (err) {
    console.error('handleClearCompleted error', err);
  }
}

function init() {
  setSaveErrorCallback(showPersistenceWarning);

  tasks = loadTasks();
  renderList(tasks);

  document.getElementById('add-task-btn').addEventListener('click', handleAddTask);
  document.getElementById('clear-completed-btn').addEventListener('click', handleClearCompleted);

  // DR-001: clear error on any keystroke in the input
  document.getElementById('task-input').addEventListener('input', clearError);
}

document.addEventListener('DOMContentLoaded', init);
