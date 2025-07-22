import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Globe, Menu, X, Sun, Moon } from 'lucide-react';
import { languages } from '@/lib/data';
import { useNavigate } from 'react-router-dom';

function getAuthUser() {
  return JSON.parse(localStorage.getItem('auth_user') || '{}');
}

function getUserTransactions(email: string) {
  return JSON.parse(localStorage.getItem(`transactions_${email}`) || '[]');
}

function getUserNotifications(email: string) {
  return JSON.parse(localStorage.getItem(`notifications_${email}`) || '[]');
}

const TopNav = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [insuranceNotifications, setInsuranceNotifications] = useState(() => getUserNotifications(getAuthUser().email || 'guest'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const user = getAuthUser();

  useEffect(() => {
    setSelectedLanguage(user.language || 'en');
    if (user.email) {
      const txs = getUserTransactions(user.email);
      setNotifications(txs.filter((tx: any) => tx.type === 'send' || tx.type === 'receive'));
      setInsuranceNotifications(getUserNotifications(user.email));
    }
    // Listen for wallet-balance-updated event for real-time sync
    const onWalletUpdate = () => {
      const updatedUser = getAuthUser();
      setSelectedLanguage(updatedUser.language || 'en');
      if (updatedUser.email) {
        const txs = getUserTransactions(updatedUser.email);
        setNotifications(txs.filter((tx: any) => tx.type === 'send' || tx.type === 'receive'));
        setInsuranceNotifications(getUserNotifications(updatedUser.email));
      }
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    // Listen for insurance notifications
    const onNotifUpdate = () => {
      setInsuranceNotifications(getUserNotifications(user.email));
    };
    window.addEventListener('notifications-updated', onNotifUpdate);
    return () => {
      window.removeEventListener('wallet-balance-updated', onWalletUpdate);
      window.removeEventListener('notifications-updated', onNotifUpdate);
    };
  }, [user.email, user.language]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);
  const userInitial = user.name ? user.name[0].toUpperCase() : '?';

  return (
    <nav className="hidden md:flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">RC</span>
        </div>
        <h1 className="text-xl font-bold text-primary">RemitConnect</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-1">
        {[
          { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
          { id: 'send', label: 'Send Money', path: '/dashboard/send' },
          { id: 'wallet', label: 'Wallet', path: '/dashboard/wallet' },
          { id: 'savings', label: 'Savings', path: '/dashboard/savings' },
          { id: 'insurance', label: 'Insurance', path: '/dashboard/insurance' },
          { id: 'settings', label: 'Settings', path: '/dashboard/settings' }
        ].map((item) => (
          <Button
            key={item.id}
            variant={window.location.pathname === item.path ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate(item.path)}
            className="px-4"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 relative">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full hover:bg-primary/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="sm" className="relative" onClick={() => setShowNotifications(v => !v)}>
            <Bell className="h-5 w-5" />
            {(notifications.length > 0 || insuranceNotifications.length > 0) && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                {notifications.length + insuranceNotifications.length}
              </Badge>
            )}
          </Button>
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-96 rounded-xl border shadow-xl z-50 max-h-96 overflow-y-auto"
              style={{
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                borderColor: 'hsl(var(--border))',
                boxShadow: '0 8px 32px 0 hsl(var(--shadow-card, 217 91% 60% / 0.10))',
                transition: 'all 0.2s cubic-bezier(.4,0,.2,1)'
              }}
            >
              <div className="p-3 border-b font-semibold" style={{ borderColor: 'hsl(var(--border))' }}>
                Payment & Insurance Notifications
              </div>
              {notifications.length === 0 && insuranceNotifications.length === 0 && (
                <div className="p-3 text-muted-foreground">No notifications</div>
              )}
              {notifications.map((tx, idx) => (
                <div
                  key={tx.id || idx}
                  className="p-3 border-b last:border-b-0 flex items-start gap-2"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  <div className="flex-shrink-0 w-2 h-8 rounded bg-primary/80 mr-2" />
                  <div>
                    <div className="font-medium capitalize">{tx.type === 'send' ? `Sent to ${tx.recipient}` : `Received`}</div>
                    <div className="text-xs text-muted-foreground">{tx.date} · {tx.currency} {tx.amount}</div>
                  </div>
                </div>
              ))}
              {insuranceNotifications.map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  className={`p-3 border-b last:border-b-0 flex items-start gap-2 ${!notif.read ? 'bg-accent/30' : ''}`}
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  <div className={`flex-shrink-0 w-2 h-8 rounded ${!notif.read ? 'bg-primary' : 'bg-muted'}`} />
                  <div>
                    <div className="font-medium">Insurance Claim: {notif.policy}</div>
                    <div className="text-xs text-muted-foreground">{notif.date}</div>
                    <div className="text-xs">Reason: {notif.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/settings')}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
            {userInitial}
          </div>
          <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
        </Button>
      </div>
    </nav>
  );
};

export default TopNav;