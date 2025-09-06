import { useEffect, useState } from "react";
import { register, login, createGame, getActiveGame, attack, powerAttack, heal, surrender, updateTimer, getGameHistory } from "./api";

function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "register") {
      const res = await register(username, fullname, email, password, avatar);
      if (res.message) {
        alert(res.message);
        setMode("login");
      } else {
        alert(res.error || "Registration failed");
      }
    } else {
      const res = await login(username, password);
      if (res.token) {
        onLogin(res.token);
      } else {
        alert(res.error || "Login failed");
      }
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-500">
        🦠 Covid Slayer 🦠
      </h1>
      <h2 className="text-xl font-bold mb-4 text-center">
        {mode === "login" ? "Login" : "Create Account"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <input 
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500" 
              placeholder="Full Name" 
              value={fullname} 
              onChange={e => setFullname(e.target.value)} 
              required
            />
            <input 
              type="email"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </>
        )}
        <input 
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required
        />
        <input 
          type="password" 
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required
        />
        {mode === "register" && (
          <input 
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500" 
            placeholder="Avatar URL (optional)" 
            value={avatar} 
            onChange={e => setAvatar(e.target.value)} 
          />
        )}
        <button 
          type="submit" 
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors"
        >
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
      <button 
        onClick={() => setMode(mode === "login" ? "register" : "login")} 
        className="mt-4 text-sm text-gray-400 hover:underline"
      >
        Switch to {mode === "login" ? "Create Account" : "Login"}
      </button>
    </div>
  );
}

function GameInterface({ token, onLogout }) {
  const [game, setGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameTime, setGameTime] = useState(60);
  const [commentary, setCommentary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    loadGameHistory();
    checkActiveGame();
  }, []);

  useEffect(() => {
    if (game && game.status === 'active' && game.timeRemaining > 0) {
      const interval = setInterval(async () => {
        try {
          const res = await updateTimer(token);
          if (res.timeRemaining !== undefined) {
            setGame(prev => ({ ...prev, timeRemaining: res.timeRemaining }));
            if (res.gameStatus !== 'active') {
              setGame(prev => ({ ...prev, status: res.gameStatus, winner: res.winner }));
              clearInterval(interval);
              setTimerInterval(null);
              loadGameHistory();
            }
          }
        } catch (err) {
          console.error('Timer update failed:', err);
        }
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [game?.status, game?.timeRemaining]);

  async function checkActiveGame() {
    try {
      const res = await getActiveGame(token);
      if (res.game) {
        setGame(res.game);
        setCommentary(res.game.actionLogs || []);
      }
    } catch (err) {
      console.error('Failed to load active game:', err);
    }
  }

  async function loadGameHistory() {
    try {
      const res = await getGameHistory(token);
      setGameHistory(res.games || []);
    } catch (err) {
      console.error('Failed to load game history:', err);
    }
  }

  async function startNewGame() {
    setIsLoading(true);
    try {
      const res = await createGame(token, gameTime);
      if (res.game) {
        setGame(res.game);
        setCommentary([]);
        loadGameHistory();
      } else {
        alert(res.error || "Failed to create game");
      }
    } catch (err) {
      alert("Failed to create game");
    }
    setIsLoading(false);
  }

  async function performAction(action) {
    if (!game || game.status !== 'active' || isLoading) return;
    
    setIsLoading(true);
    try {
      let res;
      switch (action) {
        case 'attack':
          res = await attack(token);
          break;
        case 'powerAttack':
          res = await powerAttack(token);
          break;
        case 'heal':
          res = await heal(token);
          break;
        case 'surrender':
          res = await surrender(token);
          break;
        default:
          return;
      }

      if (res.success) {
        setGame(prev => ({
          ...prev,
          playerHealth: res.playerHealth,
          monsterHealth: res.monsterHealth,
          status: res.gameStatus,
          winner: res.winner
        }));
        
        if (res.commentary) {
          setCommentary(prev => [...prev, ...res.commentary]);
        }

        if (res.gameStatus !== 'active') {
          if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
          }
          loadGameHistory();
        }
      } else {
        alert(res.error || "Action failed");
      }
    } catch (err) {
      alert("Action failed");
    }
    setIsLoading(false);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getHealthBarColor(health) {
    if (health > 60) return 'bg-green-500';
    if (health > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-500">🦠 Covid Slayer 🦠</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              Refresh
            </button>
            <button 
              onClick={onLogout} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {!game ? (
          /* Game Setup */
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Start New Game</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Game Time (seconds)</label>
              <input 
                type="number" 
                min="30" 
                max="300" 
                value={gameTime} 
                onChange={e => setGameTime(parseInt(e.target.value))}
                className="w-32 p-2 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <button 
              onClick={startNewGame} 
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-bold disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Start Game"}
            </button>
          </div>
        ) : (
          /* Game Interface */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timer */}
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <h3 className="text-lg font-bold mb-2">Time Remaining</h3>
                <div className={`text-4xl font-bold ${game.timeRemaining <= 10 ? 'text-red-500' : 'text-blue-500'}`}>
                  {formatTime(game.timeRemaining)}
                </div>
              </div>

              {/* Health Bars */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="space-y-4">
                  {/* Player Health */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-green-400">Player Health</span>
                      <span className="font-bold">{game.playerHealth}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-6">
                      <div 
                        className={`h-6 rounded-full transition-all duration-500 ${getHealthBarColor(game.playerHealth)}`}
                        style={{ width: `${game.playerHealth}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Monster Health */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-red-400">Covid Monster Health</span>
                      <span className="font-bold">{game.monsterHealth}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-6">
                      <div 
                        className={`h-6 rounded-full transition-all duration-500 ${getHealthBarColor(game.monsterHealth)}`}
                        style={{ width: `${game.monsterHealth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {game.status === 'active' && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Choose Your Action</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => performAction('attack')}
                      disabled={isLoading}
                      className="p-4 bg-blue-600 hover:bg-blue-700 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      ⚔️ Attack
                    </button>
                    <button 
                      onClick={() => performAction('powerAttack')}
                      disabled={isLoading}
                      className="p-4 bg-purple-600 hover:bg-purple-700 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      💥 Power Attack
                    </button>
                    <button 
                      onClick={() => performAction('heal')}
                      disabled={isLoading}
                      className="p-4 bg-green-600 hover:bg-green-700 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      🧪 Healing Potion
                    </button>
                    <button 
                      onClick={() => performAction('surrender')}
                      disabled={isLoading}
                      className="p-4 bg-red-600 hover:bg-red-700 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      🏳️ Surrender
                    </button>
                  </div>
                </div>
              )}

              {/* Game Status */}
              {game.status !== 'active' && (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    {game.winner === 'player' ? '🎉 Victory! 🎉' : 
                     game.winner === 'monster' ? '💀 Defeat! 💀' : 
                     '⏰ Time\'s Up!'}
                  </h3>
                  <p className="mb-4">
                    {game.winner === 'player' ? 'You defeated the Covid Monster!' :
                     game.winner === 'monster' ? 'The Covid Monster was too strong!' :
                     'The battle ended in a draw!'}
                  </p>
                  <button 
                    onClick={() => setGame(null)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold"
                  >
                    Start New Game
                  </button>
                </div>
              )}
            </div>

            {/* Commentary Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Battle Commentary</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {commentary.length === 0 ? (
                    <p className="text-gray-400 text-sm">No actions yet...</p>
                  ) : (
                    commentary.slice(-10).map((log, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-700 rounded">
                        {log.commentary || log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Game History */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Recent Games</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameHistory.length === 0 ? (
                    <p className="text-gray-400 text-sm">No games played yet...</p>
                  ) : (
                    gameHistory.map((game, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-700 rounded">
                        <div className="flex justify-between">
                          <span>
                            {game.winner === 'player' ? '🎉 Won' : 
                             game.winner === 'monster' ? '💀 Lost' : '⏰ Draw'}
                          </span>
                          <span className="text-gray-400">
                            {new Date(game.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Player: {game.playerHealth}HP, Monster: {game.monsterHealth}HP
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("jwt", token);
    } else {
      localStorage.removeItem("jwt");
    }
  }, [token]);

  function handleLogin(t) {
    setToken(t);
  }

  function handleLogout() {
    setToken("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {!token ? (
        <AuthForm onLogin={handleLogin} />
      ) : (
        <GameInterface token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}