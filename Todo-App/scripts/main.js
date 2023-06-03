// Retrieve elements from the DOM
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');

// Add event listener to the button
addButton.addEventListener('click', addTask);

// Function to add a new task
function addTask() {
  const taskText = taskInput.value;

  if (taskText) {
    const li = document.createElement('li');
    li.innerText = taskText;

    // Add event listener to mark task as completed
    li.addEventListener('click', completeTask);

    taskList.appendChild(li);
    taskInput.value = '';
  }
}

// Function to mark a task as completed
function completeTask() {
  this.classList.toggle('completed');
}
