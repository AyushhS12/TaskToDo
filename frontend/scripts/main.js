let todos = [];
const renderTodos = () => {
    list.innerHTML = "";
    if (todos.length == 0) return;
    todos.forEach((x) => {
        list.innerHTML += `<li class="todo-item" data-id="${x.id}">
    <div class="todo-info">
        <h3>${x.title}</h3>
        <div class="desc-container">
            <p class="todo-desc">${x.description}</p>
            ${x.description.length > 50 ? `<button class="btn-expand">Read more</button>` : ''}
        </div>
    </div>
    <div class="todo-actions">
        <button class="action-btn btn-check ${x.completed ? "completed-btn" : ""}" onclick="handleCompleteBtn(this,${x.id},${x.user_id})">
            ${x.completed ? "✔" : "✓"}
        </button>
        <button class="action-btn btn-edit" onclick="openEditModal(${x.id})">✎</button>
        <button class="action-btn btn-delete" onclick="handleDeleteTodo(${x.id},${x.user_id})">✕</button>
    </div>
</li>`;
    });
};
const updateTodos = (x) => {
    todos.push(x);
    list.innerHTML += `<li class="todo-item" data-id="${x.id}">
    <div class="todo-info">
        <h3>${x.title}</h3>
        <div class="desc-container">
            <p class="todo-desc">${x.description}</p>
            ${x.description.length > 50 ? `<button class="btn-expand" onclick="toggleExpand(this)">Read more</button>` : ''}
        </div>
    </div>
    <div class="todo-actions">
        <button class="action-btn btn-check ${x.completed ? "completed-btn" : ""}" onclick="handleCompleteBtn(this,${x.id},${x.user_id})">
            ${x.completed ? "✔" : "✓"}
        </button>
        <button class="action-btn btn-edit" onclick="openEditModal(${x.id},${x.user_id})">✎</button>
        <button class="action-btn btn-delete">✕</button>
    </div>
</li>`;
};

window.onload = async () => {
    try {
        const response = await fetch("http://localhost:8080/todo/all", {
            credentials: "include",
        });

        // If the middleware returned 401, this will be false
        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const res = await response.json();
        todos = res.todos;
        // Call a function to render your UI now that you have data
        renderTodos();
    } catch (e) {
        // This line is for Debugging
        // console.log("Real Error: ",e.message);
        console.log("Auth failed, redirecting...");
        window.location.href = "/auth.html";
    }
};
const list = document.getElementById("todo-list");

// Toggle Complete property of the todo
const completedBtn = document.getElementById("completed")

const handleCompleteBtn = async (btn, id, user_id) => {
    try {
        const response = await fetch(`http://localhost:8080/todo/complete`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, user_id }),
        });
        if (!response.ok) {
            throw new Error("Update Failed")
            return
        }
        const index = todos.findIndex((t) => t.id == id);
        todos[index].completed = !todos[index].completed;

        renderTodos()
    } catch (e) {
        console.log(e)
    }
}

const titleInput = document.getElementById("todo-title");
const descriptionInput = document.getElementById("todo-desc");
const button = document.getElementById("add-btn");
button.addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:8080/todo/create", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: titleInput.value,
                description: descriptionInput.value,
            }),
        });
        if (!response.ok) {
            throw new Error("cannot create the todo, try again");
            return;
        }
        const res = await response.json();
        updateTodos(res.todo);
        console.log(res);
    } catch (e) {
        console.log(e);
    }
});

// For Expanding the Description Text

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-expand")) {
        const btn = e.target;
        const container = btn.parentElement;

        container.classList.toggle("expanded");

        btn.innerText = container.classList.contains("expanded")
            ? "Show less"
            : "Read more";
    }
});

document.querySelectorAll('.desc-container').forEach(container => {
    const text = container.querySelector('.todo-desc');
    const btn = container.querySelector('.btn-expand');

    if (!btn) return;

    if (text.scrollHeight <= text.clientHeight) {
        btn.style.display = 'none'; // no overflow → hide button
    }
});

// To control the Modal and edit the todo
const modal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const saveEditBtn = document.getElementById("save-edit-btn");

// 1. Function to open modal and pre-fill data
const openEditModal = (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    document.getElementById("edit-id").value = todo.id;
    document.getElementById("edit-title").value = todo.title;
    document.getElementById("edit-desc").value = todo.description;

    modal.style.display = "flex";
};

// 2. Close modal logic
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};

// 3. Handle the Update (POST)
saveEditBtn.onclick = async () => {
    const id = document.getElementById("edit-id").value;
    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-desc").value;

    try {
        const response = await fetch(`http://localhost:8080/todo/edit`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title, description }),
        });

        if (!response.ok) throw new Error("Update failed");

        // Update local state
        console.log(await response.json())
        const index = todos.findIndex((t) => t.id == id);
        todos[index] = { ...todos[index], title, description };

        // Re-render the whole list to show changes (since you have it)
        renderTodos();
        modal.style.display = "none";
    } catch (e) {
        console.error(e);
        alert("Failed to update todo");
    }
};

// Handle Delete

const handleDeleteTodo = async (id,user_id) => {
    try {
        const response = await fetch(`http://localhost:8080/todo/delete`, {
            method: "DELETE",
            credentials: "include", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, user_id }),
        });

        console.log(await response.json())
        if (!response.ok) throw new Error("Delete failed");
        // Update local state
        todos = todos.filter(t => t.id != id);

        renderTodos()
    } catch (e) {
        console.log(e)
    }
}