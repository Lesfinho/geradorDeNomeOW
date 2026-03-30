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

  if (loading) return <p className="text-white/40 text-center text-sm">Carregando...</p>;

  if (names.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/30">Nenhum nome adicionado ainda.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Todos os Nomes</h2>
      <div className="space-y-2">
        {names.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
              entry.isUsed
                ? 'bg-white/5 opacity-50'
                : 'bg-amber-400/10 border border-amber-400/20'
            }`}
          >
            <div>
              <span className={`font-medium ${entry.isUsed ? 'line-through text-white/30' : 'text-white'}`}>
                {entry.name}
              </span>
              <span className="text-xs text-white/30 ml-2">por {entry.addedBy}</span>
            </div>
            {entry.isUsed && (
              <span className="text-xs text-amber-400/60">
                retirado por {entry.drawnBy}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
