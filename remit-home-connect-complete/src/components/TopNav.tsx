import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Globe, Menu, X, Sun, Moon } from 'lucide-react';
import { languages } from '@/lib/data';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [insuranceNotifications, setInsuranceNotifications] = useState(() => getUserNotifications(getAuthUser().email || 'guest'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const user = getAuthUser();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileBtnRef = useRef(null);

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

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    // Update user language in localStorage
    const user = getAuthUser();
    if (user && user.email) {
      const updatedUser = { ...user, language: lang };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      // Optionally, trigger a reload or event if you want to update everywhere
      window.dispatchEvent(new Event('wallet-balance-updated'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    navigate('/login');
  };
  return (
    <nav className="hidden md:flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/favicon.ico" alt="CashBridge logo" className="w-8 h-8 rounded-lg" />
        <h1 className="text-xl font-bold text-primary">CashBridge</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-1 relative">
        {[
          { id: 'dashboard', label: t('dashboard.dashboard'), path: '/dashboard' },
          { id: 'send', label: t('dashboard.sendMoney'), path: '/dashboard/send' },
          { id: 'wallet', label: t('dashboard.wallet'), path: '/dashboard/wallet' },
          { id: 'savings', label: t('dashboard.savings'), path: '/dashboard/savings' },
          { id: 'insurance', label: t('dashboard.insurance'), path: '/dashboard/insurance' },
          { id: 'faq', label: t('dashboard.faq'), path: '/dashboard/faq' },
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

         <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{currentLanguage?.flag}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
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
           
              <div className="flex items-center justify-between p-3 border-b font-semibold">
                <span>Payment Notifications</span>
                <button
                  className="p-1 rounded hover:bg-gray-100 focus:outline-none"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
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
        {/* Profile menu (avatar with dropdown) */}
        <div className="relative ml-4">
          <button
            ref={profileBtnRef}
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            aria-label="Open profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              {userInitial}
            </div>
          </button>
          {profileMenuOpen && (
            <div className="absolute right-0 top-12 bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg py-2 w-40 z-50 animate-fadeIn" style={{minWidth: '140px'}}>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted transition text-foreground"
                onClick={() => { setProfileMenuOpen(false); navigate('/dashboard/settings'); }}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted transition text-foreground"
                onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;