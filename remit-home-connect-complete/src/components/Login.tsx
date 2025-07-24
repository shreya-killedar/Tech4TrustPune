import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  switchToRegister?: () => void;
}

const Login = ({ switchToRegister }: LoginProps) => {
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
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-8 rounded-2xl shadow-2xl relative">
      <div className="flex items-center justify-center mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary shadow text-white text-3xl mr-2">
          <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4' /></svg>
        </span>
        <h1 className="text-3xl font-extrabold text-primary drop-shadow">{t('onboarding.login')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary/60">
          {t('onboarding.login')}
        </button>
      </form>
      <div className="mt-6 text-center">
        <span>{t('onboarding.register')}? </span>
        <button
          className="text-blue-600 hover:underline"
          onClick={switchToRegister ? switchToRegister : () => navigate('/register')}
        >
          {t('onboarding.register')}
        </button>
      </div>
    </div>
  );
};

export default Login;
