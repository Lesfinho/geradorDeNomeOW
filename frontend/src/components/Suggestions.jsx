import { useState } from 'react';
import { getSuggestions, addName } from '../api';
import { playClick } from '../sounds';

export default function Suggestions({ onAddSuggestion }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(new Set());
  const [nameInput, setNameInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  const handleGenerate = async () => {
    playClick();
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
    playClick();
    setNameInput(name);
  };

  const handleAddFromInput = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    playClick();
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
    <div className="glass-card p-5">
      <h2 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Sugestoes</h2>
      <p className="text-xs text-white/30 mb-4">
        Gera nomes com padroes, prefixos/sufixos e combinacoes (min. 10 nomes)
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="pill-btn pill-btn-amber px-5 py-2.5 text-sm mb-4 inline-flex items-center gap-2 disabled:opacity-50"
      >
        <span className="text-lg">🎲</span>
        {loading ? 'Gerando...' : data ? 'Gerar Mais' : 'Gerar Sugestoes'}
      </button>

      {data && !data.minReached && (
        <p className="text-sm text-amber-400/80">
          Precisa de pelo menos 10 nomes ({data.total}/10)
        </p>
      )}

      {data && data.suggestions.length > 0 && (
        <div className="space-y-2 mt-2 mb-4">
          {data.suggestions.map((name, i) => (
            <div key={i} className="flex items-center justify-between bg-amber-400/10 border border-amber-400/15 p-3 rounded-2xl">
              <span className="font-medium text-amber-300">{name}</span>
              {added.has(name) ? (
                <span className="text-xs text-green-400">Adicionado!</span>
              ) : (
                <button
                  onClick={() => handleUseSuggestion(name)}
                  className="pill-btn pill-btn-glass text-xs px-3 py-1"
                >
                  Usar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.minReached && data.suggestions.length === 0 && (
        <p className="text-sm text-white/30 mt-2 mb-4">Nao conseguiu gerar. Tente de novo!</p>
      )}

      <form onSubmit={handleAddFromInput} className="flex gap-2 mt-4 pt-4 border-t border-white/10">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nome para adicionar"
          className="glass-input flex-1 px-4 py-2 text-sm"
          maxLength={12}
          required
        />
        <button
          type="submit"
          disabled={addLoading || !nameInput.trim()}
          className="pill-btn pill-btn-amber px-4 py-2 text-sm disabled:opacity-50"
        >
          {addLoading ? '...' : 'Adicionar'}
        </button>
      </form>
      {addSuccess && <p className="text-sm text-green-400 mt-2 text-center">{addSuccess}</p>}
    </div>
  );
}
