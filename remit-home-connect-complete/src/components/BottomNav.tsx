import { Home, Send, Wallet, PiggyBank, Shield, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navItems = [
    { id: 'dashboard', label: t('dashboard.home'), icon: Home, path: '/dashboard' },
    { id: 'send', label: t('dashboard.send'), icon: Send, path: '/dashboard/send' },
    { id: 'wallet', label: t('dashboard.wallet'), icon: Wallet, path: '/dashboard/wallet' },
    { id: 'savings', label: t('dashboard.savings'), icon: PiggyBank, path: '/dashboard/savings' },
    { id: 'insurance', label: t('dashboard.insurance'), icon: Shield, path: '/dashboard/insurance' },
    { id: 'settings', label: t('dashboard.settings'), icon: SettingsIcon, path: '/dashboard/settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = window.location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;