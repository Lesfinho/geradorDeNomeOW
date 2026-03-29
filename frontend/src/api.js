const BASE = '/api';

export async function register(username) {
  const res = await fetch(`${BASE}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  if (!res.ok) throw new Error('Erro ao registrar');
  return res.json();
}

export async function addName(name, userId) {
  const res = await fetch(`${BASE}/names`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, userId })
  });
  if (!res.ok) throw new Error('Erro ao adicionar nome');
  return res.json();
}

export async function drawName(userId) {
  const res = await fetch(`${BASE}/names/draw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Erro ao sortear');
  return res.json();
}

export async function getAllNames() {
  const res = await fetch(`${BASE}/names/all`);
  if (!res.ok) throw new Error('Erro ao buscar nomes');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE}/names/stats`);
  if (!res.ok) throw new Error('Erro ao buscar stats');
  return res.json();
}
