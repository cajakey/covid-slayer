import express from "express";
import Game from "../models/Game.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Helper function to generate random damage (max 10)
function getRandomDamage() {
  return Math.floor(Math.random() * 10) + 1;
}

// Helper function to generate commentary
function generateCommentary(action, playerDamage, monsterDamage, playerHealth, monsterHealth) {
  const commentaries = {
    attack: [
      `Player strikes! Deals ${playerDamage} damage to Covid Monster!`,
      `Covid Monster retaliates with ${monsterDamage} infection damage!`,
      `Epic battle continues! Player: ${playerHealth}HP, Monster: ${monsterHealth}HP`
    ],
    power_attack: [
      `POWER ATTACK! Player unleashes devastating ${playerDamage} damage!`,
      `Covid Monster's POWER INFECTION deals ${monsterDamage} damage!`,
      `Intense combat! Player: ${playerHealth}HP, Monster: ${monsterHealth}HP`
    ],
    heal: [
      `Player uses healing potion! Restores ${playerDamage} health!`,
      `Covid Monster infects during healing! Takes ${monsterDamage} damage!`,
      `Strategic healing! Player: ${playerHealth}HP, Monster: ${monsterHealth}HP`
    ],
    surrender: [
      `Player surrenders! Covid Monster claims victory!`,
      `The battle ends in defeat. Better luck next time!`
    ]
  };
  
  return commentaries[action] || [`Action: ${action}`];
}

// Create new game
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { gameTime = 60 } = req.body;
    
    const game = new Game({
      user: req.user.id,
      gameTime,
      timeRemaining: gameTime,
      playerHealth: 100,
      monsterHealth: 100,
      winner: null,
      status: 'active'
    });
    
    await game.save();
    
    res.json({ 
      message: "Game created successfully", 
      game: {
        id: game._id,
        gameTime: game.gameTime,
        timeRemaining: game.timeRemaining,
        playerHealth: game.playerHealth,
        monsterHealth: game.monsterHealth,
        status: game.status
      }
    });
  } catch (err) {
    console.error("create game error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get active game
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      user: req.user.id, 
      status: 'active' 
    }).sort({ createdAt: -1 });
    
    if (!game) {
      return res.json({ game: null });
    }
    
    res.json({ 
      game: {
        id: game._id,
        gameTime: game.gameTime,
        timeRemaining: game.timeRemaining,
        playerHealth: game.playerHealth,
        monsterHealth: game.monsterHealth,
        status: game.status,
        actionLogs: game.actionLogs.slice(-10) // Last 10 actions
      }
    });
  } catch (err) {
    console.error("get active game error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Attack action
router.post("/attack", authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });
    
    if (!game) {
      return res.status(404).json({ error: "No active game found" });
    }
    
    if (game.timeRemaining <= 0) {
      return res.status(400).json({ error: "Game time has expired" });
    }
    
    const playerDamage = getRandomDamage();
    const monsterDamage = getRandomDamage();
    
    game.playerHealth = Math.max(0, game.playerHealth - monsterDamage);
    game.monsterHealth = Math.max(0, game.monsterHealth - playerDamage);
    
    const commentary = generateCommentary('attack', playerDamage, monsterDamage, game.playerHealth, game.monsterHealth);
    
    game.actionLogs.push({
      action: 'attack',
      playerDamage,
      monsterDamage,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      commentary: commentary.join(' ')
    });
    
    // Check win conditions
    if (game.playerHealth <= 0) {
      game.status = 'completed';
      game.winner = 'monster';
      game.completedAt = new Date();
    } else if (game.monsterHealth <= 0) {
      game.status = 'completed';
      game.winner = 'player';
      game.completedAt = new Date();
    }
    
    await game.save();
    
    res.json({
      success: true,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      playerDamage,
      monsterDamage,
      commentary: commentary,
      gameStatus: game.status,
      winner: game.winner
    });
  } catch (err) {
    console.error("attack error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Power Attack action
router.post("/power-attack", authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });
    
    if (!game) {
      return res.status(404).json({ error: "No active game found" });
    }
    
    if (game.timeRemaining <= 0) {
      return res.status(400).json({ error: "Game time has expired" });
    }
    
    const playerDamage = getRandomDamage() + 5; // Power attack does more damage
    const monsterDamage = getRandomDamage() + 5; // But monster also does more damage
    
    game.playerHealth = Math.max(0, game.playerHealth - monsterDamage);
    game.monsterHealth = Math.max(0, game.monsterHealth - playerDamage);
    
    const commentary = generateCommentary('power_attack', playerDamage, monsterDamage, game.playerHealth, game.monsterHealth);
    
    game.actionLogs.push({
      action: 'power_attack',
      playerDamage,
      monsterDamage,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      commentary: commentary.join(' ')
    });
    
    // Check win conditions
    if (game.playerHealth <= 0) {
      game.status = 'completed';
      game.winner = 'monster';
      game.completedAt = new Date();
    } else if (game.monsterHealth <= 0) {
      game.status = 'completed';
      game.winner = 'player';
      game.completedAt = new Date();
    }
    
    await game.save();
    
    res.json({
      success: true,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      playerDamage,
      monsterDamage,
      commentary: commentary,
      gameStatus: game.status,
      winner: game.winner
    });
  } catch (err) {
    console.error("power attack error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Heal action
router.post("/heal", authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });
    
    if (!game) {
      return res.status(404).json({ error: "No active game found" });
    }
    
    if (game.timeRemaining <= 0) {
      return res.status(400).json({ error: "Game time has expired" });
    }
    
    const healAmount = getRandomDamage() + 5; // Healing potion restores health
    const monsterDamage = getRandomDamage(); // But player gets infected during healing
    
    game.playerHealth = Math.min(100, game.playerHealth + healAmount); // Cap at 100
    game.playerHealth = Math.max(0, game.playerHealth - monsterDamage);
    
    const commentary = generateCommentary('heal', healAmount, monsterDamage, game.playerHealth, game.monsterHealth);
    
    game.actionLogs.push({
      action: 'heal',
      playerDamage: healAmount,
      monsterDamage,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      commentary: commentary.join(' ')
    });
    
    // Check win conditions
    if (game.playerHealth <= 0) {
      game.status = 'completed';
      game.winner = 'monster';
      game.completedAt = new Date();
    }
    
    await game.save();
    
    res.json({
      success: true,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      healAmount,
      monsterDamage,
      commentary: commentary,
      gameStatus: game.status,
      winner: game.winner
    });
  } catch (err) {
    console.error("heal error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Surrender action
router.post("/surrender", authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });
    
    if (!game) {
      return res.status(404).json({ error: "No active game found" });
    }
    
    game.status = 'surrendered';
    game.winner = 'monster';
    game.completedAt = new Date();
    
    const commentary = generateCommentary('surrender', 0, 0, game.playerHealth, game.monsterHealth);
    
    game.actionLogs.push({
      action: 'surrender',
      playerDamage: 0,
      monsterDamage: 0,
      playerHealth: game.playerHealth,
      monsterHealth: game.monsterHealth,
      commentary: commentary.join(' ')
    });
    
    await game.save();
    
    res.json({
      success: true,
      message: "You have surrendered to the Covid Monster",
      commentary: commentary,
      gameStatus: game.status,
      winner: game.winner
    });
  } catch (err) {
    console.error("surrender error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update timer (called by frontend every second)
router.post("/update-timer", authMiddleware, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });
    
    if (!game) {
      return res.status(404).json({ error: "No active game found" });
    }
    
    game.timeRemaining = Math.max(0, game.timeRemaining - 1);
    
    // Check for timeout
    if (game.timeRemaining <= 0) {
      game.status = 'completed';
      game.winner = game.playerHealth > game.monsterHealth ? 'player' : 'monster';
      game.completedAt = new Date();
    }
    
    await game.save();
    
    res.json({
      timeRemaining: game.timeRemaining,
      gameStatus: game.status,
      winner: game.winner
    });
  } catch (err) {
    console.error("update timer error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get past games
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ 
      user: req.user.id,
      status: { $in: ['completed', 'surrendered'] }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('status winner gameTime playerHealth monsterHealth createdAt completedAt');
    
    res.json({ games });
  } catch (err) {
    console.error("get history error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;