import { useState } from 'react';
import { register, resetPin } from '../api';

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center animated-bg relative">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <form onSubmit={handleReset} className="glass-card p-8 w-full max-w-sm mx-4 animate-float-in">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Resetar PIN</h1>
          <p className="text-xs text-white/40 mb-6 text-center">
            Digite seu username e a senha do grupo
          </p>
          <input
            type="text"
            value={resetUsername}
            onChange={(e) => setResetUsername(e.target.value)}
            placeholder="Seu username"
            className="glass-input w-full px-4 py-3 mb-4"
            required
          />
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Senha do grupo"
            className="glass-input w-full px-4 py-3 mb-4"
            required
          />
          {resetResult && (
            <div className="bg-green-500/15 border border-green-500/30 rounded-2xl p-3 mb-4 text-center">
              <p className="text-green-400 font-bold text-lg">{resetResult}</p>
              <p className="text-xs text-green-400/60 mt-1">Anote e use para entrar!</p>
            </div>
          )}
          {resetError && (
            <p className="text-red-400 text-sm mb-4">{resetError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full pill-btn pill-btn-amber py-3 text-base disabled:opacity-50 mb-3"
          >
            {loading ? 'Resetando...' : 'Resetar PIN'}
          </button>
          <button
            type="button"
            onClick={() => { setShowReset(false); setResetResult(''); setResetError(''); }}
            className="w-full text-sm text-white/30 hover:text-white/60 cursor-pointer"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg relative">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <form onSubmit={handleSubmit} className="glass-card p-8 w-full max-w-sm mx-4 animate-float-in">
        <h1 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">Resenha Ow</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Insira seu nome"
          className="glass-input w-full px-4 py-3 mb-4"
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
          placeholder="PIN"
          className="glass-input w-full px-4 py-3 mb-4 text-center tracking-widest text-lg"
          maxLength={4}
          required
        />
        <p className="text-xs text-white/30 mb-4 text-center">
          Novo? Escolha um PIN. Ja tem conta? Digite seu PIN.
        </p>
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || pin.length !== 4}
          className="w-full pill-btn pill-btn-amber py-3 text-base disabled:opacity-50 mb-3"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="w-full text-sm text-white/20 hover:text-white/50 cursor-pointer"
        >
          Esqueci meu PIN
        </button>
      </form>
    </div>
  );
}
