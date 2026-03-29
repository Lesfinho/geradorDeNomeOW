import { useState, useEffect, useCallback } from 'react';
import { getStats, addName } from './api';
import Header from './components/Header';
import RegisterForm from './components/RegisterForm';
import AddNameForm from './components/AddNameForm';
import DrawName from './components/DrawName';
import PoolStats from './components/PoolStats';
import NameList from './components/NameList';
import Suggestions from './components/Suggestions';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('main');
  const [refreshKey, setRefreshKey] = useState(0);

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

  if (!user) {
    return <RegisterForm onRegister={handleRegister} />;
  }

  const tabs = [
    { id: 'main', label: 'Início' },
    { id: 'list', label: 'Todos os Nomes' },
    { id: 'suggest', label: 'Sugestões' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <div className="max-w-2xl mx-auto px-6 mt-6">
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
                tab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <main className="max-w-2xl mx-auto px-6 pb-6 space-y-6">
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
    </div>
  );
}

export default App;
