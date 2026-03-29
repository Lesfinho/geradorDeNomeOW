import { useState } from 'react';
import { drawName } from '../api';

export default function DrawName({ onDrawn }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDraw = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await drawName();
      setResult(data);
      onDrawn();
    } catch {
      setResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur p-6 rounded-lg border border-gray-700 text-center">
      <h2 className="text-lg font-semibold text-white mb-4">Sortear Nome</h2>
      <button
        onClick={handleDraw}
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Sorteando...' : 'Sortear!'}
      </button>

      {result && (
        <div className="mt-6">
          {result.error ? (
            <p className="text-red-400">Erro ao sortear.</p>
          ) : result.empty ? (
            <p className="text-gray-400 text-lg">Nenhum nome disponível no pool!</p>
          ) : (
            <div>
              <p className="text-3xl font-bold text-purple-400">{result.name.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Adicionado por {result.name.addedBy}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
