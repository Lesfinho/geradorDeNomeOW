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
  const [phase, setPhase] = useState('idle'); // idle | spinning | reveal
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

    // Start slot machine text cycling
    let tick = 0;
    intervalRef.current = setInterval(() => {
      setSlotText(FAKE_NAMES[tick % FAKE_NAMES.length]);
      tick++;
    }, 100);

    // Fetch while spinning
    let data;
    try {
      data = await drawName();
    } catch {
      data = { error: true };
    }

    // Keep spinning for dramatic effect (total ~2.5s)
    await new Promise((r) => setTimeout(r, 2000));

    clearInterval(intervalRef.current);
    intervalRef.current = null;

    // Slow down effect
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 150 + i * 100));
      setSlotText(FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]);
    }

    // Reveal
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
      <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-gray-700 text-center">
        <h2 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-widest">
          Sua nova conta chama...
        </h2>

        {/* Slot display */}
        <div className="min-h-[60px] flex items-center justify-center mb-3">
          {phase === 'idle' && !result && (
            <p className="text-gray-600 text-lg">Clique para descobrir!</p>
          )}

          {phase === 'spinning' && (
            <div className="overflow-hidden h-[50px] flex items-center justify-center">
              <p className="text-3xl font-bold text-purple-400 animate-slot-spin font-mono">
                {slotText}
              </p>
            </div>
          )}

          {phase === 'reveal' && result && (
            <div>
              {result.error ? (
                <p className="text-red-400">Erro ao sortear.</p>
              ) : result.empty ? (
                <p className="text-gray-400 text-lg">Nenhum nome disponivel no pool!</p>
              ) : (
                <div className="animate-reveal-glow">
                  <p className="text-4xl font-bold text-purple-400 mb-1">
                    {result.name.name}
                  </p>
                  <p className="text-xs text-gray-500">
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
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/50"
        >
          {phase === 'spinning' ? 'Sorteando...' : 'RETIRAR'}
        </button>
      </div>
    </>
  );
}
