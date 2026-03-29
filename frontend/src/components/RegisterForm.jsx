import { useState } from 'react';
import { register, resetPin } from '../api';

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset PIN state
  const [showReset, setShowReset] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [resetResult, setResetResult] = useState('');
  const [resetError, setResetError] = useState('');

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

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetResult('');
    setLoading(true);
    try {
      const data = await resetPin(resetUsername.trim(), secret);
      setResetResult(`Novo PIN: ${data.newPin}`);
    } catch (err) {
      setResetError(err.message || 'Erro ao resetar.');
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleReset} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Resetar PIN</h1>
          <p className="text-xs text-gray-400 mb-6 text-center">
            Digite seu username e a senha do grupo
          </p>
          <input
            type="text"
            value={resetUsername}
            onChange={(e) => setResetUsername(e.target.value)}
            placeholder="Seu username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            required
          />
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Senha do grupo"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            required
          />
          {resetResult && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 text-center">
              <p className="text-green-700 font-bold text-lg">{resetResult}</p>
              <p className="text-xs text-green-600 mt-1">Anote e use para entrar!</p>
            </div>
          )}
          {resetError && (
            <p className="text-red-500 text-sm mb-4">{resetError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 cursor-pointer mb-3"
          >
            {loading ? 'Resetando...' : 'Resetar PIN'}
          </button>
          <button
            type="button"
            onClick={() => { setShowReset(false); setResetResult(''); setResetError(''); }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    );
  }

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
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer mb-3"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="w-full text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          Esqueci meu PIN
        </button>
      </form>
    </div>
  );
}
