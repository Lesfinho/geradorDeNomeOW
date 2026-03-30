import { useState, useEffect } from 'react';
import { getRandomGif } from '../gifs';
import { playClick } from '../sounds';

export default function GifBackground({ children, customGif, onChangeGif }) {
  const [defaultGif, setDefaultGif] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [useGif, setUseGif] = useState(() => localStorage.getItem('useGifBg') === 'true');

  useEffect(() => {
    setDefaultGif(getRandomGif());
  }, []);

  const activeGif = useGif ? (customGif || defaultGif) : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    playClick();
    const url = inputVal.trim();
    if (url) {
      onChangeGif(url);
      setUseGif(true);
      localStorage.setItem('useGifBg', 'true');
    }
    setInputVal('');
    setShowInput(false);
  };

  const handleReset = () => {
    playClick();
    onChangeGif('');
    setDefaultGif(getRandomGif());
  };

  const toggleGif = () => {
    playClick();
    const next = !useGif;
    setUseGif(next);
    localStorage.setItem('useGifBg', String(next));
  };

  return (
    <div className="min-h-screen relative animated-bg">
      {/* Animated orbs */}
      {!activeGif && (
        <>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </>
      )}

      {/* GIF overlay */}
      {activeGif && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${activeGif})`, zIndex: -20 }}
          />
          <div className="fixed inset-0 bg-black/50" style={{ zIndex: -10 }} />
        </>
      )}

      {/* GIF control */}
      <button
        onClick={() => { playClick(); setShowInput(!showInput); }}
        className="fixed bottom-4 right-4 z-40 glass-card-sm p-2.5 cursor-pointer text-white/60 hover:text-white transition-all"
        title="Trocar fundo"
      >
        🎬
      </button>

      {showInput && (
        <div className="fixed bottom-14 right-4 z-40 glass-card p-4 w-72 animate-float-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50 font-medium">Fundo</p>
            <button
              onClick={toggleGif}
              className={`text-xs pill-btn px-3 py-1 ${useGif ? 'pill-btn-amber' : 'pill-btn-glass'}`}
            >
              {useGif ? 'GIF ON' : 'GIF OFF'}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="url"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Cole URL do GIF..."
              className="glass-input flex-1 px-3 py-1.5 text-sm"
              autoFocus
            />
            <button type="submit" className="pill-btn pill-btn-amber px-3 py-1.5 text-sm">
              OK
            </button>
          </form>
          {customGif && (
            <button
              onClick={handleReset}
              className="text-xs text-amber-400/70 hover:text-amber-400 mt-2 cursor-pointer"
            >
              Aleatorio
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
