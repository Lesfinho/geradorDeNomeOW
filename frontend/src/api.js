const BASE = '/api';

function getToken() {
  const user = localStorage.getItem('user');
  if (!user) return null;
  return JSON.parse(user).token;
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function resetPin(username, secret) {
  const res = await fetch(`${BASE}/users/reset-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, secret })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao resetar PIN');
  return data;
}

export async function register(username, pin) {
  const res = await fetch(`${BASE}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, pin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
  return data;
}

export async function addName(name) {
  const res = await fetch(`${BASE}/names`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sessão expirada');
    throw new Error(data.error || 'Erro ao adicionar nome');
  }
  return data;
}

export async function drawName() {
  const res = await fetch(`${BASE}/names/draw`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sessão expirada');
    throw new Error('Erro ao sortear');
  }
  return res.json();
}

export async function getAllNames() {
  const res = await fetch(`${BASE}/names/all`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sessão expirada');
    throw new Error('Erro ao buscar nomes');
  }
  return res.json();
}

export async function getSuggestions() {
  const res = await fetch(`${BASE}/names/suggest`, {
    headers: authHeaders(),
  });
  if (!res.ok) return { suggestions: [], couples: [], total: 0 };
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE}/names/stats`);
  if (!res.ok) throw new Error('Erro ao buscar stats');
  return res.json();
}

export async function addSharedGif(url) {
  const res = await fetch(`${BASE}/gifs`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ url })
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sessao expirada');
    throw new Error(data.error || 'Erro ao salvar GIF');
  }
  return data;
}

export async function getRandomSharedGif() {
  const res = await fetch(`${BASE}/gifs/random`);
  if (!res.ok) throw new Error('Erro ao buscar GIF aleatorio');
  return res.json();
}
