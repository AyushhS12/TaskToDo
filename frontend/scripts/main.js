let todos = [];
const renderTodos = () => {
    list.innerHTML = "";
    todos.forEach((x) => {
        list.innerHTML += `<li class="todo-item">
                                        <div class="todo-info">
                                            <h3>${x.title}</h3>
                                            <p>${x.description}</p>
                                        <div class="todo-actions">
                                            <button class="action-btn btn-check">✓</button>
                                            <button class="action-btn btn-edit" id="edit-btn" onclick="openEditModal(${x.id})">✎</button>
                                            <button class="action-btn btn-delete">✕</button>
                                        </div>
                                    </li>`;
    });
};
const updateTodos = (todo) => {
    todos.push(todo);
    list.innerHTML += `<li class="todo-item">
                                        <div class="todo-info">
                                            <h3>${todo.title}</h3>
                                            <p>${todo.description}</p>
                                        <div class="todo-actions">
                                            <button class="action-btn btn-check">✓</button>
                                            <button class="action-btn btn-edit" id="edit-btn" onclick="openEditModal(${todo.id})">✎</button>
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
        console.log("Auth failed, redirecting...");
        window.location.href = "/auth.html";
    }
};
const list = document.getElementById("todo-list");
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
