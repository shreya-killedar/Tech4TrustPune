import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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
  const [showBalance, setShowBalance] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [tab, setTab] = useState('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();
  const [managerOpen, setManagerOpen] = useState(false);
  const user = getAuthUser();
  const userEmail = getUserEmail();
  const userCurrency = user.currency || 'USD';
  const [recipients, setRecipients] = useState(() => JSON.parse(localStorage.getItem(`recipients_${userEmail}`) || '[]'));
  const [insurance, setInsurance] = useState(() => JSON.parse(localStorage.getItem(`insurance_${userEmail}`) || '[]'));
  const [savings, setSavings] = useState(() => JSON.parse(localStorage.getItem(`savings_${userEmail}`) || '[]'));
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

      {/* Wallet Manager Card */}
      <Card
        className="border-0 shadow-2xl rounded-3xl overflow-hidden relative mb-8"
        style={{
          background: 'linear-gradient(120deg, hsla(var(--primary),0.10) 0%, hsla(var(--secondary),0.08) 100%), hsla(var(--card), 0.90)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '2px solid hsla(var(--primary),0.12)',
          boxShadow: '0 8px 32px 0 hsla(var(--primary),0.10)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <CardContent className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="text-base font-semibold tracking-wide uppercase mb-2" style={{ color: 'hsl(var(--muted-foreground))', letterSpacing: '0.08em' }}>Wallet Manager</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg" style={{ color: 'hsl(var(--foreground))', letterSpacing: '-0.03em', textShadow: '0 2px 16px hsla(var(--primary),0.12)' }}>{formatCurrency(balance)}</p>
              <span className="text-lg font-bold text-primary">{userCurrency}</span>
            </div>
            <p className="text-muted-foreground mt-2">{userEmail}</p>
          </div>
          <div className="flex flex-col gap-3 items-end">
            <Button
              size="lg"
              variant="default"
              onClick={() => setManagerOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md px-6 py-2 rounded-xl text-lg hover:scale-105 transition-transform border-0"
            >
              View All Wallet Data
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Wallet Manager Modal */}
      <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Wallet Data Manager</DialogTitle>
            <DialogDescription>View all your wallet-related data in one place.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="transactions" className="w-full mt-4">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
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
            </TabsContent>
            <TabsContent value="recipients">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r, i) => (
                      <tr key={r.account || i} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2">{r.account}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="insurance">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Premium</th>
                      <th className="px-3 py-2 text-left">Coverage</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insurance.map((ins, i) => (
                      <tr key={ins.id || i} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{ins.name}</td>
                        <td className="px-3 py-2 capitalize">{ins.type}</td>
                        <td className="px-3 py-2">{formatCurrency(ins.monthlyPremium)}</td>
                        <td className="px-3 py-2">{formatCurrency(ins.coverage)}</td>
                        <td className="px-3 py-2">{ins.isActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="savings">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Target</th>
                      <th className="px-3 py-2 text-left">Current</th>
                      <th className="px-3 py-2 text-left">Due Date</th>
                      <th className="px-3 py-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savings.map((goal, i) => (
                      <tr key={goal.id || i} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{goal.name}</td>
                        <td className="px-3 py-2">{formatCurrency(goal.targetAmount)}</td>
                        <td className="px-3 py-2">{formatCurrency(goal.currentAmount)}</td>
                        <td className="px-3 py-2">{goal.dueDate}</td>
                        <td className="px-3 py-2 capitalize">{goal.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          onClick={() => onNavigate('send')} 
          className="h-20 flex-col gap-2 bg-primary hover:bg-primary/90"
        >
          <ArrowUpRight className="h-6 w-6" />
          <span>Send Money</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => setTab('add-money')}
        >
          <Plus className="h-6 w-6" />
          <span>Add Money</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
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
