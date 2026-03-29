import { useState, useEffect } from 'react';
import { getAllNames } from '../api';

export default function NameList({ refreshKey }) {
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllNames()
      .then(setNames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p className="text-gray-400 text-center">Carregando...</p>;

  if (names.length === 0) {
    return (
      <div className="bg-gray-900/80 backdrop-blur p-6 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-500">Nenhum nome adicionado ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur p-6 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">Todos os Nomes</h2>
      <div className="space-y-2">
        {names.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded-md ${
              entry.isUsed ? 'bg-gray-800/60 opacity-60' : 'bg-green-900/30 border border-green-800/50'
            }`}
          >
            <div>
              <span className={`font-medium ${entry.isUsed ? 'line-through text-gray-500' : 'text-white'}`}>
                {entry.name}
              </span>
              <span className="text-xs text-gray-500 ml-2">por {entry.addedBy}</span>
            </div>
            {entry.isUsed && (
              <span className="text-xs text-red-400">
                sorteado por {entry.drawnBy}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
