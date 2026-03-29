import { useState } from 'react';
import { addName } from '../api';

export default function AddNameForm({ onNameAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="bg-gray-900/80 backdrop-blur p-6 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">Adicionar Nome</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um nome"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
          maxLength={12}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? '...' : 'Adicionar'}
        </button>
      </form>
      {success && <p className="text-sm text-green-400 mt-2">{success}</p>}
    </div>
  );
}
