import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  searchTodos
} from "../controllers/todoController.js";

const router = express.Router();

// All routes require Bearer JWT
router.get("/todos/search", auth, searchTodos); // must be before /todos/:id
router.get("/todos", auth, getTodos);
router.post("/todos", auth, createTodo);
router.patch("/todos/:id", auth, updateTodo);
router.delete("/todos/:id", auth, deleteTodo);

export default router;
