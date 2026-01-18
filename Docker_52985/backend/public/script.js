document.addEventListener('DOMContentLoaded', () => {
  const userForm = document.getElementById('user-form');
  const userNameInput = document.getElementById('user-name');
  const userSelect = document.getElementById('user-select');

  const taskForm = document.getElementById('task-form');
  const taskTitleInput = document.getElementById('task-title');

  const tasksList = document.getElementById('tasks-list');

  const filterAll = document.getElementById('filter-all');
  const filterTodo = document.getElementById('filter-todo');
  const filterDone = document.getElementById('filter-done');

  const searchInput = document.getElementById('search-input');

  let users = [];
  let tasks = [];
  let currentFilter = 'all';
  let searchQuery = '';

  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = userNameInput.value.trim();
    if (!name) return;

    const res = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const newUser = await res.json();
    users.push(newUser);
    updateUserSelect();
    userNameInput.value = '';
  });

  function updateUserSelect() {
    userSelect.innerHTML = '<option value="">User</option>';
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = u.name;
      userSelect.appendChild(opt);
    });
  }

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const userId = userSelect.value;

    if (!title || !userId) {
      alert('Enter task title and select user');
      return;
    }

    const res = await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        status: 'todo',
        user_id: userId
      })
    });

    const newTask = await res.json();
    tasks.push(newTask);
    taskTitleInput.value = '';
    renderTasks();
  });

  function renderTasks() {
    tasksList.innerHTML = '';

    let filtered = tasks;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(t => t.status === currentFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery)
      );
    }

    filtered.forEach(task => {
      const user = users.find(u => u.id == task.user_id);

      const div = document.createElement('div');
      div.className = 'task';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.status === 'done';

      const span = document.createElement('span');
      span.textContent = `${task.title} (User: ${user ? user.name : '-'})`;
      span.style.textDecoration =
        task.status === 'done' ? 'line-through' : 'none';

      span.ondblclick = () => {
        const input = document.createElement('input');
        input.value = task.title;

        input.onblur = async () => {
          const newTitle = input.value.trim();
          if (!newTitle) {
            renderTasks();
            return;
          }

          task.title = newTitle;

          await fetch(`/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newTitle,
              status: task.status,
              user_id: task.user_id
            })
          });

          renderTasks();
        };

        div.replaceChild(input, span);
        input.focus();
      };

      checkbox.addEventListener('change', async () => {
        task.status = checkbox.checked ? 'done' : 'todo';
        span.style.textDecoration =
          task.status === 'done' ? 'line-through' : 'none';

        await fetch(`/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            status: task.status,
            user_id: task.user_id
          })
        });

        renderTasks();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑';
      deleteBtn.className = 'delete-btn';

      deleteBtn.onclick = async () => {
        const ok = confirm('Delete task?');
        if (!ok) return;

        await fetch(`/tasks/${task.id}`, {
          method: 'DELETE'
        });

        tasks = tasks.filter(t => t.id !== task.id);
        renderTasks();
      };

      div.appendChild(checkbox);
      div.appendChild(span);
      div.appendChild(deleteBtn);

      tasksList.appendChild(div);
    });
  }

  filterAll.onclick = () => {
    currentFilter = 'all';
    renderTasks();
  };

  filterTodo.onclick = () => {
    currentFilter = 'todo';
    renderTasks();
  };

  filterDone.onclick = () => {
    currentFilter = 'done';
    renderTasks();
  };

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase();
    renderTasks();
  });

  async function init() {
    const usersRes = await fetch('/users');
    users = await usersRes.json();
    updateUserSelect();

    const tasksRes = await fetch('/tasks');
    tasks = await tasksRes.json();
    renderTasks();
  }

  init();
});
