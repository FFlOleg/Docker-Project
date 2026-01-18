const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  host: 'db',
  user: 'user',
  password: 'pass',
  database: 'taskdb',
  port: 5432
});

async function waitForDB() {
  let connected = false;
  while (!connected) {
    try {
      await pool.query('SELECT 1');
      connected = true;
    } catch {
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Users fetch failed' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO users(name) VALUES($1) RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'User create failed' });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Tasks fetch failed' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { title, status = 'todo', user_id } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks(title, status, user_id) VALUES($1,$2,$3) RETURNING *',
      [title, status, user_id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Task create failed' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, status, user_id } = req.body;
    const fields = [];
    const values = [];
    let index = 1;

    if (title !== undefined) {
      fields.push(`title=$${index++}`);
      values.push(title);
    }

    if (status !== undefined) {
      fields.push(`status=$${index++}`);
      values.push(status);
    }

    if (user_id !== undefined) {
      fields.push(`user_id=$${index++}`);
      values.push(user_id);
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    values.push(req.params.id);

    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id=$${index}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Task update failed' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch {
    res.status(500).json({ error: 'Task delete failed' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
});

(async () => {
  await waitForDB();
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
})();
