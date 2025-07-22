import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      setError(t('onboarding.email') + ' or ' + t('onboarding.password') + ' incorrect!');
      return;
    }
    localStorage.setItem('auth_user', JSON.stringify(user));
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded bg-card">
      <h1 className="text-2xl font-bold mb-4">{t('onboarding.login')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder={t('onboarding.email')}
          className="w-full border px-3 py-2 text-black placeholder-black bg-card"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('onboarding.password')}
          className="w-full border px-3 py-2 text-black placeholder-black bg-card"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          {t('onboarding.login')}
        </button>
      </form>
      <div className="mt-4 text-center">
        <span>{t('onboarding.register')}? </span>
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate('/register')}
        >
          {t('onboarding.register')}
        </button>
      </div>
    </div>
  );
};

export default Login;
