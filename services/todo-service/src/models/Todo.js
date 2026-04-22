import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null }
  },
  { timestamps: true }
);

// Compound index for efficient per-user queries
todoSchema.index({ userId: 1, createdAt: -1 });

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
