import { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { insuranceOptions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Insurance = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('my-insurance');
  const [activeInsurance, setActiveInsurance] = useState(insuranceOptions.filter(i => i.isActive));
  const [allInsurance] = useState(insuranceOptions);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleToggleInsurance = (id: string) => {
    setActiveInsurance(prev => 
      prev.map(insurance => 
        insurance.id === id 
          ? { ...insurance, isActive: !insurance.isActive }
          : insurance
      )
    );
    
    const insurance = activeInsurance.find(i => i.id === id);
    if (insurance) {
      toast({
        title: insurance.isActive ? "Insurance Cancelled" : "Insurance Activated",
        description: `${insurance.name} has been ${insurance.isActive ? 'cancelled' : 'activated'}`,
      });
    }
  };

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Heart className="h-6 w-6" />;
      case 'life':
        return <UserCheck className="h-6 w-6" />;
      case 'accident':
        return <Zap className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  const getInsuranceColor = (type: string) => {
    switch (type) {
      case 'health':
        return 'text-green-500';
      case 'life':
        return 'text-blue-500';
      case 'accident':
        return 'text-orange-500';
      default:
        return 'text-primary';
    }
  };

  const totalMonthlyPremium = activeInsurance
    .filter(insurance => insurance.isActive)
    .reduce((sum, insurance) => sum + insurance.monthlyPremium, 0);

  const totalCoverage = activeInsurance
    .filter(insurance => insurance.isActive)
    .reduce((sum, insurance) => sum + insurance.coverage, 0);

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
      <Card className="bg-success text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/80">{t('insurance.totalProtection')}</p>
              <h2 className="text-3xl font-bold">${totalCoverage.toLocaleString()}</h2>
              <p className="text-sm text-white/80">{t('insurance.monthlyPremium')}: ${totalMonthlyPremium}/month</p>
            </div>
            <Shield className="h-12 w-12 text-white/80" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-white/80">{t('insurance.activePolicies')}</p>
              <p className="font-bold text-lg">
                {activeInsurance.filter(i => i.isActive).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/80">{t('insurance.youSave')}</p>
              <p className="font-bold text-lg">
                {activeInsurance.filter(i => i.isActive).length > 1 ? '15%' : '0%'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-insurance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-insurance">{t('insurance.myInsurance')}</TabsTrigger>
          <TabsTrigger value="explore">{t('insurance.explorePlans')}</TabsTrigger>
        </TabsList>

        {/* My Insurance Tab */}
        <TabsContent value="my-insurance" className="space-y-4">
          {activeInsurance.map((insurance) => (
            <Card key={insurance.id} className={`transition-all ${insurance.isActive ? 'ring-2 ring-primary/20' : 'opacity-75'}`}>
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
                    <p className="text-sm text-muted-foreground">{t('insurance.monthlyPremium')}</p>
                    <p className="font-bold text-lg">${insurance.monthlyPremium}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm text-muted-foreground">{t('insurance.coverageAmount')}</p>
                    <p className="font-bold text-lg">${insurance.coverage.toLocaleString()}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-muted-foreground">{t('insurance.beneficiaries')}</p>
                    <p className="font-bold text-lg">{t('insurance.family')}</p>
                  </div>
                </div>

                {insurance.isActive && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">{t('insurance.youreProtected')}</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This policy is active and you're covered. Claims can be filed 24/7 through our app.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1">{t('insurance.viewDetails')}</Button>
                  <Button variant="outline" className="flex-1">{t('insurance.fileClaim')}</Button>
                </div>
              </CardContent>
            </Card>
          ))}

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
        <TabsContent value="explore" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Health Insurance Plans */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('insurance.premiumHealth')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('insurance.comprehensiveCoverage')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">$45</p>
                  <p className="text-sm text-muted-foreground">{t('insurance.perMonth')}</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.coverage25000')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.worldwideCoverage')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.dentalVisionIncluded')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.mentalHealthSupport')}
                  </li>
                </ul>
                
                <Button className="w-full">{t('insurance.selectPlan')}</Button>
              </CardContent>
            </Card>

            {/* Life Insurance Plans */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('insurance.familyLife')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('insurance.protectYourLovedOnes')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">$30</p>
                  <p className="text-sm text-muted-foreground">{t('insurance.perMonth')}</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.coverage100000')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.accidentalDeathBenefit')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.noWaitingPeriod')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.internationalClaims')}
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full">{t('insurance.selectPlan')}</Button>
              </CardContent>
            </Card>

            {/* Accident Insurance Plans */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('insurance.accidentShield')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('insurance.workplaceProtection')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">$20</p>
                  <p className="text-sm text-muted-foreground">{t('insurance.perMonth')}</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.coverage50000')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.workplaceAccidents')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.disabilityBenefits')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('insurance.claimSupport247')}
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full">{t('insurance.selectPlan')}</Button>
              </CardContent>
            </Card>
          </div>

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
      </Tabs>
    </div>
  );
};

export default Insurance;