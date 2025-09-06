import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // 'attack', 'power_attack', 'heal', 'surrender'
  playerDamage: { type: Number, default: 0 },
  monsterDamage: { type: Number, default: 0 },
  playerHealth: { type: Number, required: true },
  monsterHealth: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  commentary: { type: String, required: true }
});

const gameSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ['active', 'completed', 'surrendered'], default: 'active' },
  gameTime: { type: Number, default: 60 }, // seconds
  timeRemaining: { type: Number, default: 60 }, // seconds
  playerHealth: { type: Number, default: 100 },
  monsterHealth: { type: Number, default: 100 },
  winner: { 
    type: String, 
    default: null, 
    required: false
  },
  actionLogs: [actionLogSchema],
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for efficient queries
gameSchema.index({ user: 1, status: 1, createdAt: -1 });

export default mongoose.model("Game", gameSchema);
