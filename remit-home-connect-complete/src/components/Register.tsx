import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { countries } from '@/lib/data';

const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [country, setCountry] = useState(countries[0].code);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded bg-card shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">{t('onboarding.register')}</h1>
      <form onSubmit={handleRegister} className="space-y-5">
        <input
          type="text"
          placeholder={t('onboarding.name')}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-black bg-card"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div>
          <select
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-black bg-card"
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
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-black bg-card"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('onboarding.password')}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-black bg-card"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold text-lg shadow">
          {t('onboarding.register')}
        </button>
      </form>
      <div className="mt-6 text-center">
        <span className="text-muted-foreground">{t('onboarding.login')}? </span>
        <button
          className="text-blue-600 hover:underline font-medium"
          onClick={() => navigate('/login')}
        >
          {t('onboarding.login')}
        </button>
      </div>
    </div>
  );
};

export default Register;
