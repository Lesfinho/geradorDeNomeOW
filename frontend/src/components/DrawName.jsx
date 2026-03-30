import { useState, useEffect, useRef } from 'react';
import { drawName } from '../api';
import { playCasinoSpin, playWin } from '../sounds';
import Confetti from './Confetti';

const FAKE_NAMES = [
  'XXXXXX', 'ZZZZZZ', '??????', '!!!!!!',
  'QUEM??', 'HMMM..', 'SERA??', 'TALVEZ',
];

export default function DrawName({ onDrawn }) {
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [slotText, setSlotText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleDraw = async () => {
    setPhase('spinning');
    setResult(null);
    setShowConfetti(false);
    playCasinoSpin();

    let tick = 0;
    intervalRef.current = setInterval(() => {
      setSlotText(FAKE_NAMES[tick % FAKE_NAMES.length]);
      tick++;
    }, 100);

    let data;
    try {
      data = await drawName();
    } catch {
      data = { error: true };
    }

    await new Promise((r) => setTimeout(r, 2000));

    clearInterval(intervalRef.current);
    intervalRef.current = null;

    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 150 + i * 100));
      setSlotText(FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]);
    }

    setResult(data);
    setPhase('reveal');

    if (data && !data.error && !data.empty) {
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    onDrawn();
  };

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="glass-card-sm p-4 text-center">
        <h2 className="text-xs font-semibold text-amber-400/80 mb-3 uppercase tracking-widest">
          Sua nova conta chama...
        </h2>

        <div className="min-h-[60px] flex items-center justify-center mb-3">
          {phase === 'idle' && !result && (
            <p className="text-white/20 text-sm">Clique para descobrir!</p>
          )}

          {phase === 'spinning' && (
            <div className="overflow-hidden h-[50px] flex items-center justify-center">
              <p className="text-3xl font-bold text-amber-400 animate-slot-spin font-mono">
                {slotText}
              </p>
            </div>
          )}

          {phase === 'reveal' && result && (
            <div>
              {result.error ? (
                <p className="text-red-400">Erro ao sortear.</p>
              ) : result.empty ? (
                <p className="text-white/40 text-sm">Nenhum nome disponivel no pool!</p>
              ) : (
                <div className="animate-reveal-glow">
                  <p className="text-4xl font-bold text-amber-400 mb-1">
                    {result.name.name}
                  </p>
                  <p className="text-xs text-white/30">
                    adicionado por {result.name.addedBy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleDraw}
          disabled={phase === 'spinning'}
          className="pill-btn pill-btn-amber px-8 py-3 text-lg font-bold disabled:opacity-50"
        >
          {phase === 'spinning' ? 'Sorteando...' : 'RETIRAR'}
        </button>
      </div>
    </>
  );
}
