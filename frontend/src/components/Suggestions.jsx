import { useEffect, useRef, useState } from 'react';
import { getSuggestions } from '../api';
import { playCasinoSpin, playClick } from '../sounds';

const FAKE_SUGGESTIONS = ['??????', 'ROLANDO', 'SORTEIO', 'ALEATORIO', 'COUPLE?', 'NOME??'];

export default function Suggestions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('normal');
  const [slotText, setSlotText] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    playClick();
    playCasinoSpin();
    setLoading(true);
    setActiveTab('normal');

    let tick = 0;
    intervalRef.current = setInterval(() => {
      setSlotText(FAKE_SUGGESTIONS[tick % FAKE_SUGGESTIONS.length]);
      tick++;
    }, 110);

    const startedAt = Date.now();
    try {
      const result = await getSuggestions();
      setData(result);
    } catch {
      setData(null);
    } finally {
      const elapsed = Date.now() - startedAt;
      const minimumEffectMs = 1200;
      if (elapsed < minimumEffectMs) {
        await new Promise((resolve) => setTimeout(resolve, minimumEffectMs - elapsed));
      }
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setLoading(false);
    }
  };

  const handleUseSuggestion = (name) => {
    playClick();
    navigator.clipboard?.writeText(name);
  };

  const normalSuggestions = data?.suggestions || [];
  const coupleSuggestions = data?.couples || [];

  return (
    <div className="glass-card p-5 text-center">
      <h2 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Sugestoes</h2>
      <p className="text-xs text-white/30 mb-4">
        Gera nomes com padroes, prefixos/sufixos e combinacoes de couple
      </p>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="pill-btn pill-btn-amber px-8 py-3 text-lg font-bold inline-flex items-center gap-2 disabled:opacity-50"
        >
          <span className="text-xl">🎲</span>
          {loading ? 'Sorteando...' : 'Gerar Nome Aleatorio'}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('normal')}
          className={`pill-btn text-xs px-3 py-1 ${activeTab === 'normal' ? 'pill-btn-amber' : 'pill-btn-glass'}`}
        >
          Nome aleatorio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('couples')}
          className={`pill-btn text-xs px-3 py-1 ${activeTab === 'couples' ? 'pill-btn-amber' : 'pill-btn-glass'}`}
        >
          Couples
        </button>
      </div>

      {loading && (
        <div className="min-h-[56px] flex items-center justify-center mb-3 overflow-hidden">
          <p className="text-3xl font-bold text-amber-400 animate-slot-spin font-mono">
            {slotText || 'ROLANDO'}
          </p>
        </div>
      )}

      {data && activeTab === 'normal' && normalSuggestions.length > 0 && (
        <div className="space-y-2 mt-2 mb-4">
          {normalSuggestions.map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-amber-400/10 border border-amber-400/15 p-3 rounded-2xl">
              <span className="font-medium text-amber-300">{name}</span>
              <button
                onClick={() => handleUseSuggestion(name)}
                className="pill-btn pill-btn-glass text-xs px-3 py-1"
              >
                Copiar
              </button>
            </div>
          ))}
        </div>
      )}

      {data && activeTab === 'normal' && normalSuggestions.length === 0 && (
        <p className="text-sm text-white/30 mt-2 mb-4">Nao conseguiu gerar nomes comuns. Tente de novo!</p>
      )}

      {data && activeTab === 'couples' && coupleSuggestions.length > 0 && (
        <div className="space-y-2 mt-2 mb-4">
          {coupleSuggestions.map((item, i) => (
            <div key={`${item.name}-${i}`} className="bg-amber-400/10 border border-amber-400/15 p-3 rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-amber-300">{item.pair}</span>
                <button
                  onClick={() => handleUseSuggestion(item.pair)}
                  className="pill-btn pill-btn-glass text-xs px-3 py-1"
                >
                  Copiar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && activeTab === 'couples' && coupleSuggestions.length === 0 && (
        <p className="text-sm text-white/30 mt-2 mb-4">Nao conseguiu gerar nomes de couple. Tente de novo!</p>
      )}

    </div>
  );
}
