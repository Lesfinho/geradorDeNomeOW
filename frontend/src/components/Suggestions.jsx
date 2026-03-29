import { useState } from 'react';
import { getSuggestions, addName } from '../api';

export default function Suggestions({ onAddSuggestion }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(new Set());
  const [nameInput, setNameInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setAdded(new Set());
    try {
      const result = await getSuggestions();
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = (name) => {
    setNameInput(name);
  };

  const handleAddFromInput = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setAddLoading(true);
    setAddSuccess('');
    try {
      await addName(nameInput.trim());
      setAddSuccess(`"${nameInput.trim()}" adicionado!`);
      setAdded((prev) => new Set([...prev, nameInput.trim()]));
      setNameInput('');
      onAddSuggestion(nameInput.trim());
    } catch {
      setAddSuccess('Erro ao adicionar.');
    } finally {
      setAddLoading(false);
      setTimeout(() => setAddSuccess(''), 3000);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur p-6 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-2">Sugestões de Nomes</h2>
      <p className="text-xs text-gray-500 mb-4">
        Gera nomes misturando padrões, prefixos/sufixos e combinações (mín. 10 nomes, máx. 12 chars)
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer mb-4 inline-flex items-center gap-2"
      >
        <span className="text-xl">&#127922;</span>
        {loading ? 'Gerando...' : data ? 'Gerar Mais' : 'Gerar Sugestões'}
      </button>

      {data && !data.minReached && (
        <p className="text-sm text-amber-400">
          Precisa de pelo menos 10 nomes para gerar sugestões ({data.total}/10)
        </p>
      )}

      {data && data.suggestions.length > 0 && (
        <div className="space-y-2 mt-2 mb-4">
          {data.suggestions.map((name, i) => (
            <div key={i} className="flex items-center justify-between bg-indigo-900/40 border border-indigo-700/50 p-3 rounded-md">
              <span className="font-medium text-indigo-300">{name}</span>
              {added.has(name) ? (
                <span className="text-xs text-green-400">Adicionado!</span>
              ) : (
                <button
                  onClick={() => handleUseSuggestion(name)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 cursor-pointer"
                >
                  Usar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.minReached && data.suggestions.length === 0 && (
        <p className="text-sm text-gray-500 mt-2 mb-4">Não conseguiu gerar. Tente de novo!</p>
      )}

      <form onSubmit={handleAddFromInput} className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nome para adicionar"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
          maxLength={12}
          required
        />
        <button
          type="submit"
          disabled={addLoading || !nameInput.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 cursor-pointer"
        >
          {addLoading ? '...' : 'Adicionar'}
        </button>
      </form>
      {addSuccess && <p className="text-sm text-green-400 mt-2">{addSuccess}</p>}
    </div>
  );
}
