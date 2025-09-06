// apps/web/src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Auth endpoints
export async function register(username, fullname, email, password, avatar = "") {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, fullname, email, password, avatar })
  });
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

// Game endpoints
export async function createGame(token, gameTime = 60) {
  const res = await fetch(`${API_URL}/game/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ gameTime })
  });
  return res.json();
}

export async function getActiveGame(token) {
  const res = await fetch(`${API_URL}/game/active`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

export async function attack(token) {
  const res = await fetch(`${API_URL}/game/attack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

export async function powerAttack(token) {
  const res = await fetch(`${API_URL}/game/power-attack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

export async function heal(token) {
  const res = await fetch(`${API_URL}/game/heal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

export async function surrender(token) {
  const res = await fetch(`${API_URL}/game/surrender`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

export async function updateTimer(token) {
  const res = await fetch(`${API_URL}/game/update-timer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}

export async function getGameHistory(token) {
  const res = await fetch(`${API_URL}/game/history`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}