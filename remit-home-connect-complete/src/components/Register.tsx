import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { countries } from '@/lib/data';

interface RegisterProps {
  switchToLogin?: () => void;
}

const Register = ({ switchToLogin }: RegisterProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [country, setCountry] = useState(() => {
    const india = countries.find(c => c.code === 'IN');
    return india ? india.code : countries[0].code;
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const selectedCountry = countries.find(c => c.code === country);
  const currency = selectedCountry ? selectedCountry.currency : '';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      setError(t('onboarding.email') + ' already registered!');
      return;
    }
    const newUser = { name, country, email, password, currency };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setSuccess(true);
    setTimeout(() => {
      if (switchToLogin) {
        switchToLogin();
      } else {
        navigate('/login');
      }
    }, 1500);
  };

  return (
    <div className="max-w-lg mx-auto mt-6 p-10 rounded-2xl shadow-2xl relative">
      <div className="flex items-center justify-center mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary shadow text-white text-3xl mr-2">
          <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0v2m0 4h.01' /></svg>
        </span>
        <h1 className="text-3xl font-extrabold text-primary drop-shadow">{t('onboarding.register')}</h1>
      </div>
      {!success ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="text"
            placeholder={t('onboarding.name')}
            className="w-full border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <select
              className="w-full border border-primary/30 rounded-lg px-4 py-3 text-foreground bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm"
              value={country}
              onChange={e => setCountry(e.target.value)}
              required
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
            <div className="mt-1 text-sm text-muted-foreground">
              {t('dashboard.wallet')}: <span className="font-semibold">{currency}</span>
            </div>
          </div>
          <input
            type="email"
            placeholder={t('onboarding.email')}
            className="w-full border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('onboarding.password')}
            className="w-full border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-secondary/60">
            {t('onboarding.register')}
          </button>
        </form>
      ) : (
        <div className="text-green-600 text-lg font-semibold text-center py-8">Registered successfully! Redirecting to login...</div>
      )}
      <div className="mt-6 text-center">
        <span className="text-muted-foreground">{t('onboarding.login')}? </span>
        <button
          className="text-blue-600 hover:underline font-medium"
          onClick={switchToLogin ? switchToLogin : () => navigate('/login')}
        >
          {t('onboarding.login')}
        </button>
      </div>
    </div>
  );
};

export default Register;
