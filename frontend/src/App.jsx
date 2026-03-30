import { useState, useEffect, useCallback } from 'react';
import { getStats } from './api';
import Header from './components/Header';
import RegisterForm from './components/RegisterForm';
import AddNameForm from './components/AddNameForm';
import DrawName from './components/DrawName';
import PoolStats from './components/PoolStats';
import NameList from './components/NameList';
import Suggestions from './components/Suggestions';
import GifBackground from './components/GifBackground';
import { playClick } from './sounds';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('main');
  const [refreshKey, setRefreshKey] = useState(0);
  const [customGif, setCustomGif] = useState(() => localStorage.getItem('customGif') || '');

  const refreshStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // ignore
    }
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (user) refreshStats();
  }, [user, refreshStats]);

  const handleRegister = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setStats(null);
  };

  const handleSetGif = (url) => {
    setCustomGif(url);
    if (url) {
      localStorage.setItem('customGif', url);
    } else {
      localStorage.removeItem('customGif');
    }
  };

  if (!user) {
    return <RegisterForm onRegister={handleRegister} />;
  }

  const tabs = [
    { id: 'main', label: 'Inicio' },
    { id: 'list', label: 'Todos os Nomes' },
    { id: 'suggest', label: 'Sugestoes' },
  ];

  return (
    <GifBackground customGif={customGif} onChangeGif={handleSetGif}>
      <div className="min-h-screen flex flex-col">
        <div className="w-full max-w-2xl mx-auto px-4 pt-4">
          <Header user={user} onLogout={handleLogout} />
        </div>

        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="flex gap-2 my-4 justify-center">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { playClick(); setTab(t.id); }}
                className={`pill-btn px-4 py-2 text-sm ${
                  tab === t.id
                    ? 'pill-btn-glass active'
                    : 'pill-btn-glass'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex justify-center px-4 py-6 ${tab === 'suggest' ? 'items-start pt-2' : 'items-center'}`}>
          <div className={`w-full ${tab === 'list' ? 'max-w-6xl' : 'max-w-2xl'}`}>
            <main className="space-y-3">
              {tab === 'main' && (
                <>
                  <PoolStats stats={stats} />
                  <DrawName onDrawn={refreshStats} />
                  <AddNameForm onNameAdded={refreshStats} />
                </>
              )}
              {tab === 'list' && <NameList refreshKey={refreshKey} />}
              {tab === 'suggest' && <Suggestions />}
            </main>
          </div>
        </div>
      </div>
    </GifBackground>
  );
}

export default App;
