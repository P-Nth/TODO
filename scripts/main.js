// Retrieve elements from the DOM
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');

const taskList = document.getElementById('taskList');
const clearTasksBtn = document.getElementById('clearTasksBtn');
const editedTaskList = document.getElementById('editedTaskList');
const deletedTaskList = document.getElementById('deletedTaskList');
const completedTaskList = document.getElementById('completedTaskList');

// Array to store tasks
let allTasks = []; newTasks = []; completedTasks = []; editedTasks = []; deletedTasks = [];

// Initialize placeholders
const placeholderHTML = `
    <div class="placeholder">
      <div>
          <img src="../assets/empty.png" alt="No Tasks" width=32 height=32 />
      </div>
      <p>Nothing here yet!</p>
    </div>`
taskList.innerHTML = placeholderHTML;
editedTaskList.innerHTML = placeholderHTML;
deletedTaskList.innerHTML = placeholderHTML;
completedTaskList.innerHTML = placeholderHTML;

class Task {
    constructor(taskText) {
        this.type = 'new'
        this.edited = false
        this.id = Date.now()
        this.text = taskText
        this.deletedFrom = ''
        this.restoredFrom = ''
        this.previousText = ''
        this.timestamp = new Date().toLocaleTimeString()
    }
}

class TaskUI {
    // Add a task
    addTask() {
        let taskText = taskInput.value.trim();
        const newTask = taskText !== '' && new Task(taskText);
        allTasks.push(newTask);
        taskInput.value = '';
        this.renderTask('new', 5);
    }

    // Edit a task
    editTask(taskId) {
        const taskItem = taskList.querySelector(`[data-id="${taskId}"]`);

        if (taskItem) {
            const taskIndex = newTasks.findIndex(task => task.id === taskId);
            const editedTask = newTasks[taskIndex];

            // Check if the task has already been edited
            const existingEditedTaskIndex = editedTasks.findIndex(task => task.id === taskId);

            // Remove the previously edited task from the editedTasks array
            if (existingEditedTaskIndex !== -1) editedTasks.splice(existingEditedTaskIndex, 1);

            // Get the previous text from the edited task in the editedTasks array
            const previousText = editedTask.previousText || editedTask.text;

            // Create the div for edit input
            const editInputContainer = document.createElement('div');
            editInputContainer.classList.add('edit-input');

            // Create an input field for editing the task
            const editInput = document.createElement('input');
            editInput.value = editedTask.text;

            // Create a save button to save the changes
            const saveButton = document.createElement('button');
            const cancelButton = document.createElement('button');
            saveButton.innerText = 'Save';
            cancelButton.innerText = 'Cancel';

            // Save/undo  the changes when a button is clicked
            saveButton.addEventListener('click', () => {
                if (editInput.value !== '') {
                    editedTask.edited = true
                    editedTask.previousText = editedTask.text
                    editedTask.text = editInput.value;
                    newTasks.splice(taskIndex, 1).unshift(editedTask);

                    // Update the edited task in the editedTasks array as well
                    editedTasks[existingEditedTaskIndex] = editedTask

                    // Render edited tasks
                    this.renderTask('edited', 2);
                    this.renderTask('new', 5);
                }
            });
            cancelButton.addEventListener('click', () => {this.renderTask('new', 5)})

            // Replace the task item with the input field and save button
            taskItem.innerHTML = '';
            taskItem.appendChild(editInputContainer);
            editInputContainer.appendChild(editInput);
            editInputContainer.appendChild(cancelButton);
            editInput.addEventListener("input", () => {editInputContainer.appendChild(saveButton)});

            // Add the task to the editedTasks array
            if (existingEditedTaskIndex === -1) {
                editedTasks.unshift(editedTask);
            }
        }
    }

    // Complete a task
    completeTask(taskId) {
        let taskIndex = newTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const completedTask = newTasks.splice(taskIndex, 1)[0];
            completedTask.type = 'completed';
            completedTasks.unshift(completedTask);

            // Render completed tasks
            this.renderTask('new', 5);
            this.renderTask(completedTask.type, 3);
        }
    }

    // Delete a task
    deleteTask(taskId, category) {
        let sourceArray, deletedTask;

        category === 'new'
            ? sourceArray = newTasks
            : category === 'completed'
                ? sourceArray = completedTasks
                : category === 'edited'
                    ? sourceArray = editedTasks
                    : console.error(`Unexpected category: ${category}`);
        const taskIndex = sourceArray.findIndex(t => t.id === taskId);
        console.log(taskIndex)
        if (taskIndex !== -1) {
            if (category === 'edited') {
                sourceArray.splice(taskIndex, 1)
            } else {
                deletedTask = sourceArray.splice(taskIndex, 1)[0];
                deletedTask.type = 'deleted';
                deletedTask.deletedFrom = category;
                deletedTasks.unshift(deletedTask);
            }

            // Render deleted tasks
            this.renderTask('completed', 3);
            this.renderTask('deleted', 2);
            this.renderTask('edited', 2);
            this.renderTask('new', 5);
        }
    }

    // Restore a task
    restoreTask(task, category) {
        let sourceArray;

        category === 'edited'
            ? sourceArray = editedTasks
            : category === 'completed'
                ? sourceArray = completedTasks
                : category === 'deleted'
                    ? sourceArray = deletedTasks
                    : console.error(`Unexpected category: ${category}`);

        const taskIndex = sourceArray.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            const restoredTask = sourceArray.splice(taskIndex, 1)[0];
            if (category === 'edited') {
                newTasks[taskIndex].text = restoredTask.previousText;
            } else if (category === 'completed') {
                restoredTask.type = 'new';
                restoredTask.restoredFrom = 'completed';
                newTasks.unshift(restoredTask)
            } else {
                if (restoredTask.deletedFrom === 'new') {
                    restoredTask.type = 'new';
                    restoredTask.deletedFrom = '';
                    restoredTask.restoredFrom = "deleted";
                    newTasks.unshift(restoredTask)
                } else {
                    restoredTask.deletedFrom = '';
                    restoredTask.type = 'completed';
                    restoredTask.restoredFrom = 'deleted';
                    completedTasks.unshift(restoredTask);
                }
            }

            this.renderTask('completed', 3);
            this.renderTask('deleted', 2);
            this.renderTask('edited', 2);
            this.renderTask('new', 5);
        }
    }

    // Render a task
    renderTask(category, maxShow) {
        let sourceArray, list;

        category === 'new'
            ? (sourceArray = newTasks) && (list = taskList)
            : category === 'completed'
                ? (sourceArray = completedTasks) && (list = completedTaskList)
                : category === 'deleted'
                    ? (sourceArray = deletedTasks) && (list = deletedTaskList)
                    : (sourceArray = editedTasks) && (list = editedTaskList)

        if (allTasks.length > 0) {
            for (let i=0; i<=allTasks.length-1; i++) {
                allTasks[i].type === 'new' && !newTasks.includes(allTasks[i]) && newTasks.unshift(allTasks[i]);
                allTasks[i].type === 'edited' && !editedTasks.includes(allTasks[i]) && editedTasks.push(allTasks[i]);
                allTasks[i].type === 'deleted' && !deletedTasks.includes(allTasks[i]) && deletedTasks.push(allTasks[i]);
                allTasks[i].type === 'completed' && !completedTasks.includes(allTasks[i]) && completedTasks.push(allTasks[i]);
            }
        }

        // Render the tasks
        if (sourceArray.length !== 0) {
            // Clear the task lists
            list.innerHTML = ''

            if (sourceArray.length <= maxShow) {
                sourceArray.forEach(task => {
                    const li = this.createTaskListItem(task, category);
                    list.appendChild(li);
                });
            }
            else {
                let tasksToDisplay = 0;

                while (tasksToDisplay < maxShow) {
                    const li = this.createTaskListItem(sourceArray[tasksToDisplay], category);
                    list.appendChild(li);
                    tasksToDisplay++;
                }

                const showMoreBtn = document.createElement('button');
                showMoreBtn.textContent = 'Show All';
                showMoreBtn.addEventListener('click', (type) => {
                    list.innerHTML = '';
                    sourceArray.forEach(task => {
                        const li = this.createTaskListItem(task, category);
                        list.appendChild(li);
                    });
                    list.appendChild(showLessBtn);
                    list.removeChild(showMoreBtn);
                });

                const showLessBtn = document.createElement('button');
                showLessBtn.textContent = 'Show Less';
                showLessBtn.addEventListener('click', () => {
                    list.innerHTML = '';
                    for (let i=0; i<tasksToDisplay; i++) {
                        const li = this.createTaskListItem(sourceArray[i], category);
                        list.appendChild(li);
                    }
                    list.appendChild(showMoreBtn);
                    list.removeChild(showLessBtn);
                });

                list.appendChild(showMoreBtn);
            }
        } else list.innerHTML = placeholderHTML;

        localStorage.setItem('tasks', JSON.stringify(allTasks));

    }

    // Create a task list item
    createTaskListItem(task, category)  {
        const li = document.createElement('li');
        li.dataset.id = task.id; // Add data-id attribute with the task ID

        // Add icons
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('icons-container');

        // Add text
        const textElement = document.createElement('div');
        textElement.classList.add('task-text');
        if (category === 'edited') {
            const previousText = document.createElement('div')
            previousText.innerText = `From: ${task.previousText}`
            textElement.appendChild(previousText);
            const updatedText = document.createElement('div')
            updatedText.innerText = `To: ${task.text}`
            textElement.appendChild(updatedText);
        } else textElement.innerText = task.text;

        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = task.timestamp;

        // Declare task container
        const taskContainer = document.createElement('div');
        taskContainer.classList.add('task-container');
        taskContainer.appendChild(textElement);
        taskContainer.appendChild(iconsContainer);
        li.appendChild(taskContainer);
        li.appendChild(timestamp);

        const editButton = TaskUI.createIconButton('fas fa-edit edit', 'edit-button', () => this.editTask(task.id));
        const completeButton = TaskUI.createIconButton('fas fa-check complete', 'complete-button', () => this.completeTask(task.id));
        const restoreButton = TaskUI.createIconButton('fas fa-undo restore', 'restore-button', () => this.restoreTask(task, category));
        const deleteButton = TaskUI.createIconButton('fas fa-trash-alt delete', 'delete-button', () => this.deleteTask(task.id, category));

        category === ('new') && iconsContainer.appendChild(editButton) && iconsContainer.appendChild(completeButton) && iconsContainer.appendChild(deleteButton);
        category === ('completed') && iconsContainer.appendChild(restoreButton) && iconsContainer.appendChild(deleteButton);
        category === ('edited') && iconsContainer.appendChild(restoreButton) && iconsContainer.appendChild(deleteButton);
        category === ('deleted') && iconsContainer.appendChild(restoreButton);

        return li;
    }

    // Create an icon button
    static createIconButton(iconClass, buttonClass, clickHandler) {
        const button = document.createElement('button');
        button.classList.add(buttonClass);
        button.addEventListener('click', clickHandler);

        const icon = document.createElement('i');
        icon.className = iconClass;

        button.appendChild(icon);

        return button;
    }

    // Clear all tasks
    clearAllTasks(e) {
        allTasks = [];
        newTasks.splice(0, newTasks.length);
        editedTasks.splice(0, editedTasks.length);
        deletedTasks.splice(0, deletedTasks.length);
        completedTasks.splice(0, completedTasks.length);

        // Clear local storage
        localStorage.removeItem('tasks');

        // Render the updated task lists
        this.renderTask('completed', 3);
        this.renderTask('deleted', 2);
        this.renderTask('edited', 2);
        this.renderTask('new', 5);
    }
}

// Instantiate TaskUI
let taskUI = new TaskUI();

// Load tasks from local storage on page load
window.addEventListener('load', () => {
    const storedTasks = localStorage.getItem('tasks');
    storedTasks && (allTasks = JSON.parse(storedTasks));

    // Render deleted tasks
    taskUI.renderTask('completed', 3);
    taskUI.renderTask('deleted', 2);
    taskUI.renderTask('edited', 2);
    taskUI.renderTask('new', 5);
});

// Add event listener to the button & input field
addButton.addEventListener('click', () => taskUI.addTask());
taskInput.addEventListener('keypress', (e) => {e.key === 'Enter' && taskUI.addTask()});

// Clear Task Button
clearTasksBtn.addEventListener('click', (e) => taskUI.clearAllTasks(e));

