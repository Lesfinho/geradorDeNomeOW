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
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-400">Nenhum nome adicionado ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Todos os Nomes</h2>
      <div className="space-y-2">
        {names.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded-md ${
              entry.isUsed ? 'bg-gray-100 opacity-60' : 'bg-green-50'
            }`}
          >
            <div>
              <span className={`font-medium ${entry.isUsed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {entry.name}
              </span>
              <span className="text-xs text-gray-400 ml-2">por {entry.addedBy}</span>
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
