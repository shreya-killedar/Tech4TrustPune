import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PiggyBank,
  ArrowLeft,
  Plus,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Home,
  GraduationCap,
  Heart,
  Briefcase
} from 'lucide-react';
import { savingsGoals } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || '{}');
  } catch {
    return {};
  }
}

function getUserSavingsGoals(email: string) {
  const key = `savingsGoals_${email}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  // fallback to sample data
  return savingsGoals;
}

function setUserSavingsGoals(email: string, goals: any[]) {
  const key = `savingsGoals_${email}`;
  localStorage.setItem(key, JSON.stringify(goals));
}

const Savings = () => {
  const { t } = useTranslation();
  const user = getAuthUser();
  const userEmail = user.email || 'sample';
  const [goals, setGoals] = useState(() => getUserSavingsGoals(userEmail));
  const userCurrency = user.currency || 'USD';

  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    category: '',
    dueDate: ''
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editGoalData, setEditGoalData] = useState<any | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState(() => {
    const user = getAuthUser();
    return user.balance || 0;
  });

  useEffect(() => {
    // Listen for wallet-balance-updated event to update balance
    const onWalletUpdate = () => {
      const user = getAuthUser();
      setUserBalance(user.balance || 0);
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    return () => window.removeEventListener('wallet-balance-updated', onWalletUpdate);
  }, []);

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const formatCurrency = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: userCurrency }).format(value);

  function updateGoals(newGoals: any[]) {
    setGoals(newGoals);
    setUserSavingsGoals(userEmail, newGoals);
  }

  const handleCreateGoal = () => {
    if (newGoal.name && newGoal.target && newGoal.category) {
      const newGoalObj = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.target),
        currentAmount: 0,
        currency: user.currency || 'USD',
        dueDate: newGoal.dueDate,
        category: newGoal.category
      };
      const updated = [...goals, newGoalObj];
      updateGoals(updated);
      toast({
        title: 'Savings Goal Created!',
        description: `${t('savings.goalCreated', { name: newGoal.name })}`,
      });
      setNewGoal({ name: '', target: '', category: '', dueDate: '' });
    }
  };

  const handleDeposit = () => {
    if (depositAmount && selectedGoal) {
      const amt = parseFloat(depositAmount);
      if (amt > 0) {
        const updated = goals.map(g => g.id === selectedGoal.id ? { ...g, currentAmount: g.currentAmount + amt } : g);
        updateGoals(updated);

        const user = getAuthUser();
        if (user && user.email) {
          const newBalance = (user.balance || 0) - amt;
          const updatedUser = { ...user, balance: newBalance };
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
          setUserBalance(newBalance);
          // Dispatch custom event for real-time sync
          window.dispatchEvent(new Event('wallet-balance-updated'));
        }
        toast({
          title: 'Money Saved!',
          description: `${t('savings.moneySaved', { amount: formatCurrency(amt), goalName: selectedGoal.name })}`,
        });
        setDepositAmount('');
        setShowAddMoney(false);
        setSelectedGoal(null);
      }
    }
  };

  const handleEditGoal = () => {
    if (editGoalData && editGoalData.name && editGoalData.targetAmount && editGoalData.category) {
      const updated = goals.map(g => g.id === editGoalData.id ? { ...g, ...editGoalData } : g);
      updateGoals(updated);
      toast({
        title: 'Goal Updated!',
        description: `${t('savings.goalUpdated', { name: editGoalData.name })}`,
      });
      setShowEditGoal(false);
      setEditGoalData(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home':
        return <Home className="h-5 w-5" />;
      case 'education':
        return <GraduationCap className="h-5 w-5" />;
      case 'emergency':
        return <Heart className="h-5 w-5" />;
      case 'business':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'home':
        return 'text-blue-500';
      case 'education':
        return 'text-green-500';
      case 'emergency':
        return 'text-red-500';
      case 'business':
        return 'text-purple-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('savings.title')}</h1>
          <p className="text-muted-foreground">{t('savings.manageSavings')}</p>
        </div>
      </div>

      {/* Overview Card */}
      <Card
        className="rounded-2xl shadow-lg border border-primary/30 relative transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary/60 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(120,132,255,0.12) 0%, rgba(0,212,255,0.10) 100%)',
          overflow: 'hidden',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)' }} />
        <CardContent className="p-8 text-foreground">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground/80">{t('savings.totalSaved')}</p>
              <h2 className="text-3xl font-bold text-foreground drop-shadow">{formatCurrency(totalSaved)}</h2>
              <p className="text-sm text-foreground/80">{t('savings.ofTarget')} {formatCurrency(totalTarget)}</p>
            </div>
            <PiggyBank className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('savings.overallProgress')}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">{t('savings.myGoals')}</TabsTrigger>
          <TabsTrigger value="save">{t('savings.saveMoney')}</TabsTrigger>
          <TabsTrigger value="create">{t('savings.createGoal')}</TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const timeLeft = Math.ceil((new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={goal.id} className="overflow-hidden rounded-2xl shadow-md border border-border bg-background/80 transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-primary/60">
                <CardContent className="p-6 text-foreground">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{t(goal.name)}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{timeLeft > 0 ? `${timeLeft} ${t('savings.daysLeft')}` : `${t('savings.overdue')}`}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={progress >= 100 ? 'default' : 'secondary'}>
                      {Math.round(progress)}% {t('savings.complete')}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{t('savings.progress')}</span>
                      <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('savings.remaining')}</p>
                        <p className="font-bold text-primary">{formatCurrency(goal.targetAmount - goal.currentAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('savings.monthlyNeeded')}</p>
                        <p className="font-bold text-warning">
                          {timeLeft > 0 ? formatCurrency(Math.ceil((goal.targetAmount - goal.currentAmount) / (timeLeft / 30))) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1 rounded-lg border-primary/30 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/60" onClick={() => { setSelectedGoal(goal); setShowAddMoney(true); }}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {t('savings.addMoney')}
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60" onClick={() => { setEditGoalData({ ...goal }); setShowEditGoal(true); }}>{t('savings.editGoal')}</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Save Money Tab */}
        <TabsContent value="save">
          <Card className="rounded-2xl shadow bg-background/80">
            <CardHeader>
              <CardTitle>{t('savings.quickSave')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground">
              <div>
                <Label htmlFor="deposit-amount">{t('savings.amountToSave')}</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {t('wallet.availableBalance')}: {formatCurrency(userBalance)}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">{t('savings.quickSaveOptions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setDepositAmount(amount.toString())}
                      className="h-16 flex-col rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60"
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">{t('savings.chooseSavingsGoal')}</h3>
                <div className="space-y-2">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors ${selectedGoal && selectedGoal.id === goal.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getCategoryColor(goal.category)}`}>{getCategoryIcon(goal.category)}</div>
                          <span className="font-medium">{t(goal.name)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      {/* Show preview of after-save amount if this goal is selected and amount is entered */}
                      {selectedGoal && selectedGoal.id === goal.id && depositAmount && parseFloat(depositAmount) > 0 && (
                        <div className="mt-2 text-sm">
                          <span>Current: {formatCurrency(goal.currentAmount)} &rarr; </span>
                          <span className="font-bold text-primary">After Save: {formatCurrency(goal.currentAmount + parseFloat(depositAmount))}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleDeposit} className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg focus:ring-2 focus:ring-primary/60" disabled={!depositAmount || !selectedGoal}>
                <PiggyBank className="h-4 w-4 mr-2" />
                {t('savings.saveAmount', { amount: depositAmount || '0' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Goal Tab */}
        <TabsContent value="create">
          <Card className="rounded-2xl shadow bg-background/80">
            <CardHeader>
              <CardTitle>{t('savings.createNewSavingsGoal')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground">
              <div>
                <Label htmlFor="goal-name">{t('savings.goalName')}</Label>
                <Input
                  id="goal-name"
                  placeholder={t('savings.goalNamePlaceholder')}
                  className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="goal-target">{t('savings.targetAmount')}</Label>
                <Input
                  id="goal-target"
                  type="number"
                  placeholder="0.00"
                  className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="goal-category">{t('savings.category')}</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('savings.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        {t('savings.emergencyFund')}
                      </div>
                    </SelectItem>
                    <SelectItem value="home">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-500" />
                        {t('savings.homeProperty')}
                      </div>
                    </SelectItem>
                    <SelectItem value="education">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        {t('savings.education')}
                      </div>
                    </SelectItem>
                    <SelectItem value="business">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        {t('savings.business')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal-date">{t('savings.targetDate')}</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                  className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t('savings.smartSavingsTips')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('savings.smartSavingsTip1')}</li>
                  <li>• {t('savings.smartSavingsTip2')}</li>
                  <li>• {t('savings.smartSavingsTip3')}</li>
                  <li>• {t('savings.smartSavingsTip4')}</li>
                </ul>
              </div>

              <Button
                onClick={handleCreateGoal}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg focus:ring-2 focus:ring-primary/60"
                disabled={!newGoal.name || !newGoal.target || !newGoal.category}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('savings.createSavingsGoal')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
            {/* Add Money Dialog */}
            <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
              <DialogContent className="rounded-2xl shadow-2xl bg-white/90 dark:bg-black/80 backdrop-blur-lg border border-primary/20">
                <DialogHeader>
                  <DialogTitle>{t('savings.addMoney')}</DialogTitle>
                  <DialogDescription>
                    {selectedGoal && <div className="mb-2 font-medium">{selectedGoal.name}</div>}
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="mb-4 rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60"
                    />
                    <Button onClick={handleDeposit} className="rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg focus:ring-2 focus:ring-primary/60" disabled={!depositAmount || parseFloat(depositAmount) <= 0}>
                      {t('savings.addMoney')}
                    </Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            {/* Edit Goal Dialog */}
            <Dialog open={showEditGoal} onOpenChange={setShowEditGoal}>
              <DialogContent className="rounded-2xl shadow-2xl bg-white/90 dark:bg-black/80 backdrop-blur-lg border border-primary/20">
                <DialogHeader>
                  <DialogTitle>{t('savings.editGoal')}</DialogTitle>
                  <DialogDescription>
                    {editGoalData && (
                      <div className="space-y-3">
                        <Label>{t('savings.goalName')}</Label>
                        <Input value={editGoalData.name} onChange={e => setEditGoalData({ ...editGoalData, name: e.target.value })} className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60" />
                        <Label>{t('savings.targetAmount')}</Label>
                        <Input type="number" value={editGoalData.targetAmount} onChange={e => setEditGoalData({ ...editGoalData, targetAmount: parseFloat(e.target.value) })} className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60" />
                        <Label>{t('savings.category')}</Label>
                        <Select value={editGoalData.category} onValueChange={value => setEditGoalData({ ...editGoalData, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('savings.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">{t('savings.emergencyFund')}</SelectItem>
                            <SelectItem value="home">{t('savings.homeProperty')}</SelectItem>
                            <SelectItem value="education">{t('savings.education')}</SelectItem>
                            <SelectItem value="business">{t('savings.business')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Label>{t('savings.targetDate')}</Label>
                        <Input type="date" value={editGoalData.dueDate} onChange={e => setEditGoalData({ ...editGoalData, dueDate: e.target.value })} className="rounded-lg border-primary/30 shadow-sm focus:ring-2 focus:ring-primary/60" />
                        <Button onClick={handleEditGoal} className="rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg focus:ring-2 focus:ring-primary/60">Save</Button>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

    </div>
  );
};

export default Savings;