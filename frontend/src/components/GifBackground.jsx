import { useState, useEffect } from 'react';
import { playClick } from '../sounds';
import { addSharedGif, getRandomSharedGif } from '../api';

const fallbackGifs = [
  'https://i.imgur.com/b8M5gQ4.gif',
  'https://i.imgur.com/Jv0m2hT.gif',
  'https://i.imgur.com/xR8N7kB.gif',
];

function getRandomGif() {
  return fallbackGifs[Math.floor(Math.random() * fallbackGifs.length)] || '';
}

function isAllowedGifUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const allowedHosts = [
      'media.discordapp.net',
      'cdn.discordapp.com',
      'i.imgur.com',
      'media.tenor.com',
      'c.tenor.com',
      'media.giphy.com',
      'i.giphy.com',
    ];

    const hostAllowed = allowedHosts.some((item) => host === item || host.endsWith(`.${item}`));
    const hasImageExt = /\.(gif|webp|png|jpe?g)$/i.test(path);

    return hostAllowed && (hasImageExt || host.includes('discordapp.com'));
  } catch {
    return false;
  }
}

function createRandomPalette() {
  const hue = Math.floor(Math.random() * 360);
  const bgHue = (hue + 210) % 360;
  const coolHue = (hue + 150) % 360;

  return {
    solid: `hsl(${hue} 88% 62%)`,
    dark: `hsl(${hue} 76% 44%)`,
    glow: `hsla(${hue}, 90%, 60%, 0.45)`,
    bg1: `hsl(${bgHue} 42% 13%)`,
    bg2: `hsl(${(bgHue + 20) % 360} 52% 11%)`,
    bg3: `hsl(${(bgHue + 330) % 360} 50% 17%)`,
    bg4: `hsl(${bgHue} 42% 13%)`,
    orbCool: `hsla(${coolHue}, 80%, 62%, 0.3)`,
    glassBtnBg: `hsla(${hue}, 70%, 68%, 0.18)`,
    glassBtnBorder: `hsla(${hue}, 75%, 78%, 0.34)`,
    glassBtnHover: `hsla(${hue}, 80%, 75%, 0.28)`,
  };
}

function applyAccentPalette(palette) {
  const root = document.documentElement;
  root.style.setProperty('--amber-solid', palette.solid);
  root.style.setProperty('--amber-dark', palette.dark);
  root.style.setProperty('--amber-glow', palette.glow);
  root.style.setProperty('--bg-1', palette.bg1);
  root.style.setProperty('--bg-2', palette.bg2);
  root.style.setProperty('--bg-3', palette.bg3);
  root.style.setProperty('--bg-4', palette.bg4);
  root.style.setProperty('--orb-cool', palette.orbCool);
  root.style.setProperty('--glass-btn-bg', palette.glassBtnBg);
  root.style.setProperty('--glass-btn-border', palette.glassBtnBorder);
  root.style.setProperty('--glass-btn-hover', palette.glassBtnHover);
}

export default function GifBackground({ children, customGif, onChangeGif }) {
  const [defaultGif, setDefaultGif] = useState('');
  const [renderGif, setRenderGif] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [gifError, setGifError] = useState('');
  const [useGif, setUseGif] = useState(() => localStorage.getItem('useGifBg') === 'true');

  useEffect(() => {
    setDefaultGif(getRandomGif());

    const savedPalette = localStorage.getItem('accentPalette');
    if (savedPalette) {
      try {
        applyAccentPalette(JSON.parse(savedPalette));
      } catch {
        // ignore invalid localStorage payload
      }
    }
  }, []);

  useEffect(() => {
    if (!useGif || customGif) return;

    let cancelled = false;
    getRandomSharedGif()
      .then((result) => {
        if (!cancelled && result?.url) {
          onChangeGif(result.url);
        }
      })
      .catch(() => {
        // ignore and keep fallback behavior
      });

    return () => {
      cancelled = true;
    };
  }, [useGif, customGif, onChangeGif]);

  useEffect(() => {
    if (!useGif) {
      setRenderGif('');
      return;
    }

    const candidate = (customGif || defaultGif || getRandomGif()).trim();
    if (!candidate) {
      setRenderGif('');
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setRenderGif(candidate);
    };
    img.onerror = () => {
      const fallback = getRandomGif();
      if (!fallback || fallback === candidate) {
        if (!cancelled) setRenderGif('');
        return;
      }

      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        if (!cancelled) {
          setDefaultGif(fallback);
          setRenderGif(fallback);
        }
      };
      fallbackImg.onerror = () => {
        if (!cancelled) setRenderGif('');
      };
      fallbackImg.src = fallback;
    };
    img.src = candidate;

    return () => {
      cancelled = true;
    };
  }, [customGif, defaultGif, useGif]);

  const activeGif = renderGif;

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();
    const url = inputVal.trim();
    const allowed = isAllowedGifUrl(url);
    if (!allowed) {
      setGifError('URL invalida. Use links diretos de Discord, Imgur, Tenor ou Giphy.');
      return;
    }

    try {
      setGifError('');
      await addSharedGif(url);
      onChangeGif(url);
      setUseGif(true);
      localStorage.setItem('useGifBg', 'true');
      setInputVal('');
      setShowInput(false);
    } catch (err) {
      setGifError(err.message || 'Erro ao salvar GIF');
    }
  };

  const handleReset = async () => {
    playClick();
    try {
      const result = await getRandomSharedGif();
      if (result?.url) {
        onChangeGif(result.url);
        setUseGif(true);
        localStorage.setItem('useGifBg', 'true');
        return;
      }
    } catch {
      // fallback below
    }

    onChangeGif('');
    setDefaultGif(getRandomGif());
  };

  const toggleGif = () => {
    playClick();
    const next = !useGif;
    setUseGif(next);
    localStorage.setItem('useGifBg', String(next));
  };

  const randomizeColors = () => {
    playClick();
    const palette = createRandomPalette();
    applyAccentPalette(palette);
    localStorage.setItem('accentPalette', JSON.stringify(palette));
  };

  return (
    <div className="relative min-h-screen">
      {!activeGif && <div className="fixed inset-0 animated-bg" style={{ zIndex: -30 }} />}

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
            style={{ backgroundImage: `url(${activeGif})`, zIndex: -30 }}
          />
          <div className="fixed inset-0 bg-black/50" style={{ zIndex: -20 }} />
        </>
      )}

      {/* GIF control */}
      <button
        onClick={() => { playClick(); setShowInput(!showInput); }}
        className="fixed bottom-4 right-4 z-40 glass-card-sm p-2.5 cursor-pointer text-white/60 hover:text-white transition-all"
        title="Trocar fundo"
      >
        🎨
      </button>

      {showInput && (
        <div className="fixed bottom-14 right-4 z-40 glass-card p-4 w-72 animate-float-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50 font-medium">Fundo</p>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleGif}
                className={`text-xs pill-btn px-3 py-1 ${useGif ? 'pill-btn-amber' : 'pill-btn-glass'}`}
              >
                {useGif ? 'GIF ON' : 'GIF OFF'}
              </button>
              <button
                onClick={randomizeColors}
                className="text-xs pill-btn pill-btn-glass px-3 py-1"
              >
                COR
              </button>
            </div>
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
          <p className="text-[11px] text-amber-300/80 mt-2">
            Aceita links diretos de Discord, Imgur, Tenor ou Giphy
          </p>
          {gifError && (
            <p className="text-[11px] text-red-300 mt-1">{gifError}</p>
          )}
          <button
            onClick={handleReset}
            className="text-xs text-amber-400/70 hover:text-amber-400 mt-2 cursor-pointer"
          >
            Aleatorio
          </button>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
