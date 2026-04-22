import Todo from "../models/Todo.js";
import {
  getCache,
  setCache,
  delCache,
  setTodoHash,
  delTodoHash,
  searchTodos as redisFTSearch
} from "../services/redisService.js";

const CACHE_TTL = 30; // seconds

// GET /todos
export async function getTodos(req, res) {
  const cacheKey = `cache:todos:${req.user.id}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  const payload = {
    todos: todos.map((t) => ({
      id: String(t._id),
      title: t.title,
      done: !!t.done,
      priority: t.priority,
      dueDate: t.dueDate || null
    }))
  };
  await setCache(cacheKey, CACHE_TTL, payload);
  res.json(payload);
}

// POST /todos
export async function createTodo(req, res) {
  const { title, priority, dueDate } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title_required" });

  const todo = await Todo.create({
    userId: req.user.id,
    title: title.trim(),
    priority: priority || "medium",
    dueDate: dueDate || null
  });

  // Index in Redis HASH for FT.SEARCH
  await setTodoHash(String(todo._id), {
    userId: req.user.id,
    title: todo.title,
    priority: todo.priority,
    createdAt: todo.createdAt
  });

  // Invalidate list cache
  await delCache(`cache:todos:${req.user.id}`);

  res.status(201).json({
    todo: { id: String(todo._id), title: todo.title, done: false, priority: todo.priority, dueDate: todo.dueDate || null }
  });
}

// PATCH /todos/:id
export async function updateTodo(req, res) {
  const { id } = req.params;
  const { title, done, priority, dueDate } = req.body;

  const update = {};
  if (title !== undefined) update.title = title.trim();
  if (done !== undefined) update.done = done;
  if (priority !== undefined) update.priority = priority;
  if (dueDate !== undefined) update.dueDate = dueDate;

  if (!Object.keys(update).length) return res.status(400).json({ error: "nothing_to_update" });

  const updated = await Todo.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: update },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ error: "not_found" });

  // Refresh Redis HASH and invalidate cache
  await setTodoHash(String(updated._id), {
    userId: req.user.id,
    title: updated.title,
    priority: updated.priority,
    createdAt: updated.createdAt
  });
  await delCache(`cache:todos:${req.user.id}`);

  res.json({
    todo: { id: String(updated._id), title: updated.title, done: !!updated.done, priority: updated.priority, dueDate: updated.dueDate || null }
  });
}

// DELETE /todos/:id
export async function deleteTodo(req, res) {
  const { id } = req.params;
  const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.user.id }).lean();
  if (!deleted) return res.status(404).json({ error: "not_found" });

  await delTodoHash(id);
  await delCache(`cache:todos:${req.user.id}`);
  res.json({ ok: true });
}

// GET /todos/search?q=  — premium feature using FT.SEARCH
export async function searchTodos(req, res) {
  if (!req.user.premium) return res.status(403).json({ error: "premium_required" });
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "query_required" });

  const result = await redisFTSearch(req.user.id, q);
  res.json(result);
}
