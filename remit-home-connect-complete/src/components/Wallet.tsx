import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet as WalletIcon, 
  ArrowLeft, 
  Plus,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  TrendingUp
} from 'lucide-react';  
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface WalletProps {
  onNavigate: (page: string) => void;
}

function getAuthUser() {
  return JSON.parse(localStorage.getItem('auth_user') || '{}');
}

function setAuthUser(user: any) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

function getUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.email || '';
  } catch {
    return '';
  }
}

function getTransactions(userEmail: string) {
  return JSON.parse(localStorage.getItem(`transactions_${userEmail}`) || '[]');
}

function saveTransaction(userEmail: string, tx: any) {
  const key = `transactions_${userEmail}`;
  const txs = JSON.parse(localStorage.getItem(key) || '[]');
  txs.unshift(tx);
  localStorage.setItem(key, JSON.stringify(txs));
}

function updateUserBalance(email: string, newBalance: number) {
  // Update auth_user
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  if (authUser.email === email) {
    authUser.balance = newBalance;
    localStorage.setItem('auth_user', JSON.stringify(authUser));
  }
  // Update users array
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex(u => u.email === email);
  if (idx !== -1) {
    users[idx].balance = newBalance;
    localStorage.setItem('users', JSON.stringify(users));
  }
}

const Wallet = ({ onNavigate }: WalletProps) => {
  const location = useLocation();
  const initialTab = location.state?.tab || 'transactions';
  const [showBalance, setShowBalance] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [tab, setTab] = useState(initialTab);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();
  const user = getAuthUser();
  const userEmail = getUserEmail();
  const [userCurrency, setUserCurrency] = useState(user.currency || 'USD');
  const [recipients, setRecipients] = useState(() => JSON.parse(localStorage.getItem(`recipients_${userEmail}`) || '[]'));
  const [insurance, setInsurance] = useState(() => JSON.parse(localStorage.getItem(`insurance_${userEmail}`) || '[]'));
  const [savings, setSavings] = useState(() => JSON.parse(localStorage.getItem(`savings_${userEmail}`) || '[]'));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('transactions');
  const [managerOpen, setManagerOpen] = useState(false);

  // Helper to get balance from localStorage
  function getUserBalance() {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return user.balance || 0;
    } catch {
      return 0;
    }
  }

  // Load balance and transactions on mount/focus
  useEffect(() => {
    setBalance(getUserBalance());
    if (userEmail) {
      setTransactions(getTransactions(userEmail));
    }
    const onStorage = () => {
      setBalance(getUserBalance());
      if (userEmail) setTransactions(getTransactions(userEmail));
    };
    window.addEventListener('storage', onStorage);
    // Listen for custom wallet-balance-updated event
    const onWalletUpdate = () => {
      setBalance(getUserBalance());
      if (userEmail) setTransactions(getTransactions(userEmail));
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    // Listen for currency-changed event
    const onCurrencyChanged = () => {
      const user = getAuthUser();
      setUserCurrency(user.currency || 'USD');
    };
    window.addEventListener('currency-changed', onCurrencyChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wallet-balance-updated', onWalletUpdate);
      window.removeEventListener('currency-changed', onCurrencyChanged);
    };
  }, [userEmail]);

  // Add Money
  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (amt && amt > 0) {
      const newBalance = balance + amt;
      setBalance(newBalance);
      updateUserBalance(userEmail, newBalance);
      // Add transaction
      const now = new Date();
      saveTransaction(userEmail, {
        id: Date.now(),
        type: 'receive',
        amount: amt,
        currency: userCurrency,
        status: 'completed',
        date: now.toISOString().slice(0, 10),
        fee: 0
      });
      setTransactions(getTransactions(userEmail));
      toast({
        title: t('wallet.moneyAddedSuccessfully'),
        description: `${userCurrency} ${amt} ${t('wallet.hasBeenAddedToYourWallet')}`,
      });
      setAddAmount('');
      setTab('transactions');
      // Dispatch custom event for real-time sync
      window.dispatchEvent(new Event('wallet-balance-updated'));
    }
  };

  // Withdraw Money
  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (amt && amt > 0 && amt <= balance) {
      const newBalance = balance - amt;
      setBalance(newBalance);
      updateUserBalance(userEmail, newBalance);
      // Add transaction
      const now = new Date();
      saveTransaction(userEmail, {
        id: Date.now(),
        type: 'withdraw',
        amount: amt,
        currency: userCurrency,
        status: 'completed',
        date: now.toISOString().slice(0, 10),
        fee: 0
      });
      setTransactions(getTransactions(userEmail));
      toast({
        title: t('wallet.withdrawalInitiated'),
        description: `${userCurrency} ${amt} ${t('wallet.withdrawalRequestSubmitted')}`,
      });
      setWithdrawAmount('');
      setTab('transactions');
      // Dispatch custom event for real-time sync
      window.dispatchEvent(new Event('wallet-balance-updated'));
    }
  };

  // Wallet summary calculations
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const thisMonthTotal = transactions
    .filter(t => t.type === 'receive' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSent = transactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);

  // Only show send/receive/withdraw in wallet
  const walletTransactions = transactions.filter(t => t.type === 'receive' || t.type === 'send' || t.type === 'withdraw');

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
    }).format(amount);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('wallet.myWallet')}</h1>
          <p className="text-muted-foreground">{t('wallet.manageDigitalWallet')}</p>
        </div>
      </div>

      {/* Wallet Manager Card */}
      <div
        className="rounded-2xl shadow-lg border border-border relative transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary/60 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(120,132,255,0.12) 0%, rgba(0,212,255,0.10) 100%)',
          overflow: 'hidden',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)'}} />
        <CardContent className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="text-base font-semibold tracking-wide uppercase mb-2 text-foreground" style={{ letterSpacing: '0.08em' }}>{t('wallet.walletManager')}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg text-foreground" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px hsla(var(--primary),0.12)' }}>{formatCurrency(balance)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-end">
            <Button
              size="lg"
              variant="default"
              onClick={() => setManagerOpen(true)}
            >
              {t('wallet.walletManager')}
            </Button>
          </div>
        </CardContent>
      </div>
      <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Wallet History</DialogTitle>
            <DialogDescription>View all your wallet transactions.</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Currency</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id || i} className="border-b last:border-b-0">
                    <td className="px-3 py-2">{tx.date}</td>
                    <td className="px-3 py-2 capitalize">{tx.type}</td>
                    <td className="px-3 py-2">{formatCurrency(tx.amount)}</td>
                    <td className="px-3 py-2">{tx.currency}</td>
                    <td className="px-3 py-2">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={() => setSelectedTab('transactions')}
          className={`h-20 flex-col gap-2 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 ${selectedTab === 'transactions' ? 'bg-primary text-white' : 'bg-transparent border border-primary text-primary'}`}
        >
          <ArrowUpRight className="h-6 w-6" />
          <span>{t('wallet.transactions')}</span>
        </Button>
        <Button
          onClick={() => setSelectedTab('add-money')}
          className={`h-20 flex-col gap-2 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 ${selectedTab === 'add-money' ? 'bg-primary text-white' : 'bg-transparent border border-primary text-primary'}`}
        >
          <Plus className="h-6 w-6" />
          <span>{t('wallet.addMoney')}</span>
        </Button>
        <Button
          onClick={() => setSelectedTab('withdraw')}
          className={`h-20 flex-col gap-2 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 ${selectedTab === 'withdraw' ? 'bg-primary text-white' : 'bg-transparent border border-primary text-primary'}`}
        >
          <ArrowDownLeft className="h-6 w-6" />
          <span>{t('wallet.withdraw')}</span>
        </Button>
      </div>

      {/* Panels */}

      {selectedTab === 'add-money' && (
        <div className="bg-card p-6 rounded-xl shadow">
          <Card>
            <CardHeader>
              <CardTitle>{t('wallet.addMoneyToWallet')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="add-amount">{t('wallet.amount', { currency: userCurrency })}</Label>
                <Input
                  id="add-amount"
                  type="number"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">{t('wallet.paymentMethods')}</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{t('wallet.creditDebitCard')}</p>
                        <p className="text-sm text-muted-foreground">{t('wallet.creditCardLastFour')}</p>
                      </div>
                      <Badge variant="default">{t('wallet.instant')}</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{t('wallet.bankTransfer')}</p>
                        <p className="text-sm text-muted-foreground">{t('wallet.wellsFargoLastFour')}</p>
                      </div>
                      <Badge variant="secondary">{t('wallet.oneTwoDays')}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddMoney} className="w-full" disabled={!addAmount || parseFloat(addAmount) <= 0}>
                <Plus className="h-4 w-4 mr-2" />
                {t('wallet.addAmountToWallet', { currency: userCurrency, amount: addAmount || '0' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedTab === 'withdraw' && (
        <div className="bg-card p-6 rounded-xl shadow">
          <Card>
            <CardHeader>
              <CardTitle>{t('wallet.withdrawMoney')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="withdraw-amount">{t('wallet.amount', { currency: userCurrency })}</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {t('wallet.availableBalance', { currency: userCurrency, balance: balance.toLocaleString() })}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">{t('wallet.withdrawalMethod')}</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{t('wallet.bankAccount')}</p>
                      <p className="text-sm text-muted-foreground">{t('wallet.wellsFargoLastFour')}</p>
                    </div>
                    <Badge variant="secondary">{t('wallet.oneThreeDays')}</Badge>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t('wallet.withdrawalInformation')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('wallet.minimumWithdrawal', { currency: userCurrency, amount: 10 })}</li>
                  <li>• {t('wallet.processingTime', { time: 1, unit: 3, businessDays: 'business days' })}</li>
                  <li>• {t('wallet.noWithdrawalFees')}</li>
                  <li>• {t('wallet.available247')}</li>
                </ul>
              </div>
              <Button 
                onClick={handleWithdraw} 
                className="w-full" 
                disabled={!withdrawAmount || parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) < 10}
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                {t('wallet.withdrawAmount', { currency: userCurrency, amount: withdrawAmount || '0' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedTab === 'transactions' && (
        <div className="bg-card p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">{t('wallet.recentTransactions')}</h2>
          <div className="space-y-4">
            {walletTransactions.length === 0 && (
              <div className="text-center text-muted-foreground">{t('wallet.noTransactions')}</div>
            )}
            {walletTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary/60">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'send' ? 'bg-destructive/10' : transaction.type === 'withdraw' ? 'bg-warning/10' : 'bg-success/10'
                  }`}>
                    {transaction.type === 'send' ? 
                      <ArrowUpRight className="h-5 w-5 text-destructive" /> :
                      transaction.type === 'withdraw' ? <ArrowDownLeft className="h-5 w-5 text-warning" /> :
                      <ArrowDownLeft className="h-5 w-5 text-success" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'send' ? `Sent to ${transaction.recipient}` :
                        transaction.type === 'withdraw' ? 'Withdrawal' : 'Money Received'}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'send' ? 'text-destructive' : transaction.type === 'withdraw' ? 'text-warning' : 'text-success'}`}>
                    {transaction.type === 'send' ? '-' : '+'}{userCurrency} {transaction.amount.toLocaleString()}
                  </p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
