class TODO {
  constructor() {
    this.args = {
      idLabel: document.querySelector("#id-field"),
      timeLabel: document.querySelector("#time-field"),
      mainDiv: document.querySelector(".todoDisplay"),
      newTodo: document.querySelector("#add-new-todo"),
      todoInput: document.querySelector("#body-field"),
      createTodo: document.querySelector("#create-todo"),
      updateTodo: document.querySelector("#update-todo"),
      displayDiv: document.querySelector(".todoDisplay"),
    };

    this.state = false;
    this.Todos = [];
  }

  displayTodos() {
    const {
      idLabel,
      timeLabel,
      newTodo,
      todoInput,
      createTodo,
      updateTodo,
      displayDiv,
    } = this.args;

    createTodo.style.display = "none";
    updateTodo.style.display = "none";

    this.getAllTodos(displayDiv);

    newTodo.addEventListener("click", () => {
      this.mapDateAndTime(idLabel, timeLabel, createTodo);
      this.generateID();
      this.getTimeStamp();
    });

    createTodo.addEventListener("click", () => {
      this.onSubmitTodo(idLabel, timeLabel, todoInput, createTodo, updateTodo);
    });

    this.manageTodoItems(displayDiv, idLabel, timeLabel, todoInput, updateTodo);
  }

  getAllTodos(displayDiv) {
    axios
      .get("http://localhost:8000/posts")
      .then((res) => {
        this.Todos.push(...res.data);
        if (this.Todos.length == 0) {
          displayDiv.innerHTML += `
          <div class = "empty-todo">
          <img src="./assets/images/undraw_empty_xct9.png" alt="empty image" style="width: 50%;">
          <br>
          <span style="font-family: 'Fira Sans', sans-serif; font-size: 20px; font-weight: bold; padding: 1em; cursor: unset;">There are no todos yet...</span>
          <br>
          </div>
          `;
        } else {
          for (let key in this.Todos) {
            let todo = this.Todos[key];
            displayDiv.innerHTML += `
            <div id="${todo.id}" class="${todo.status}">
            <span id="${todo.message}" class="todoItem">
              <div>
              ${
                todo.status === "Complete"
                  ? `<p style="text-decoration: line-through;" id="todoMessage">${todo.message}</p>`
                  : `<p id="todoMessage">${todo.message}</p>`
              }
                <p id="todoTimestamp">${todo.time}</p>
              </div>
              ${
                todo.status === "Complete"
                  ? `<p class="todo-status complete">▪️ ${todo.status} ▪️</p>`
                  : `<p class="todo-status incomplete">▪️ ${todo.status} ▪️</p>`
              }
              <div id="${todo.id}" class="edit-todo-icons">
                <i class="far fa-edit"></i>
                <i class="far fa-trash-alt"></i>
                ${
                  todo.status === "Complete"
                    ? ""
                    : '<i class="fas fa-check"></i>'
                }
              </div>
            </span>
          </div>`;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  generateID() {
    let id = `${Math.random().toString(36).substr(2, 6)}-${Math.random()
      .toString(36)
      .substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random()
      .toString(36)
      .substr(2, 6)}`;
    return id;
  }

  getTimeStamp() {
    let date = new Date();
    let time = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return time;
  }

  mapDateAndTime(idLabel, timeLabel, createTodo) {
    // add generated id and time to new todo item
    idLabel.value = this.generateID();
    timeLabel.value = this.getTimeStamp();
    createTodo.style.display = "block";
  }

  onSubmitTodo(idLabel, timeLabel, todoInput, createTodo) {
    const id = idLabel.value;
    const time = timeLabel.value;
    const message = this.convertToString(todoInput.value);
    const status = "Not complete";
    this.addNewTodo(id, time, message, status);
    idLabel.value = "";
    timeLabel.value = "";
    todoInput.value = "";
    createTodo.style.display = "none";
  }

  convertToString(value) {
    if (value[0] === "<") {
      value = "Try something else";
      return value;
    } else {
      value = value;
      return value;
    }
  }

  addNewTodo(id, time, message, status) {
    axios
      .post("http://localhost:8000/posts", { id, time, message, status })
      .then((res) => console.log(res.data))
      .catch((error) => console.log(error));
  }

  manageTodoItems(displaydiv, idLabel, timeLabel, todoInput, updateTodo) {
    displaydiv.addEventListener("click", (e) => {
      const identifier = e.target.parentElement.parentElement.parentElement.id;
      const todoMessage = e.target.parentElement.parentElement.id;
      if (e.target.classList.contains("fa-edit")) {
        this.editTodo(
          idLabel,
          identifier,
          timeLabel,
          todoInput,
          todoMessage,
          updateTodo
        );
      }

      if (e.target.classList.contains("fa-trash-alt")) {
        this.deleteTodo(identifier);
      }

      if (e.target.classList.contains("fa-check")) {
        // this.markTodoAsComplete();
      }
    });
  }

  editTodo(id, currentId, time, message, currentmsg, updateButton) {
    id.value = currentId;
    time.value = this.getTimeStamp();
    message.value = currentmsg;
    updateButton.style.display = "block";

    updateButton.addEventListener("click", () => {
      id.value = "";
      time.value = "";
      message.value = "";
      updateButton.style.display = "none";
    });
  }

  deleteTodo = (itemId) => {
    axios
      .delete(`http://localhost:8000/posts/${itemId}`)
      .then(this.getAllTodos());
  };
}
const todoItem = new TODO();
todoItem.displayTodos();
