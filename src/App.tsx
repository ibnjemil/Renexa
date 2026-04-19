import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { WelcomeHero } from './components/Home/WelcomeHero';
import { SparkArena } from './components/SparkArena/SparkArena';
import { ClubForum } from './components/InventorsClub/ClubForum';
import { ChatBot } from './components/ChatBot/ChatBot';
import { UserDashboard } from './components/Dashboard/UserDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { UserProfile } from './components/Profile/UserProfile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('renexa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogin = (name: string) => {
    const newUser = {
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      joined: new Date().toISOString(),
      email: `${name.toLowerCase().replace(/\s/g, '')}@example.com`
    };
    setUser(newUser);
    localStorage.setItem('renexa_user', JSON.stringify(newUser));
    localStorage.setItem('renexa_author', name);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('renexa_user');
    localStorage.removeItem('renexa_author');
    localStorage.removeItem('admin_token');
    setCurrentPage('home');
    setIsAdmin(false);
  };

  const renderPage = () => {
    if (currentPage === 'admin' && isAdmin) {
      return <AdminDashboard />;
    }

    switch (currentPage) {
      case 'home':
        return <WelcomeHero onGetStarted={() => setCurrentPage('spark')} />;
      case 'spark':
        return <SparkArena user={user} onLogin={handleLogin} />;
      case 'club':
        return <ClubForum user={user} onLogin={handleLogin} />;
      case 'chat':
        return <ChatBot />;
      case 'dashboard':
        return <UserDashboard user={user} onLogin={handleLogin} />;
      case 'profile':
        return <UserProfile user={user} onLogout={handleLogout} />;
      default:
        return <WelcomeHero onGetStarted={() => setCurrentPage('spark')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
