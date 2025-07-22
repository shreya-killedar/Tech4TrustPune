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

function getAuthUser() {
  return JSON.parse(localStorage.getItem('auth_user') || '{}');
}

function setAuthUser(user: any) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

const Settings = () => {
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

  const handleSaveProfile = () => {
    setAuthUser({ ...authUser, ...profile });
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully",
    });
    window.location.reload(); // To update top bar/profile everywhere
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved",
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
            <span>Theme</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="font-medium">Light</span>
          <Switch
            checked={theme === 'light'}
            onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
          />
          <span className="font-medium">Dark</span>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
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
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">Photo hint</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                className="placeholder-white text-white bg-card"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="placeholder-white text-white bg-card"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter your phone number"
                className="placeholder-white text-white bg-card"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Enter your country"
                className="placeholder-white text-white bg-card"
                value={profile.country}
                onChange={(e) => setProfile({...profile, country: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={profile.currency} onValueChange={(value) => setProfile({...profile, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.currency} value={country.currency}>
                      {country.currency} - {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="language">Preferred Language</Label>
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
            Save Profile Changes
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Biometric Login</p>
                <p className="text-sm text-muted-foreground">Enable biometric login for enhanced security.</p>
              </div>
              <Switch
                checked={security.biometricLogin}
                onCheckedChange={(checked) => setSecurity({...security, biometricLogin: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Alerts</p>
                <p className="text-sm text-muted-foreground">Receive notifications for suspicious login attempts.</p>
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
              Change PIN
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

          <Button onClick={handleSaveSecurity} className="w-full md:w-auto">
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications on your device.</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email alerts for important updates.</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive SMS alerts for important updates.</p>
              </div>
              <Switch
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Receive alerts for new transactions.</p>
              </div>
              <Switch
                checked={notifications.transactionAlerts}
                onCheckedChange={(checked) => setNotifications({...notifications, transactionAlerts: checked})}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Promotional Emails</p>
                <p className="text-sm text-muted-foreground">Receive promotional emails from us.</p>
              </div>
              <Switch
                checked={notifications.promotionalEmails}
                onCheckedChange={(checked) => setNotifications({...notifications, promotionalEmails: checked})}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4532</p>
                  <p className="text-sm text-muted-foreground">Expires</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Wells Fargo ••••3456</p>
                  <p className="text-sm text-muted-foreground">Checking Account</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>

          <Button variant="outline" className="w-full">Add New Payment Method</Button>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="EST">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Download Account Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Contact Support
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Terms & Privacy Policy
            </Button>
            
            <Separator />
            
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;