import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const userCurrency = user.currency || 'USD';
  const navigate = useNavigate();

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
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wallet-balance-updated', onWalletUpdate);
    };
  }, [userEmail]);

  // Add Money
  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (amt && amt > 0) {
      const newBalance = balance + amt;
      setBalance(newBalance);
      setAuthUser({ ...user, balance: newBalance });
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
        title: 'Money Added Successfully!',
        description: `${userCurrency} ${amt} has been added to your wallet`,
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
      setAuthUser({ ...user, balance: newBalance });
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
        title: 'Withdrawal Initiated!',
        description: `${userCurrency} ${amt} withdrawal request submitted`,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-muted-foreground">Manage your digital wallet</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-primary-glow text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-white/80 mb-2">Available Balance</p>
              <div className="flex items-center gap-3">
                {showBalance ? (
                  <h2 className="text-4xl font-bold">{userCurrency} {balance.toLocaleString()}</h2>
                ) : (
                  <h2 className="text-4xl font-bold">••••••</h2>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/10"
                >
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-sm text-white/80 mt-1">Last updated: Today, {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-center">
              <WalletIcon className="h-12 w-12 text-white/80 mx-auto mb-2" />
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Active
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-white/80">This Month</p>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-white" />
                <p className="font-bold">+{userCurrency} {thisMonthTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/80">Total Sent</p>
              <p className="font-bold">{userCurrency} {totalSent.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant={tab === 'send' ? 'default' : 'outline'}
          className={`h-20 flex-col gap-2 ${tab === 'send' ? 'bg-primary text-white border-primary' : ''}`}
          onClick={() => navigate('/dashboard/send')}
        >
          <ArrowUpRight className="h-6 w-6" />
          <span>Send Money</span>
        </Button>
        
        <Button 
          variant={tab === 'add-money' ? 'default' : 'outline'}
          className={`h-20 flex-col gap-2 ${tab === 'add-money' ? 'bg-primary text-white border-primary' : ''}`}
          onClick={() => setTab('add-money')}
        >
          <Plus className="h-6 w-6" />
          <span>Add Money</span>
        </Button>
        
        <Button 
          variant={tab === 'withdraw' ? 'default' : 'outline'}
          className={`h-20 flex-col gap-2 ${tab === 'withdraw' ? 'bg-primary text-white border-primary' : ''}`}
          onClick={() => setTab('withdraw')}
        >
          <ArrowDownLeft className="h-6 w-6" />
          <span>Withdraw</span>
        </Button>
      </div>

      {/* Wallet Management */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="add-money">Add Money</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletTransactions.length === 0 && (
                  <div className="text-center text-muted-foreground">No transactions yet.</div>
                )}
                {walletTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Money Tab */}
        <TabsContent value="add-money">
          <Card>
            <CardHeader>
              <CardTitle>Add Money to Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="add-amount">Amount ({userCurrency})</Label>
                <Input
                  id="add-amount"
                  type="number"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Payment Methods</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">••••4532</p>
                      </div>
                      <Badge variant="default">Instant</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground">Wells Fargo ••••3456</p>
                      </div>
                      <Badge variant="secondary">1-2 days</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleAddMoney} className="w-full" disabled={!addAmount || parseFloat(addAmount) <= 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add {userCurrency} {addAmount || '0'} to Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="withdraw-amount">Amount ({userCurrency})</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available balance: {userCurrency} {balance.toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Withdrawal Method</h3>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Bank Account</p>
                      <p className="text-sm text-muted-foreground">Wells Fargo ••••3456</p>
                    </div>
                    <Badge variant="secondary">1-3 days</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Withdrawal Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum withdrawal: $10</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• No withdrawal fees</li>
                  <li>• Available 24/7</li>
                </ul>
              </div>

              <Button 
                onClick={handleWithdraw} 
                className="w-full" 
                disabled={!withdrawAmount || parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) < 10}
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Withdraw {userCurrency} {withdrawAmount || '0'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Wallet;
