import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, index: true },
    username: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String },
    name: { type: String, required: true },
    googleId: { type: String, index: true, sparse: true },
    premium: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
