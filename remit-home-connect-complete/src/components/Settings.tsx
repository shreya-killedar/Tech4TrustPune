import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  User,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Smartphone,
  Camera,
  LogOut
} from 'lucide-react';
import { sampleUser, languages, countries } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function getAuthUser() {
  return JSON.parse(localStorage.getItem('auth_user') || '{}');
}

function setAuthUser(user: any) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

const Settings = () => {
  const { t } = useTranslation();
  const authUser = getAuthUser();
  const [profile, setProfile] = useState({
    name: authUser.name || sampleUser.name,
    email: authUser.email || '',
    phone: authUser.phone || '',
    country: authUser.country || '',
    currency: authUser.currency || 'USD',
    language: authUser.language || 'en'
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    promotionalEmails: false
  });

  const [security, setSecurity] = useState({
    biometricLogin: true,
    twoFactorAuth: false,
    loginAlerts: true
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setAuthUser({ ...authUser, ...profile });
    // Listen for wallet-balance-updated event for real-time sync
    const onWalletUpdate = () => {
      const updatedUser = getAuthUser();
      setProfile({
        name: updatedUser.name || sampleUser.name,
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        country: updatedUser.country || '',
        currency: updatedUser.currency || 'USD',
        language: updatedUser.language || 'en'
      });
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    return () => window.removeEventListener('wallet-balance-updated', onWalletUpdate);
  }, [authUser]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const prevCurrency = authUser.currency;
  const handleSaveProfile = () => {
    setAuthUser({ ...authUser, ...profile });
    toast({
      title: t('settings.profileUpdatedTitle'),
      description: t('settings.profileUpdatedDescription'),
    });
    if (prevCurrency !== profile.currency) {
      window.dispatchEvent(new Event('currency-changed'));
    }
    window.location.reload(); // To update top bar/profile everywhere
  };

  const handleSaveNotifications = () => {
    toast({
      title: t('settings.notificationSettingsUpdatedTitle'),
      description: t('settings.notificationSettingsUpdatedDescription'),
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: t('settings.securitySettingsUpdatedTitle'),
      description: t('settings.securitySettingsUpdatedDescription'),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Theme Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{t('settings.theme')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="font-medium">{t('settings.light')}</span>
          <Switch
            checked={theme === 'light'}
            onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
          />
          <span className="font-medium">{t('settings.dark')}</span>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('settings.profileInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                {t('settings.changePhoto')}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">{t('settings.photoHint')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('settings.fullName')}</Label>
              <Input
                id="name"
                placeholder={t('settings.enterFullName')}
                className="placeholder-white text-white bg-card"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="email">{t('settings.emailAddress')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('settings.enterEmailAddress')}
                className="placeholder-white text-white bg-card"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="phone">{t('settings.phoneNumber')}</Label>
              <Input
                id="phone"
                placeholder={t('settings.enterPhoneNumber')}
                className="placeholder-white text-white bg-card"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="country">{t('settings.country')}</Label>
              <Input
                id="country"
                placeholder={t('settings.enterCountry')}
                className="placeholder-white text-white bg-card"
                value={profile.country}
                onChange={(e) => setProfile({...profile, country: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="currency">{t('settings.currency')}</Label>
              <Select value={profile.currency} onValueChange={(value) => setProfile({...profile, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="USD" value="USD">USD - US Dollar</SelectItem>
                  {Array.from(new Set(countries.map(c => c.currency))).filter(cur => cur !== 'USD').map((cur) => {
                    const country = countries.find(c => c.currency === cur);
                    return (
                      <SelectItem key={cur} value={cur}>{cur} - {country?.name || cur}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="language">{t('settings.preferredLanguage')}</Label>
              <Select value={profile.language} onValueChange={(value) => setProfile({...profile, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="w-full md:w-auto">
            {t('settings.saveProfileChanges')}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('settings.securityPrivacy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.biometricLogin')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.biometricLoginHint')}</p>
              </div>
              <Switch
                checked={security.biometricLogin}
                onCheckedChange={(checked) => setSecurity({...security, biometricLogin: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.twoFactorAuth')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.twoFactorAuthHint')}</p>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.loginAlerts')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.loginAlertsHint')}</p>
              </div>
              <Switch
                checked={security.loginAlerts}
                onCheckedChange={(checked) => setSecurity({...security, loginAlerts: checked})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Smartphone className="h-4 w-4 mr-2" />
              {t('settings.changePIN')}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              {t('settings.changePassword')}
            </Button>
          </div>

          <Button onClick={handleSaveSecurity} className="w-full md:w-auto">
            {t('settings.saveSecuritySettings')}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.pushNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.pushNotificationsHint')}</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.emailNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.emailNotificationsHint')}</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.smsNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.smsNotificationsHint')}</p>
              </div>
              <Switch
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.transactionAlerts')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.transactionAlertsHint')}</p>
              </div>
              <Switch
                checked={notifications.transactionAlerts}
                onCheckedChange={(checked) => setNotifications({...notifications, transactionAlerts: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.promotionalEmails')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.promotionalEmailsHint')}</p>
              </div>
              <Switch
                checked={notifications.promotionalEmails}
                onCheckedChange={(checked) => setNotifications({...notifications, promotionalEmails: checked})}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
            {t('settings.saveNotificationSettings')}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('settings.paymentMethods')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4532</p>
                  <p className="text-sm text-muted-foreground">{t('settings.expires')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">{t('settings.edit')}</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Wells Fargo ••••3456</p>
                  <p className="text-sm text-muted-foreground">{t('settings.checkingAccount')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">{t('settings.edit')}</Button>
            </div>
          </div>

          <Button variant="outline" className="w-full">{t('settings.addNewPaymentMethod')}</Button>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.appPreferences')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={profile.currency} onValueChange={(value) => setProfile({...profile, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="USD" value="USD">USD - US Dollar</SelectItem>
                  {Array.from(new Set(countries.map(c => c.currency))).filter(cur => cur !== 'USD').map((cur) => {
                    const country = countries.find(c => c.currency === cur);
                    return (
                      <SelectItem key={cur} value={cur}>{cur} - {country?.name || cur}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">{t('settings.timezone')}</Label>
              <Select defaultValue="EST">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EST">{t('settings.easternTime')}</SelectItem>
                  <SelectItem value="PST">{t('settings.pacificTime')}</SelectItem>
                  <SelectItem value="GMT">{t('settings.greenwichMeanTime')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.accountActions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              {t('settings.downloadAccountData')}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              {t('settings.contactSupport')}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              {t('settings.termsPrivacyPolicy')}
            </Button>
            
            <Separator />
            
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('settings.signOut')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;