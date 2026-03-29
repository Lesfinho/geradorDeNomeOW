import { useState } from 'react';
import { drawName } from '../api';

export default function DrawName({ userId, onDrawn }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDraw = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await drawName(userId);
      setResult(data);
      onDrawn();
    } catch {
      setResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Sortear Nome</h2>
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
            <p className="text-red-500">Erro ao sortear.</p>
          ) : result.empty ? (
            <p className="text-gray-500 text-lg">Nenhum nome disponível no pool!</p>
          ) : (
            <div>
              <p className="text-3xl font-bold text-purple-700">{result.name.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicionado por {result.name.addedBy}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
