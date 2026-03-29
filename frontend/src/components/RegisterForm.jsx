import { useState } from 'react';
import { register } from '../api';

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(username.trim(), pin);
      onRegister(data.user);
    } catch (err) {
      setError(err.message || 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">ResenhaGenerator</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite seu username"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          minLength={2}
          maxLength={50}
          required
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{4}"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="PIN de 4 dígitos"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-center tracking-widest text-lg"
          maxLength={4}
          required
        />
        <p className="text-xs text-gray-400 mb-4 text-center">
          Novo? Escolha um PIN. Já tem conta? Digite seu PIN.
        </p>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || pin.length !== 4}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
