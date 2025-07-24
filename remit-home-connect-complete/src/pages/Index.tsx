import { useState } from 'react';
import Login from '@/components/Login';
import Register from '@/components/Register';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showHelp, setShowHelp] = useState(false);

  // Theme switching logic
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <img src="/favicon.ico" alt="CashBridge logo" className="w-7 h-7 rounded-full" />
            <span className="text-2xl font-bold text-primary tracking-tight">CashBridge</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            className="flex items-center gap-1 px-3 py-1 rounded hover:bg-muted transition"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-400" />}
            <span className="hidden md:inline text-sm font-medium">{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
          </button>
          {/* Help Button */}
          <button
            className="flex items-center gap-1 px-3 py-1 rounded hover:bg-muted transition"
            onClick={() => setShowHelp(true)}
            aria-label="Help/About"
          >
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="hidden md:inline text-sm font-medium">Help</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 to-secondary/10 relative overflow-hidden" style={{
        backgroundImage: "url('/landing-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="relative z-20 max-w-2xl mx-auto text-center space-y-6">
          <span className="flex items-center justify-center gap-3 mb-4">
            <img src="/favicon.ico" alt="CashBridge logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-xl" style={{textShadow: '0 2px 16px rgba(0,0,0,0.35)'}}>Welcome to CashBridge</h1>
          </span>
          <p className="text-lg md:text-xl text-white/90 mb-6 font-medium drop-shadow" style={{textShadow: '0 2px 12px rgba(0,0,0,0.25)'}}>
            The all-in-one platform to manage your finances, send money, save for goals, and protect your future with insurance. Enjoy a seamless, secure, and beautiful experience—anywhere, anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-lg shadow-xl border border-primary/60 hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-primary/60 focus:ring-offset-2"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-xl border border-secondary/60 hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-secondary/60 focus:ring-offset-2"
              onClick={() => setShowRegister(true)}
            >
              Get Started
            </button>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-lg p-6 relative w-full max-w-md mx-auto">
            <button className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-primary" onClick={() => setShowLogin(false)}>&times;</button>
            <Login switchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
          </div>
        </div>
      )}
      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-lg p-6 relative w-full max-w-lg mx-auto">
            <button className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-primary" onClick={() => setShowRegister(false)}>&times;</button>
            <Register switchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
          </div>
        </div>
      )}
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-lg p-6 relative w-full max-w-lg mx-auto">
            <button className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-primary" onClick={() => setShowHelp(false)}>&times;</button>
            <span className="flex items-center gap-2 mb-2">
              <img src="/favicon.ico" alt="CashBridge logo" className="w-7 h-7 rounded-full" />
              <h2 className="text-2xl font-bold text-primary">{t('misc.aboutTitle')}</h2>
            </span>
            <p className="mb-4 text-muted-foreground">{t('misc.aboutDesc')}</p>
            <ul className="list-disc pl-5 space-y-1 text-foreground mb-4">
              <li>{t('misc.aboutFeature1')}</li>
              <li>{t('misc.aboutFeature2')}</li>
              <li>{t('misc.aboutFeature3')}</li>
              <li>{t('misc.aboutFeature4')}</li>
              <li>{t('misc.aboutFeature5')}</li>
            </ul>
            <span className="text-muted-foreground">{t('misc.aboutHelp')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
