import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Globe, Menu, X } from 'lucide-react';
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

const TopNav = () => {
  const { t } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const user = getAuthUser();

  useEffect(() => {
    setSelectedLanguage(user.language || 'en');
    if (user.email) {
      const txs = getUserTransactions(user.email);
      setNotifications(txs.filter((tx: any) => tx.type === 'send' || tx.type === 'receive'));
    }
    // Listen for wallet-balance-updated event for real-time sync
    const onWalletUpdate = () => {
      const updatedUser = getAuthUser();
      setSelectedLanguage(updatedUser.language || 'en');
      if (updatedUser.email) {
        const txs = getUserTransactions(updatedUser.email);
        setNotifications(txs.filter((tx: any) => tx.type === 'send' || tx.type === 'receive'));
      }
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    return () => window.removeEventListener('wallet-balance-updated', onWalletUpdate);
  }, [user.email, user.language]);

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
          { id: 'dashboard', label: t('dashboard.dashboard'), path: '/dashboard' },
          { id: 'send', label: t('dashboard.sendMoney'), path: '/dashboard/send' },
          { id: 'wallet', label: t('dashboard.wallet'), path: '/dashboard/wallet' },
          { id: 'savings', label: t('dashboard.savings'), path: '/dashboard/savings' },
          { id: 'insurance', label: t('dashboard.insurance'), path: '/dashboard/insurance' },
          { id: 'settings', label: t('dashboard.settings'), path: '/dashboard/settings' }
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
        {/* Language Selector */}
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
            {notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                {notifications.length}
              </Badge>
            )}
          </Button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto text-black">
              <div className="p-3 border-b font-semibold">Payment Notifications</div>
              {notifications.length === 0 && <div className="p-3 text-muted-foreground">No notifications</div>}
              {notifications.map((tx, idx) => (
                <div key={tx.id || idx} className="p-3 border-b last:border-b-0">
                  <div className="font-medium capitalize">{tx.type === 'send' ? `Sent to ${tx.recipient}` : `Received`}</div>
                  <div className="text-xs text-muted-foreground">{tx.date} · {tx.currency} {tx.amount}</div>
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