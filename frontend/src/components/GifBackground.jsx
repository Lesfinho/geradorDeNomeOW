import { useState, useEffect } from 'react';
import { getRandomGif } from '../gifs';
import { playClick } from '../sounds';

export default function GifBackground({ children, customGif, onChangeGif }) {
  const [defaultGif, setDefaultGif] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    setDefaultGif(getRandomGif());
  }, []);

  const activeGif = customGif || defaultGif;

  const handleSubmit = (e) => {
    e.preventDefault();
    playClick();
    const url = inputVal.trim();
    if (url) {
      onChangeGif(url);
    }
    setInputVal('');
    setShowInput(false);
  };

  const handleReset = () => {
    playClick();
    onChangeGif('');
    setDefaultGif(getRandomGif());
    setShowInput(false);
  };

  return (
    <div className="min-h-screen relative">
      {activeGif && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20"
            style={{ backgroundImage: `url(${activeGif})` }}
          />
          <div className="fixed inset-0 bg-black/60 -z-10" />
        </>
      )}
      {!activeGif && <div className="fixed inset-0 bg-gray-900 -z-10" />}

      {/* GIF control button */}
      <button
        onClick={() => { playClick(); setShowInput(!showInput); }}
        className="fixed bottom-4 right-4 z-40 bg-gray-900/80 backdrop-blur text-gray-400 hover:text-white p-2 rounded-full border border-gray-700 hover:border-gray-500 transition-all cursor-pointer text-lg"
        title="Trocar GIF de fundo"
      >
        🎬
      </button>

      {showInput && (
        <div className="fixed bottom-14 right-4 z-40 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-lg p-3 w-72 shadow-2xl">
          <p className="text-xs text-gray-400 mb-2">Cole a URL de um GIF:</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="url"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="https://media.tenor.com/..."
              className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 cursor-pointer"
            >
              OK
            </button>
          </form>
          {customGif && (
            <button
              onClick={handleReset}
              className="text-xs text-red-400 hover:text-red-300 mt-2 cursor-pointer"
            >
              Resetar para aleatorio
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
