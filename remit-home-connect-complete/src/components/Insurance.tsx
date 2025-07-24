import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  ArrowLeft,
  Heart,
  UserCheck,
  Zap,
  CheckCircle,
  Info,
  DollarSign,
  Users,
  Hospital,
  AlertTriangle,
  Bell,
  FileText,
  Globe
} from 'lucide-react';
import { insuranceOptions, countries } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

function getAuthUser() {
  return JSON.parse(localStorage.getItem('auth_user') || '{}');
}
function getUserInsurance(email) {
  const data = localStorage.getItem(`insurance_${email}`);
  if (!data) return [];
  return JSON.parse(data);
}
function setUserInsurance(email, policies) {
  localStorage.setItem(`insurance_${email}`, JSON.stringify(policies));
  window.dispatchEvent(new Event('insurance-updated'));
}
function getUserNotifications(email) {
  return JSON.parse(localStorage.getItem(`notifications_${email}`) || '[]');
}
function addUserNotification(email, notification) {
  const notifs = getUserNotifications(email);
  notifs.unshift(notification);
  localStorage.setItem(`notifications_${email}`, JSON.stringify(notifs));
  window.dispatchEvent(new Event('notifications-updated'));
}

// Add claim status and claim history helpers
function getUserClaims(email) {
  return JSON.parse(localStorage.getItem(`claims_${email}`) || '[]');
}
function addUserClaim(email, claim) {
  const claims = getUserClaims(email);
  claims.unshift(claim);
  localStorage.setItem(`claims_${email}`, JSON.stringify(claims));
  window.dispatchEvent(new Event('claims-updated'));
}
function updateClaimStatus(email, claimId, status) {
  const claims = getUserClaims(email).map(c => c.id === claimId ? { ...c, status } : c);
  localStorage.setItem(`claims_${email}`, JSON.stringify(claims));
  window.dispatchEvent(new Event('claims-updated'));
  // Add notification for status change
  addUserNotification(email, {
    id: Date.now(),
    type: 'claim-status',
    claimId,
    status,
    date: new Date().toLocaleString()
  });
}

// Add helpers for expiry and PDF
function getPolicyExpiry(policy) {
  // If no expiry, set to 1 year from activation (date added to policies)
  if (!policy.expiry) {
    const start = policy.activatedAt ? new Date(policy.activatedAt) : new Date();
    start.setFullYear(start.getFullYear() + 1);
    return start.toISOString().slice(0, 10);
  }
  return policy.expiry;
}
function isPolicyExpired(policy) {
  const expiry = getPolicyExpiry(policy);
  return new Date(expiry) < new Date();
}
function downloadSamplePDF(policy) {
  // For demo, just download a static PDF from public folder
  const link = document.createElement('a');
  link.href = '/placeholder.pdf';
  link.download = `${policy.name}-Policy.pdf`;
  link.click();
}

// Add currency conversion helper
function getExchangeRate(from, to) {
  if (from === to) return 1;
  const rates = {
    USD: 1,
    INR: 83.12,
    PHP: 56.25,
    MXN: 17.89,
    BDT: 110.15,
    PKR: 279.50,
    EGP: 30.85,
    NGN: 1150.00,
    VND: 24500.00
  };
  if (rates[from] && rates[to]) return rates[to] / rates[from];
  return 1;
}

const Insurance = () => {
  const { t } = useTranslation();
  const user = getAuthUser();
  const userEmail = user.email || 'guest';
  const userCurrency = user.currency || 'USD';
  // Load from localStorage or fallback to default
  const [policies, setPolicies] = useState(() => getUserInsurance(userEmail) || insuranceOptions);
  const [activeTab, setActiveTab] = useState('my-insurance');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [claimReason, setClaimReason] = useState('');
  const [claimFile, setClaimFile] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [claimSummaryOpen, setClaimSummaryOpen] = useState(false);
  const [claimSummary, setClaimSummary] = useState(null);
  const [claims, setClaims] = useState(() => getUserClaims(userEmail));
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewPolicy, setRenewPolicy] = useState(null);
  const [comparePlans, setComparePlans] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Real-time sync
  useEffect(() => {
    const sync = () => {
      setPolicies(getUserInsurance(userEmail) || insuranceOptions);
    };
    window.addEventListener('insurance-updated', sync);
    return () => window.removeEventListener('insurance-updated', sync);
  }, [userEmail]);

  // Save to localStorage on change
  useEffect(() => {
    setUserInsurance(userEmail, policies);
  }, [policies, userEmail]);

  useEffect(() => {
    // Real-time sync for claims
    const syncClaims = () => setClaims(getUserClaims(userEmail));
    window.addEventListener('claims-updated', syncClaims);
    return () => window.removeEventListener('claims-updated', syncClaims);
  }, [userEmail]);

  // Notification: mark as read
  function markNotificationRead(id) {
    const notifs = getUserNotifications(userEmail).map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(notifs));
    window.dispatchEvent(new Event('notifications-updated'));
  }
  // Notification: actionable (View Claim)
  function viewClaimFromNotif(claimId) {
    setActiveTab('claims');
    // Optionally scroll to claim
  }
  // Simulate push notification for claim approval
  useEffect(() => {
    const handler = () => {
      const notifs = getUserNotifications(userEmail);
      const last = notifs[0];
      if (last && last.type === 'claim-status' && last.status === 'Approved' && !last.pushed) {
        toast({ title: 'Claim Approved', description: 'Your insurance claim was approved!', duration: 6000 });
        last.pushed = true;
        localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(notifs));
      }
    };
    window.addEventListener('notifications-updated', handler);
    return () => window.removeEventListener('notifications-updated', handler);
  }, [userEmail]);

  const handleToggleInsurance = (id) => {
    setPolicies(prev => prev.map(policy =>
      policy.id === id ? { ...policy, isActive: !policy.isActive } : policy
    ));
    const policy = policies.find(i => i.id === id);
    if (policy) {
      toast({
        title: policy.isActive ? 'Insurance Cancelled' : 'Insurance Activated',
        description: `${policy.name} has been ${policy.isActive ? 'cancelled' : 'activated'}`
      });
    }
  };

  const handleSelectPlan = (plan) => {
    setPaymentPlan(plan);
    setPaymentOpen(true);
  };
  const handleConfirmPayment = () => {
    setPaymentOpen(false);
    if (policies.some(p => p.id === paymentPlan.id)) {
      toast({ title: 'Already Added', description: 'You already have this plan.' });
      return;
    }
    setPolicies(prev => [...prev, { ...paymentPlan, isActive: true }]);
    toast({ title: 'Plan Added', description: `${paymentPlan.name} is now active.` });
    setPaymentPlan(null);
  };

  const handleViewDetails = (policy) => {
    setSelectedPolicy(policy);
    setDetailsOpen(true);
  };

  const handleFileClaim = (policy) => {
    setSelectedPolicy(policy);
    setClaimOpen(true);
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    setClaimOpen(false);
    const claim = {
      id: Date.now(),
      policy: selectedPolicy,
      reason: claimReason,
      file: claimFile ? claimFile.name : null,
      date: new Date().toLocaleString(),
      status: 'Pending'
    };
    setClaimSummary(claim);
    setClaimSummaryOpen(true);
    setClaimReason('');
    setClaimFile(null);
    addUserClaim(userEmail, claim);
    addUserNotification(userEmail, {
      id: Date.now(),
      type: 'insurance-claim',
      policy: selectedPolicy?.name,
      date: claim.date,
      reason: claimReason
    });
    toast({
      title: 'Claim Submitted',
      description: `Your claim for ${selectedPolicy?.name} has been submitted.`
    });
  };

  const handleConfirmRenew = () => {
    setRenewOpen(false);
    setPolicies(prev => prev.map(p =>
      p.id === renewPolicy.id
        ? { ...p, expiry: (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })(), activatedAt: new Date().toISOString() }
        : p
    ));
    addUserNotification(userEmail, {
      id: Date.now(),
      type: 'policy-renewal',
      policy: renewPolicy.name,
      date: new Date().toLocaleString()
    });
    toast({ title: 'Policy Renewed', description: `${renewPolicy.name} renewed for 1 year.` });
    setRenewPolicy(null);
  };

  const getInsuranceIcon = (type) => {
    switch (type) {
      case 'health': return <Heart className="h-6 w-6" />;
      case 'life': return <UserCheck className="h-6 w-6" />;
      case 'accident': return <Zap className="h-6 w-6" />;
      default: return <Shield className="h-6 w-6" />;
    }
  };
  const getInsuranceColor = (type) => {
    switch (type) {
      case 'health': return 'text-green-500';
      case 'life': return 'text-blue-500';
      case 'accident': return 'text-orange-500';
      default: return 'text-primary';
    }
  };
  const formatCurrency = (value, currency = userCurrency) => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(value);
  };
  const totalMonthlyPremium = policies.filter(i => i.isActive).reduce((sum, i) => sum + i.monthlyPremium, 0);
  const totalCoverage = policies.filter(i => i.isActive).reduce((sum, i) => sum + i.coverage, 0);

  // Plans for Explore tab (hardcoded for now)
  const explorePlans = [
    {
      id: 'exp1', type: 'health', name: 'Premium Health', monthlyPremium: 45, coverage: 25000, currency: 'USD', isActive: false,
      details: 'Comprehensive health coverage including dental, vision, and mental health support.'
    },
    {
      id: 'exp2', type: 'life', name: 'Family Life', monthlyPremium: 30, coverage: 100000, currency: 'USD', isActive: false,
      details: 'Life insurance with accidental death benefit and international claims.'
    },
    {
      id: 'exp3', type: 'accident', name: 'Accident Shield', monthlyPremium: 20, coverage: 50000, currency: 'USD', isActive: false,
      details: 'Workplace accident protection, disability benefits, and 24/7 claim support.'
    }
  ];

  // Plan comparison logic
  const handleCompareToggle = (plan) => {
    setComparePlans(prev => prev.some(p => p.id === plan.id)
      ? prev.filter(p => p.id !== plan.id)
      : prev.length < 2 ? [...prev, plan] : prev
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('insurance.title')}</h1>
          <p className="text-muted-foreground">{t('insurance.manageInsurance')}</p>
        </div>
      </div>

      {/* Overview Card */}
      <Card
        className="rounded-2xl shadow-lg border border-border relative mb-8 transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary/60"
        style={{
          background: 'linear-gradient(135deg, rgba(120,132,255,0.12) 0%, rgba(0,212,255,0.10) 100%)',
          overflow: 'hidden',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)'}} />
        <CardContent className="p-6 text-foreground">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground">{t('insurance.totalProtection')}</p>
              <h2 className="text-3xl font-bold text-foreground">{formatCurrency(totalCoverage)}</h2>
              <p className="text-sm text-foreground">{t('insurance.monthlyPremium')}: {formatCurrency(totalMonthlyPremium)}/month</p>
            </div>
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-foreground">{t('insurance.activePolicies')}</p>
              <p className="font-bold text-lg">{policies.filter(i => i.isActive).length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-foreground">{t('insurance.youSave')}</p>
              <p className="font-bold text-lg">{policies.filter(i => i.isActive).length > 1 ? '15%' : '0%'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-insurance" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 animate-fadeIn">
          <TabsTrigger value="my-insurance">{t('insurance.myInsurance')}</TabsTrigger>
          <TabsTrigger value="explore">{t('insurance.explorePlans')}</TabsTrigger>
          <TabsTrigger value="claims">{t('insurance.claimHistory')}</TabsTrigger>
        </TabsList>

        {/* My Insurance Tab */}
        <TabsContent value="my-insurance" className="space-y-4">
          {policies.map((insurance) => {
            const expiry = getPolicyExpiry(insurance);
            const expired = isPolicyExpired(insurance);
            return (
              <Card key={insurance.id} className={`rounded-xl shadow-md border border-border transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-primary/60 ${insurance.isActive ? 'ring-2 ring-primary/20' : 'opacity-75'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center ${getInsuranceColor(insurance.type)}`}>
                        {getInsuranceIcon(insurance.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{insurance.name}</h3>
                        <p className="text-muted-foreground capitalize">{insurance.type} Insurance</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={insurance.isActive ? 'default' : 'secondary'}>
                            {insurance.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {insurance.isActive && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={insurance.isActive}
                      onCheckedChange={() => handleToggleInsurance(insurance.id)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Monthly Premium</p>
                      <p className="font-bold text-lg">{formatCurrency(insurance.monthlyPremium)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-success" />
                      <p className="text-sm text-muted-foreground">Coverage Amount</p>
                      <p className="font-bold text-lg">{formatCurrency(insurance.coverage)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm text-muted-foreground">Beneficiaries</p>
                      <p className="font-bold text-lg">Family</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <span className="block text-xs text-muted-foreground mb-1">Expiry Date</span>
                      <span className={`font-bold ${expired ? 'text-red-600' : ''}`}>{expiry}</span>
                      {expired && (
                        <Button size="sm" className="mt-2" onClick={() => { setRenewPolicy(insurance); setRenewOpen(true); }}>Renew</Button>
                      )}
                    </div>
                  </div>
                  {insurance.isActive && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">You're Protected</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        This policy is active and you're covered. Claims can be filed 24/7 through our app.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Dialog open={detailsOpen && selectedPolicy?.id === insurance.id} onOpenChange={v => { setDetailsOpen(v); if (!v) setSelectedPolicy(null); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/60" onClick={() => handleViewDetails(insurance)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{selectedPolicy?.name} Details</DialogTitle>
                          <DialogDescription>
                            <div className="mt-2 space-y-2">
                              <div><b>Type:</b> {selectedPolicy?.type}</div>
                              <div><b>Monthly Premium:</b> {formatCurrency(selectedPolicy?.monthlyPremium)}</div>
                              <div><b>Coverage:</b> {formatCurrency(selectedPolicy?.coverage)}</div>
                              <div><b>Status:</b> {selectedPolicy?.isActive ? 'Active' : 'Inactive'}</div>
                              <div><b>Currency:</b> {userCurrency}</div>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={claimOpen && selectedPolicy?.id === insurance.id} onOpenChange={v => { setClaimOpen(v); if (!v) setSelectedPolicy(null); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" disabled={!insurance.isActive} onClick={() => handleFileClaim(insurance)}>
                          File Claim
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>File Claim - {selectedPolicy?.name}</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for your claim. Our team will review and contact you soon.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitClaim} className="space-y-4 mt-2">
                          <Input
                            placeholder="Reason for claim"
                            value={claimReason}
                            onChange={e => setClaimReason(e.target.value)}
                            required
                          />
                          <input
                            type="file"
                            onChange={e => setClaimFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500"
                          />
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Submit Claim</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" aria-label="Download Policy PDF" onClick={() => downloadSamplePDF(insurance)} className="ml-2 rounded-full hover:bg-primary/10">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {/* Benefits Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t('insurance.whyInsuranceMatters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">{t('insurance.healthInsuranceBenefits')}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.emergencyMedicalCoverage')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.noPreExistingConditionWaitingPeriod')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.preventiveCareIncluded')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.telemedicineSupport')}
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">{t('insurance.lifeInsuranceBenefits')}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.financialProtectionForFamily')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.internationalBeneficiarySupport')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.noMedicalExamRequired')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t('insurance.coverageWhileTraveling')}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Explore Plans Tab */}
        <TabsContent value="explore" className="space-y-4 animate-fadeInUp">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {explorePlans.map(plan => {
              const planCurrency = plan.currency || 'USD';
              const conversion = getExchangeRate(planCurrency, userCurrency);
              const convertedPremium = plan.monthlyPremium * conversion;
              const convertedCoverage = plan.coverage * conversion;
              return (
                <Card key={plan.id} className="relative overflow-hidden flex flex-col h-full justify-between">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${plan.type === 'health' ? 'bg-green-500' : plan.type === 'life' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                  <CardHeader className="flex flex-row items-center gap-3 pb-0">
                    <div className={`w-12 h-12 rounded-full ${plan.type === 'health' ? 'bg-green-100 dark:bg-green-950' : plan.type === 'life' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-orange-100 dark:bg-orange-950'} flex items-center justify-center`}>
                      {getInsuranceIcon(plan.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.details}</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Download Policy PDF" onClick={() => downloadSamplePDF(plan)} className="rounded-full hover:bg-primary/10">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between space-y-4 pt-2">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${plan.type === 'health' ? 'text-green-600' : plan.type === 'life' ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(convertedPremium)}</p>
                      <p className="text-xs text-muted-foreground">({formatCurrency(plan.monthlyPremium, planCurrency)})</p>
                      <p className="text-sm text-muted-foreground">/month</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {formatCurrency(convertedCoverage)} coverage
                      </li>
                    </ul>
                    <div className="flex gap-2 mt-auto">
                      <Button className="flex-1" onClick={() => handleSelectPlan(plan)} aria-label="Select Plan">Select Plan</Button>
                      <Button className={`flex-1 ${comparePlans.some(p => p.id === plan.id) ? 'bg-primary text-white' : ''}`} onClick={() => handleCompareToggle(plan)} aria-label="Compare Plan">{comparePlans.some(p => p.id === plan.id) ? 'Remove' : 'Compare'}</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {/* Plan Comparison Modal */}
          <Dialog open={compareOpen || comparePlans.length === 2} onOpenChange={setCompareOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compare Plans</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparePlans.map(plan => (
                  <Card key={plan.id} className="p-4">
                    <div className="font-bold text-lg mb-2">{plan.name}</div>
                    <div>Type: {plan.type}</div>
                    <div>Premium: {formatCurrency(plan.monthlyPremium, plan.currency)}</div>
                    <div>Coverage: {formatCurrency(plan.coverage, plan.currency)}</div>
                    <div>Details: {plan.details}</div>
                  </Card>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => setComparePlans([])}>Clear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Insurance Education */}
          <Card>
            <CardHeader>
              <CardTitle>{t('insurance.insuranceMadeSimple')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Hospital className="h-8 w-8 mx-auto text-blue-500" />
                  <h4 className="font-medium">{t('insurance.quickClaims')}</h4>
                  <p className="text-sm text-muted-foreground">{t('insurance.fileClaimsInstantly')}</p>
                </div>

                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 mx-auto text-green-500" />
                  <h4 className="font-medium">{t('insurance.familyCoverage')}</h4>
                  <p className="text-sm text-muted-foreground">{t('insurance.extendProtectionToFamilyMembers')}</p>
                </div>

                <div className="text-center space-y-2">
                  <Shield className="h-8 w-8 mx-auto text-purple-500" />
                  <h4 className="font-medium">{t('insurance.noHiddenFees')}</h4>
                  <p className="text-sm text-muted-foreground">{t('insurance.transparentPricing')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Claim History Tab */}
        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('insurance.claimHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {claims.length === 0 && <div className="text-muted-foreground">No claims yet.</div>}
              <div className="space-y-4">
                {claims.map(claim => (
                  <div key={claim.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted/30">
                    <div>
                      <div className="font-bold text-lg">{claim.policy?.name}</div>
                      <div className="text-sm text-muted-foreground">{claim.date}</div>
                      <div className="text-sm">Reason: {claim.reason}</div>
                      <div className="text-sm">File: {claim.file || 'None'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${claim.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : claim.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{claim.status}</span>
                      {/* Admin simulation: allow status change for demo */}
                      {claim.status === 'Pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateClaimStatus(userEmail, claim.id, 'Approved')}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => updateClaimStatus(userEmail, claim.id, 'Rejected')}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Payment Modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay for {paymentPlan?.name}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                {getInsuranceIcon(paymentPlan?.type)}
                <div>
                  <div className="font-bold text-lg">{paymentPlan?.name}</div>
                  <div className="text-muted-foreground">{paymentPlan?.details}</div>
                  <div className="mt-2">Monthly Premium: <b>{formatCurrency(paymentPlan?.monthlyPremium)}</b></div>
                  <div>Coverage: <b>{formatCurrency(paymentPlan?.coverage)}</b></div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button className="w-40" onClick={handleConfirmPayment}>Pay & Activate</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Claim Summary Modal */}
      <Dialog open={claimSummaryOpen} onOpenChange={setClaimSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Submitted</DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-2">
                <div><b>Policy:</b> {claimSummary?.policy?.name}</div>
                <div><b>Reason:</b> {claimSummary?.reason}</div>
                <div><b>File:</b> {claimSummary?.file || 'None'}</div>
                <div><b>Date:</b> {claimSummary?.date}</div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Policy Renewal Modal */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Policy</DialogTitle>
            <DialogDescription>
              Renew <b>{renewPolicy?.name}</b> for 1 year for {formatCurrency(renewPolicy?.monthlyPremium)} per month?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-center">
            <Button className="w-40" onClick={handleConfirmRenew}>Pay & Renew</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Insurance;