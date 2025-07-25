import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Wallet, 
  PiggyBank, 
  Shield, 
  TrendingUp, 
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { sampleUser, savingsGoals } from '@/lib/data';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const getUserCurrency = () => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.currency || 'USD';
  } catch {
    return 'USD';
  }
};

const getUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.name || sampleUser.name;
  } catch {
    return sampleUser.name;
  }
};

const getUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.email || '';
  } catch {
    return '';
  }
};

const getUserBalance = () => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.balance || 0;
  } catch {
    return 0;
  }
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(true);
  const [userCurrency, setUserCurrency] = useState(getUserCurrency());
  const userName = getUserName();
  const userEmail = getUserEmail();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(getUserBalance());
  const navigate = useNavigate();

  useEffect(() => {
    setBalance(getUserBalance());
    if (userEmail) {
      const txs = JSON.parse(localStorage.getItem(`transactions_${userEmail}`) || '[]');
      setTransactions(txs);
    }
    // Listen for wallet-balance-updated event for real-time sync
    const onWalletUpdate = () => {
      if (userEmail) {
        const txs = JSON.parse(localStorage.getItem(`transactions_${userEmail}`) || '[]');
        setTransactions(txs);
      }
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    // Listen for currency-changed event
    const onCurrencyChanged = () => {
      setUserCurrency(getUserCurrency());
    };
    window.addEventListener('currency-changed', onCurrencyChanged);
    return () => {
      window.removeEventListener('wallet-balance-updated', onWalletUpdate);
      window.removeEventListener('currency-changed', onCurrencyChanged);
    };
  }, [userEmail]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'save':
        return <PiggyBank className="h-4 w-4 text-primary" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: userCurrency }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.welcome', { name: userName })}</h1>
          <p className="text-muted-foreground">{t('dashboard.manageFinances')}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
          {userName.split(' ').map(n => n[0]).join('')}
        </div>
      </div>

      {/* Balance Card */}
      <Card
        className="rounded-2xl shadow-lg border border-border relative transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary/60 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(120,132,255,0.12) 0%, rgba(0,212,255,0.10) 100%)',
          overflow: 'hidden',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)'}} />
        <CardContent className="p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-foreground">
          <div>
            <p className="text-base font-semibold tracking-wide uppercase mb-2 text-foreground" style={{ letterSpacing: '0.08em' }}>{t('dashboard.totalBalance')}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg text-foreground" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px hsla(var(--primary),0.18)' }}>{showBalance ? formatCurrency(balance) : '••••••'}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Toggle balance visibility"
              >
                {showBalance ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <div className="flex gap-3 mt-3">
              <Button
                size="lg"
                variant="default"
                onClick={() => navigate('/dashboard/send')}
                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md px-6 py-2 rounded-xl text-lg hover:scale-105 transition-transform border-0 focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                <Send className="h-5 w-5 mr-2" />
                {t('dashboard.sendMoney')}
              </Button>
              <Button
                size="lg"
                variant="default"
                onClick={() => navigate('/dashboard/wallet', { state: { tab: 'add-money' } })}
                className="bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-md px-6 py-2 rounded-xl text-lg hover:scale-105 transition-transform border-0"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('dashboard.addMoney')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer rounded-xl shadow-md border border-border transition-all hover:shadow-xl hover:bg-primary/10 focus-within:ring-2 focus-within:ring-primary/60" onClick={() => navigate('/dashboard/send')} tabIndex={0}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">{t('dashboard.sendMoney')}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.quickTransfer')}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/wallet')}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-success" />
            </div>
            <p className="font-medium">{t('dashboard.wallet')}</p>
            <p className="text-sm text-muted-foreground">Manage funds</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/savings')}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-warning/10 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-warning" />
            </div>
            <p className="font-medium">{t('dashboard.savings')}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.buildFuture')}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/insurance')}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <p className="font-medium">{t('dashboard.insurance')}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.stayProtected')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('dashboard.recentTransactions')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/transactions')}>
            {t('dashboard.viewAll')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 && (
              <div className="p-3 text-center text-muted-foreground">{t('dashboard.noTransactions')}</div>
            )}
            {transactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'send' ? `${t('dashboard.to')} ${transaction.recipient}` :
                       transaction.type === 'receive' ? t('dashboard.moneyReceived') :
                       transaction.type === 'save' ? t('dashboard.saved') : t('dashboard.transaction')}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`font-medium ${transaction.type === 'send' ? 'text-destructive' : 'text-success'}`}>
                    {transaction.type === 'send' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </p>
                  {transaction.fee > 0 && (
                    <p className="text-sm text-muted-foreground">{t('dashboard.fee')}: {formatCurrency(transaction.fee)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;