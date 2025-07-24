import { useState } from 'react';
import Login from '@/components/Login';
import Register from '@/components/Register';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, HelpCircle } from 'lucide-react';

const Index = () => {
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
          <span className="text-2xl font-bold text-primary tracking-tight">Tech4Trust</span>
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-xl" style={{textShadow: '0 2px 16px rgba(0,0,0,0.35)'}}>Welcome to Tech4Trust</h1>
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
            <h2 className="text-2xl font-bold mb-2 text-primary">About Tech4Trust</h2>
            <p className="mb-4 text-muted-foreground">
              Tech4Trust is your one-stop solution for digital finance: send money, manage your wallet, save for your dreams, and secure your future with insurance. Designed for speed, security, and a delightful user experience.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-foreground mb-4">
              <li>Send and receive money instantly</li>
              <li>Track your wallet and transaction history</li>
              <li>Set and achieve savings goals</li>
              <li>Get insurance protection for peace of mind</li>
              <li>Modern, responsive, and theme-aware UI</li>
            </ul>
            <div className="text-center">
              <span className="text-muted-foreground">Need more help? Contact support@tech4trust.com</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
