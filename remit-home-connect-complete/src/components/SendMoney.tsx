import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, ArrowLeft, CreditCard, Banknote, Clock, Shield, CheckCircle } from 'lucide-react';
import { countries, exchangeRates } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function getRecipients(userEmail: string) {
  return JSON.parse(localStorage.getItem(`recipients_${userEmail}`) || '[]');
}
function saveRecipients(userEmail: string, recipients: any[]) {
  localStorage.setItem(`recipients_${userEmail}`, JSON.stringify(recipients));
}
function getAuthUser() {
  return JSON.parse(localStorage.getItem('auth_user') || '{}');
}

const SendMoney = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipient: '',
    country: '',
    amount: '',
    purpose: '',
    paymentMethod: ''
  });
  const [showAddNew, setShowAddNew] = useState(false);
  const [newRecipient, setNewRecipient] = useState({ name: '', account: '' });
  const [recipients, setRecipients] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = getAuthUser();
  const [userCurrency, setUserCurrency] = useState(user.currency || 'USD');
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return user.balance || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (user.email) {
      setRecipients(getRecipients(user.email));
    }
    // Listen for wallet-balance-updated event for real-time sync
    const onWalletUpdate = () => {
      try {
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        setWalletBalance(user.balance || 0);
      } catch {
        setWalletBalance(0);
      }
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    // Listen for currency-changed event
    const onCurrencyChanged = () => {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      setUserCurrency(user.currency || 'USD');
    };
    window.addEventListener('currency-changed', onCurrencyChanged);
    return () => {
      window.removeEventListener('wallet-balance-updated', onWalletUpdate);
      window.removeEventListener('currency-changed', onCurrencyChanged);
    };
  }, [user.email]);

  // Helper to get exchange rate from userCurrency to destCurrency
  function getExchangeRate(from: string, to: string): number {
    if (from === to) return 1;
    const direct = exchangeRates[`${from}-${to}` as keyof typeof exchangeRates];
    if (direct) return direct;
    // Try via USD as intermediate
    const toUSD = exchangeRates[`${from}-USD` as keyof typeof exchangeRates];
    const fromUSD = exchangeRates[`USD-${to}` as keyof typeof exchangeRates];
    if (toUSD && fromUSD) return toUSD * fromUSD;
    // Try reverse
    const reverse = exchangeRates[`${to}-${from}` as keyof typeof exchangeRates];
    if (reverse) return 1 / reverse;
    return 0;
  }

  const selectedCountry = countries.find(c => c.code === formData.country);
  const destCurrency = selectedCountry ? selectedCountry.currency : userCurrency;
  const exchangeRate = selectedCountry ? getExchangeRate(userCurrency, destCurrency) : 0;
  const convertedAmount = parseFloat(formData.amount) * exchangeRate;
  const transferFee = parseFloat(formData.amount) * 0.015; // 1.5% fee
  const totalAmount = parseFloat(formData.amount) + transferFee;

  function saveTransaction(userEmail: string, tx: any) {
    const key = `transactions_${userEmail}`;
    const txs = JSON.parse(localStorage.getItem(key) || '[]');
    txs.unshift(tx);
    localStorage.setItem(key, JSON.stringify(txs));
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSend = () => {
    const now = new Date();
    saveTransaction(user.email, {
      id: Date.now(),
      type: 'send',
      amount: parseFloat(formData.amount),
      currency: userCurrency,
      recipient: formData.recipient,
      recipientCountry: selectedCountry?.name,
      status: 'completed',
      date: now.toISOString().slice(0, 10),
      fee: transferFee,
      exchangeRate: exchangeRate
    });
    // Deduct from user balance in localStorage
    const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
    const newBalance = (authUser.balance || 0) - totalAmount;
    const updatedUser = { ...authUser, balance: newBalance };
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    toast({
      title: t('sendMoney.moneySentSuccess'),
      description: `${userCurrency} ${formData.amount} ${t('sendMoney.sentTo')} ${formData.recipient} ${t('sendMoney.in')} ${selectedCountry?.name}`,
    });
    navigate('/dashboard');
  };

  const handleAddRecipient = () => {
    if (!newRecipient.name || !newRecipient.account) return;
    const updated = [...recipients, newRecipient];
    setRecipients(updated);
    saveRecipients(user.email, updated);
    setFormData({ ...formData, recipient: newRecipient.name });
    setShowAddNew(false);
    setNewRecipient({ name: '', account: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('sendMoney.tab')}</h1>
          <p className="text-muted-foreground">{t('sendMoney.secureTransfer')}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > stepNum ? <CheckCircle className="h-4 w-4" /> : stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-8 h-0.5 mx-2 ${step > stepNum ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Recipient Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sendMoney.recipientDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipient">{t('sendMoney.recipient')}</Label>
              <Select
                value={formData.recipient}
                onValueChange={value => setFormData({ ...formData, recipient: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('sendMoney.selectRecipient')} />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((r) => (
                    <SelectItem key={r.account} value={r.name}>{r.name} ({t('sendMoney.acc')}: {r.account})</SelectItem>
                  ))}
                  <SelectItem value="__add_new__">
                    <span className="text-blue-600">{t('sendMoney.addNewRecipient')}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.recipient === '__add_new__' && (
                <div className="mt-2 space-y-2 border p-3 rounded bg-muted/30">
                  <Input
                    placeholder={t('sendMoney.recipientName')}
                    className="placeholder-white text-white bg-card"
                    value={newRecipient.name}
                    onChange={e => setNewRecipient({ ...newRecipient, name: e.target.value })}
                  />
                  <Input
                    placeholder={t('sendMoney.accountNumber')}
                    className="placeholder-white text-white bg-card"
                    value={newRecipient.account}
                    onChange={e => setNewRecipient({ ...newRecipient, account: e.target.value })}
                  />
                  <Button onClick={handleAddRecipient} className="w-full">{t('sendMoney.saveRecipient')}</Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="country">{t('sendMoney.country')}</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sendMoney.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <Badge variant="secondary" className="text-xs">{country.currency}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">{t('sendMoney.amount')}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={t('sendMoney.amountPlaceholder')}
                className="placeholder-white text-white bg-card"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
              {selectedCountry && formData.amount && (
                <>
                  {exchangeRate === 0 && userCurrency !== destCurrency ? (
                    <p className="text-sm text-red-500 mt-1">{t('sendMoney.conversionUnavailable')}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('sendMoney.youWillReceive')} {convertedAmount.toLocaleString()} {selectedCountry.currency}
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <Label htmlFor="purpose">{t('sendMoney.purpose')}</Label>
              <Select value={formData.purpose} onValueChange={(value) => setFormData({...formData, purpose: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sendMoney.selectPurpose')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family-support">{t('sendMoney.familySupport')}</SelectItem>
                  <SelectItem value="education">{t('sendMoney.education')}</SelectItem>
                  <SelectItem value="medical">{t('sendMoney.medical')}</SelectItem>
                  <SelectItem value="business">{t('sendMoney.business')}</SelectItem>
                  <SelectItem value="other">{t('sendMoney.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleNext} 
              className="w-full" 
              disabled={!formData.recipient || !formData.country || !formData.amount || !formData.purpose || (formData.recipient === '__add_new__' && (!newRecipient.name || !newRecipient.account))}
            >
              {t('sendMoney.continue')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment Method */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sendMoney.paymentMethod')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData({...formData, paymentMethod: 'wallet'})}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{t('sendMoney.walletBalance')}</p>
                    <p className="text-sm text-muted-foreground">{t('sendMoney.available')}: {userCurrency} {walletBalance.toLocaleString()}</p>
                  </div>
                  <Badge variant="default">{t('sendMoney.instant')}</Badge>
                </div>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData({...formData, paymentMethod: 'bank'})}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{t('sendMoney.bankAccount')}</p>
                    <p className="text-sm text-muted-foreground">••••3456</p>
                  </div>
                  <Badge variant="secondary">{t('sendMoney.bankTransfer')}</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">{t('sendMoney.back')}</Button>
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={!formData.paymentMethod}
              >
                {t('sendMoney.continue')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sendMoney.reviewTransfer')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transfer Summary */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('sendMoney.to')}</span>
                <div className="text-right">
                  <p className="font-medium">{formData.recipient}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {selectedCountry?.flag} {selectedCountry?.name}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('sendMoney.youSend')}</span>
                <p className="font-medium">{userCurrency} {parseFloat(formData.amount).toLocaleString()}</p>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('sendMoney.transferFee')}</span>
                <p className="font-medium">{userCurrency} {transferFee.toFixed(2)}</p>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('sendMoney.totalAmount')}</span>
                <p className="font-bold text-lg">{userCurrency} {totalAmount.toFixed(2)}</p>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('sendMoney.recipientGets')}</span>
                <p className="font-bold text-lg text-success">
                  {convertedAmount.toLocaleString()} {selectedCountry?.currency}
                </p>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('sendMoney.exchangeRate')}</span>
                <p className="font-medium">1 {userCurrency} = {exchangeRate} {selectedCountry?.currency}</p>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">{t('sendMoney.secureTransfer')}</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{t('sendMoney.deliveredInMinutes')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>{t('sendMoney.bankLevelSecurity')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>{t('sendMoney.guaranteedDelivery')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">{t('sendMoney.back')}</Button>
              <Button onClick={handleSend} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {t('sendMoney.sendMoney')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SendMoney;