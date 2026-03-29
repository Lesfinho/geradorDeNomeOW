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
    <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um nome (max 12 chars)"
          className="w-full max-w-xs px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-full text-center focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
          maxLength={12}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/40 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          {loading ? 'Adicionando...' : 'Adicionar ao Pool'}
        </button>
      </form>
      {success && (
        <p className="text-sm text-green-400 mt-2 text-center">{success}</p>
      )}
    </div>
  );
}
