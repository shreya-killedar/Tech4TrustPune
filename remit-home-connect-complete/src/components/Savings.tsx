import { useState } from 'react';
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

const Savings = () => {
  const { t } = useTranslation();
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    category: '',
    dueDate: ''
  });
  const [depositAmount, setDepositAmount] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  const handleCreateGoal = () => {
    if (newGoal.name && newGoal.target && newGoal.category) {
      toast({
        title: "Savings Goal Created!",
        description: `Your goal "${newGoal.name}" has been created successfully`,
      });
      setNewGoal({ name: '', target: '', category: '', dueDate: '' });
    }
  };

  const handleDeposit = () => {
    if (depositAmount) {
      toast({
        title: "Money Saved!",
        description: `$${depositAmount} added to your savings`,
      });
      setDepositAmount('');
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
      <Card className="bg-warning text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/80">{t('savings.totalSaved')}</p>
              <h2 className="text-3xl font-bold">${totalSaved.toLocaleString()}</h2>
              <p className="text-sm text-white/80">{t('savings.ofTarget')}</p>
            </div>
            <PiggyBank className="h-12 w-12 text-white/80" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('savings.overallProgress')}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
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
          {savingsGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const timeLeft = Math.ceil((new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={goal.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{goal.name}</h3>
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
                      <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('savings.remaining')}</p>
                        <p className="font-bold text-primary">${(goal.targetAmount - goal.currentAmount).toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('savings.monthlyNeeded')}</p>
                        <p className="font-bold text-warning">
                          ${Math.ceil((goal.targetAmount - goal.currentAmount) / (timeLeft / 30)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {t('savings.addMoney')}
                    </Button>
                    <Button variant="outline" size="sm">{t('savings.editGoal')}</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Save Money Tab */}
        <TabsContent value="save">
          <Card>
            <CardHeader>
              <CardTitle>{t('savings.quickSave')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="deposit-amount">{t('savings.amountToSave')}</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">{t('savings.quickSaveOptions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setDepositAmount(amount.toString())}
                      className="h-16 flex-col"
                    >
                      <DollarSign className="h-5 w-5 mb-1" />
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">{t('savings.chooseSavingsGoal')}</h3>
                <div className="space-y-2">
                  {savingsGoals.map((goal) => (
                    <div key={goal.id} className="p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                            {getCategoryIcon(goal.category)}
                          </div>
                          <span className="font-medium">{goal.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleDeposit} className="w-full" disabled={!depositAmount}>
                <PiggyBank className="h-4 w-4 mr-2" />
                {t('savings.saveAmount', { amount: depositAmount || '0' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Goal Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{t('savings.createNewSavingsGoal')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="goal-name">{t('savings.goalName')}</Label>
                <Input
                  id="goal-name"
                  placeholder={t('savings.goalNamePlaceholder')}
                  className="placeholder-black"
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
                  className="placeholder-black"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="goal-category">{t('savings.category')}</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
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
                className="w-full"
                disabled={!newGoal.name || !newGoal.target || !newGoal.category}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('savings.createSavingsGoal')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Savings;