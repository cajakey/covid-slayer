import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored hashed
  avatar: { type: String, default: "" }, // URL or base64 string
}, { timestamps: true });

export default mongoose.model("User", userSchema);