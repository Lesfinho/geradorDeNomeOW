import { useState } from 'react';
import { getSuggestions } from '../api';

export default function Suggestions({ onAddSuggestion }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await getSuggestions();
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Sugestões de Nomes</h2>
      <p className="text-xs text-gray-400 mb-4">
        Gera nomes baseados nos padrões dos nomes existentes (mínimo 10 nomes no banco)
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer mb-4"
      >
        {loading ? 'Gerando...' : 'Gerar Sugestões'}
      </button>

      {data && !data.minReached && (
        <p className="text-sm text-amber-500">
          Precisa de pelo menos 10 nomes para gerar sugestões ({data.total}/10)
        </p>
      )}

      {data && data.suggestions.length > 0 && (
        <div className="space-y-2 mt-2">
          {data.suggestions.map((name, i) => (
            <div key={i} className="flex items-center justify-between bg-indigo-50 p-3 rounded-md">
              <span className="font-medium text-indigo-800">{name}</span>
              <button
                onClick={() => onAddSuggestion(name)}
                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>
      )}

      {data && data.minReached && data.suggestions.length === 0 && (
        <p className="text-sm text-gray-400 mt-2">Não conseguiu gerar sugestões. Tente de novo!</p>
      )}
    </div>
  );
}
