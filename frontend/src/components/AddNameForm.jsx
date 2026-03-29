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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Nome</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um nome"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={255}
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
      {success && <p className="text-sm text-green-600 mt-2">{success}</p>}
    </div>
  );
}
