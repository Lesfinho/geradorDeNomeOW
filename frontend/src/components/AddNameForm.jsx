import { useState } from 'react';
import { addName } from '../api';
import { playClick } from '../sounds';

export default function AddNameForm({ onNameAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();
    setLoading(true);
    setSuccess('');
    try {
      await addName(name.trim());
      setSuccess(`"${name.trim()}" adicionado!`);
      setName('');
      onNameAdded();
    } catch {
      setSuccess('Erro ao adicionar nome.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="glass-card-sm p-4">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um nome (max 12 chars)"
          className="glass-input w-full max-w-xs px-4 py-2.5 text-center text-sm"
          maxLength={12}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="pill-btn pill-btn-amber px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <span className="text-base">+</span>
          {loading ? 'Adicionando...' : 'Adicionar ao Pool'}
        </button>
      </form>
      {success && (
        <p className="text-sm text-green-400 mt-2 text-center">{success}</p>
      )}
    </div>
  );
}
