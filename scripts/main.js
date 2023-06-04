// Retrieve elements from the DOM
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const editedTaskList = document.getElementById('editedTaskList');
const deletedTaskList = document.getElementById('deletedTaskList');
const completedTaskList = document.getElementById('completedTaskList');

// Array to store tasks and deleted tasks
let tasks = [];
let editedTasks = []
let deletedTasks = [];
let completedTasks = [];
// Add event listener to the button
addButton.addEventListener('click', addTask);

// Add event listener to the input field for Enter key
taskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Load tasks from local storage on page load
window.addEventListener('load', () => {
    const storedTasks = localStorage.getItem('tasks');
    const storedCompletedTasks = localStorage.getItem('completedTasks');
    const storedDeletedTasks = localStorage.getItem('deletedTasks');
    const storedEditedTasks = localStorage.getItem('editedTasks');

    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }

    if (storedCompletedTasks) {
        completedTasks = JSON.parse(storedCompletedTasks);
    }

    if (storedDeletedTasks) {
        deletedTasks = JSON.parse(storedDeletedTasks);
    }

    if (storedEditedTasks) {
        editedTasks = JSON.parse(storedEditedTasks);
    }

    renderTasks();
});

// Function clear all tasks
const clearTasksBtn = document.getElementById('clearTasksBtn');
clearTasksBtn.addEventListener('click', clearAllTasks);

function clearAllTasks() {
  // Clear all task arrays
  tasks = [];
  completedTasks = [];
  deletedTasks = [];
  editedTasks = [];

  // Clear local storage
  localStorage.removeItem('tasks');
  localStorage.removeItem('completedTasks');
  localStorage.removeItem('deletedTasks');
  localStorage.removeItem('editedTasks');

  // Render the updated task lists
  renderTasks();
}

// Function to add a new task
function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText !== '') {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      timestamp: new Date().toLocaleString()
    };

    tasks.push(newTask);
    renderTasks();
    taskInput.value = '';
  }
}

// Function to edit a task
function editTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex !== -1) {
    const editedTask = tasks[taskIndex];

    // Check if the task has already been edited
    const existingEditedTaskIndex = editedTasks.findIndex(task => task.id === taskId);

    if (existingEditedTaskIndex !== -1) {
      // Remove the previously edited task from the editedTasks array
      editedTasks.splice(existingEditedTaskIndex, 1);
    }

    // Get the previous text from the edited task in the editedTasks array
    const previousText = editedTask.previousText || editedTask.text;

    // Create an input field for editing the task
    const editInput = document.createElement('input');
    editInput.value = previousText;

    // Create a save button to save the changes
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.disabled = true;

    // Update the save button state based on input changes
    editInput.addEventListener('input', () => {
      const newTaskText = editInput.value.trim();
      saveButton.disabled = newTaskText === '' || newTaskText === editedTask.text;
    });

    // Save the changes when the save button is clicked
    saveButton.addEventListener('click', () => {
      const newTaskText = editInput.value.trim();

      if (newTaskText !== '') {
        const updatedTask = {
          ...editedTask,
          text: newTaskText,
          previousText: editedTask.text,
          edited: true
        };

        tasks.splice(taskIndex, 1, updatedTask);

        // Update the edited task in the editedTasks array as well
        editedTasks[existingEditedTaskIndex] = updatedTask;

        renderTasks();
      }
    });

    // Replace the task item with the input field and save button
    const taskItem = taskList.childNodes[taskIndex];
    taskItem.innerHTML = '';
    taskItem.appendChild(editInput);
    taskItem.appendChild(saveButton);

    // Add the task to the editedTasks array
    if (existingEditedTaskIndex === -1) {
      editedTasks.push(editedTask);
    }
  }
}

// Function to mark a task as completed
function completeTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    const completedTask = tasks.splice(taskIndex, 1)[0];
    completedTask.completed = true; // Update completed flag
    completedTasks.push(completedTask);
    renderTasks();
  }
}

// Function to delete a task
function deleteTask(taskId, category) {
  if (category === 'current') {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const deletedTask = tasks.splice(taskIndex, 1)[0];
      deletedTasks.push(deletedTask);
      renderTasks();
    }
  } else if (category === 'completed') {
    const taskIndex = completedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const deletedTask = completedTasks.splice(taskIndex, 1)[0];
      deletedTask.deletedFrom = 'completed';
      deletedTasks.push(deletedTask);
      renderTasks();
    }
  }
}

// Function to restore a task
function restoreTask(taskId, category) {
  if (category === 'completed') {
    const taskIndex = completedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const restoredTask = completedTasks.splice(taskIndex, 1)[0];
      restoredTask.completed = false; // Update completed flag
      restoredTask.deletedFrom = ''; // Update deletedFrom flag
      tasks.push(restoredTask);
      renderTasks();
    }
  } else if (category === 'deleted') {
    const taskIndex = deletedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const restoredTask = deletedTasks.splice(taskIndex, 1)[0];
      if (!restoredTask.deletedFrom) {
        tasks.push(restoredTask);
      } else if (restoredTask.deletedFrom === 'completed') {
        restoredTask.completed = false; // Update completed flag
        restoredTask.deletedFrom = ''; // Update deletedFrom flag
        completedTasks.push(restoredTask);
      }
      renderTasks();
    }
  }
}

// Function to render the tasks lists
function renderTasks() {
  const placeholderHTML = `
    <div class="placeholder">
      <div>
          <img src="./assets/empty.png" alt="No Tasks" width="30px" height="30px">
      </div>
      <p>Nothing here yet!</p>
    </div>`;

  // Clear the task lists
  taskList.innerHTML = '';
  editedTaskList.innerHTML = '';
  completedTaskList.innerHTML = '';
  deletedTaskList.innerHTML = '';

  // Render current tasks
  if (tasks.length > 0) {
    const maxCurrentTasks = Math.min(tasks.length, 5);
    for (let i = maxCurrentTasks - 1; i >= 0; i--) {
      const li = createTaskListItem(tasks[i], 'current');
      taskList.appendChild(li);
    }
    if (tasks.length > 5) {
      const showMoreBtn = document.createElement('button');
      showMoreBtn.textContent = 'Show More';
      showMoreBtn.addEventListener('click', () => {
        taskList.innerHTML = '';
        tasks.forEach(task => {
          const li = createTaskListItem(task, 'current');
          taskList.appendChild(li);
        });
        taskList.appendChild(showLessBtn);
        taskList.removeChild(showMoreBtn);
      });
      const showLessBtn = document.createElement('button');
      showLessBtn.textContent = 'Show Less';
      showLessBtn.addEventListener('click', () => {
        taskList.innerHTML = '';
        for (let i = maxCurrentTasks - 1; i >= 0; i--) {
          const li = createTaskListItem(tasks[i], 'current');
          taskList.appendChild(li);
        }
        taskList.appendChild(showMoreBtn);
        taskList.removeChild(showLessBtn);
      });
      taskList.appendChild(showMoreBtn);
    }
  } else {
    taskList.innerHTML = placeholderHTML;
  }

  // Render completed tasks
  if (completedTasks.length > 0) {
    const maxCompletedTasks = Math.min(completedTasks.length, 2);
    for (let i = maxCompletedTasks - 1; i >= 0; i--) {
      const li = createTaskListItem(completedTasks[i], 'completed');
      completedTaskList.appendChild(li);
    }
    if (completedTasks.length > 2) {
      const showMoreBtn = document.createElement('button');
      showMoreBtn.textContent = 'Show More';
      showMoreBtn.addEventListener('click', () => {
        completedTaskList.innerHTML = '';
        completedTasks.forEach(task => {
          const li = createTaskListItem(task, 'completed');
          completedTaskList.appendChild(li);
        });
        completedTaskList.appendChild(showLessBtn);
        completedTaskList.removeChild(showMoreBtn);
      });
      const showLessBtn = document.createElement('button');
      showLessBtn.textContent = 'Show Less';
      showLessBtn.addEventListener('click', () => {
        completedTaskList.innerHTML = '';
        for (let i = maxCompletedTasks - 1; i >= 0; i--) {
          const li = createTaskListItem(completedTasks[i], 'completed');
          completedTaskList.appendChild(li);
        }
        completedTaskList.appendChild(showMoreBtn);
        completedTaskList.removeChild(showLessBtn);
      });
      completedTaskList.appendChild(showMoreBtn);
    }
  } else {
    completedTaskList.innerHTML = placeholderHTML;
  }

  // Render deleted tasks
  if (deletedTasks.length > 0) {
    const maxDeletedTasks = Math.min(deletedTasks.length, 2);
    for (let i = maxDeletedTasks - 1; i >= 0; i--) {
      const li = createTaskListItem(deletedTasks[i], 'deleted');
      deletedTaskList.appendChild(li);
    }
    if (deletedTasks.length > 2) {
      const showMoreBtn = document.createElement('button');
      showMoreBtn.textContent = 'Show More';
      showMoreBtn.addEventListener('click', () => {
        deletedTaskList.innerHTML = '';
        deletedTasks.forEach(task => {
          const li = createTaskListItem(task, 'deleted');
          deletedTaskList.appendChild(li);
        });
        deletedTaskList.appendChild(showLessBtn);
        deletedTaskList.removeChild(showMoreBtn);
      });
      const showLessBtn = document.createElement('button');
      showLessBtn.textContent = 'Show Less';
      showLessBtn.addEventListener('click', () => {
        deletedTaskList.innerHTML = '';
        for (let i = maxDeletedTasks - 1; i >= 0; i--) {
          const li = createTaskListItem(deletedTasks[i], 'deleted');
          deletedTaskList.appendChild(li);
        }
        deletedTaskList.appendChild(showMoreBtn);
        deletedTaskList.removeChild(showLessBtn);
      });
      deletedTaskList.appendChild(showMoreBtn);
    }
  } else {
    deletedTaskList.innerHTML = placeholderHTML;
  }

  // Render edited tasks
  if (editedTasks.length > 0) {
    const maxEditedTasks = Math.min(editedTasks.length, 2);
    for (let i = maxEditedTasks - 1; i >= 0; i--) {
      const li = createTaskListItem(editedTasks[i], 'edited');
      editedTaskList.appendChild(li);
    }
    if (editedTasks.length > 2) {
      const showMoreBtn = document.createElement('button');
      showMoreBtn.textContent = 'Show More';
      showMoreBtn.addEventListener('click', () => {
        editedTaskList.innerHTML = '';
        editedTasks.forEach(task => {
          const li = createTaskListItem(task, 'edited');
          editedTaskList.appendChild(li);
        });
        editedTaskList.appendChild(showLessBtn);
        editedTaskList.removeChild(showMoreBtn);
      });
      const showLessBtn = document.createElement('button');
      showLessBtn.textContent = 'Show Less';
      showLessBtn.addEventListener('click', () => {
        editedTaskList.innerHTML = '';
        for (let i = maxEditedTasks - 1; i >= 0; i--) {
          const li = createTaskListItem(editedTasks[i], 'edited');
          editedTaskList.appendChild(li);
        }
        editedTaskList.appendChild(showMoreBtn);
        editedTaskList.removeChild(showLessBtn);
      });
      editedTaskList.appendChild(showMoreBtn);
    }
  } else {
    editedTaskList.innerHTML = placeholderHTML;
  }

  // Save tasks, completed tasks, deleted tasks, and edited tasks to local storage
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
  localStorage.setItem('editedTasks', JSON.stringify(editedTasks));
}

// Function to create a task list item
function createTaskListItem(task, category) {
  const li = document.createElement('li');

  const taskContainer = document.createElement('div');
  taskContainer.classList.add('task-container');

  // Add text element
  const textElement = document.createElement('div');
  textElement.classList.add('task-text');
  textElement.innerText = task.text;

  const iconsContainer = document.createElement('div');
  iconsContainer.classList.add('icons-container');

  // Add timestamp element
  const timestamp = document.createElement('div');
  timestamp.classList.add('timestamp');
  timestamp.textContent = task.timestamp;

  const deleteButton = createIconButton('fas fa-trash-alt delete', 'delete-button', () => {
    if (category === 'edited') {
      const taskIndex = editedTasks.findIndex(editedTask => editedTask.id === task.id);
      if (taskIndex !== -1) {
        editedTasks.splice(taskIndex, 1);
        renderTasks();
      }
    } else {
      deleteTask(task.id, category);
    }
  });

  const restoreButton = createIconButton('fas fa-undo restore', 'restore-button', () => {
    if (category === 'edited') {
      const currentTask = tasks.find(currentTask => currentTask.id === task.id);
      if (currentTask) {
        task.text = currentTask.text;
        renderTasks();
      }
    } else {
      restoreTask(task.id, category);
    }
  });

  const completeButton = createIconButton('fas fa-check complete', 'complete-button', () => completeTask(task.id, category));

  if (category === 'current') {
    const editButton = createIconButton('fas fa-edit edit', 'edit-button', () => editTask(task.id));

    taskContainer.appendChild(textElement);
    iconsContainer.appendChild(editButton);
    iconsContainer.appendChild(deleteButton);
    iconsContainer.appendChild(completeButton);
  } else if (category === 'edited') {
    const textContainer = document.createElement('div');

    const fromLabel = document.createElement('span');
    fromLabel.innerText = 'From: ';

    const oldText = document.createElement('span');
    oldText.innerText = task.previousText || '';
    oldText.classList.add('old-text');
    oldText.style.textDecoration = 'line-through';

    const toLabel = document.createElement('span');
    toLabel.innerText = ' To: ';
    toLabel.style.marginTop = '0.5rem';

    const newText = document.createElement('span');
    newText.innerText = task.text || '';
    newText.classList.add('new-text');

    textContainer.appendChild(fromLabel);
    textContainer.appendChild(oldText);
    textContainer.appendChild(document.createElement('br'));
    textContainer.appendChild(toLabel);
    textContainer.appendChild(newText);

    taskContainer.appendChild(textContainer);
    iconsContainer.appendChild(restoreButton);
    iconsContainer.appendChild(deleteButton);
  } else if (category === 'completed') {
    taskContainer.appendChild(textElement);
    iconsContainer.appendChild(restoreButton);
    iconsContainer.appendChild(deleteButton);
  } else if (category === 'deleted') {
    taskContainer.appendChild(textElement);
    iconsContainer.appendChild(restoreButton);
  }

  taskContainer.appendChild(iconsContainer);

  li.appendChild(taskContainer);
  li.appendChild(timestamp);

  return li;
}


// Function to create an icon button
function createIconButton(iconClass, buttonClass, clickHandler) {
    const button = document.createElement('button');
    button.classList.add(buttonClass);
    button.addEventListener('click', clickHandler);

    const icon = document.createElement('i');
    icon.className = iconClass;

    button.appendChild(icon);

    return button;
}
