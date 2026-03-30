import { useState, useEffect, useCallback } from 'react';
import { getStats, addName } from './api';
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

  const handleAddSuggestion = async (name) => {
    try {
      await addName(name);
      refreshStats();
    } catch {
      // ignore
    }
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
      <Header user={user} onLogout={handleLogout} />
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="flex gap-2 mb-4 justify-center">
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
      <main className="max-w-2xl mx-auto px-4 pb-6 space-y-3">
        {tab === 'main' && (
          <>
            <PoolStats stats={stats} />
            <AddNameForm onNameAdded={refreshStats} />
            <DrawName onDrawn={refreshStats} />
          </>
        )}
        {tab === 'list' && <NameList refreshKey={refreshKey} />}
        {tab === 'suggest' && <Suggestions onAddSuggestion={handleAddSuggestion} />}
      </main>
    </GifBackground>
  );
}

export default App;
