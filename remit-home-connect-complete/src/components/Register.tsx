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
  const [country, setCountry] = useState(countries[0].code);
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
    <div className="max-w-md mx-auto mt-10 p-8 border rounded bg-card shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">{t('onboarding.register')}</h1>
      {!success ? (
        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder={t('onboarding.name')}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground bg-card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <select
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card"
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
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground bg-card"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('onboarding.password')}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground bg-card"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold text-lg shadow">
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
