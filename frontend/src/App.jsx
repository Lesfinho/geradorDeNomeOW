import { useState, useEffect, useCallback } from 'react';
import { getStats } from './api';
import Header from './components/Header';
import RegisterForm from './components/RegisterForm';
import AddNameForm from './components/AddNameForm';
import DrawName from './components/DrawName';
import PoolStats from './components/PoolStats';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // ignore
    }
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

  if (!user) {
    return <RegisterForm onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <main className="max-w-2xl mx-auto p-6 space-y-6 mt-6">
        <PoolStats stats={stats} />
        <AddNameForm userId={user.id} onNameAdded={refreshStats} />
        <DrawName userId={user.id} onDrawn={refreshStats} />
      </main>
    </div>
  );
}

export default App;
