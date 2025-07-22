import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const getUserCurrency = () => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.currency || 'USD';
  } catch {
    return 'USD';
  }
};

const getUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.email || '';
  } catch {
    return '';
  }
};

const Transactions = () => {
  const { t } = useTranslation();
  const [userCurrency, setUserCurrency] = useState(getUserCurrency());
  const userEmail = getUserEmail();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (userEmail) {
      const txs = JSON.parse(localStorage.getItem(`transactions_${userEmail}`) || '[]');
      setTransactions(txs);
    }
    // Listen for wallet-balance-updated event for real-time sync
    const onWalletUpdate = () => {
      if (userEmail) {
        const txs = JSON.parse(localStorage.getItem(`transactions_${userEmail}`) || '[]');
        setTransactions(txs);
      }
    };
    window.addEventListener('wallet-balance-updated', onWalletUpdate);
    // Listen for currency-changed event
    const onCurrencyChanged = () => {
      setUserCurrency(getUserCurrency());
    };
    window.addEventListener('currency-changed', onCurrencyChanged);
    return () => {
      window.removeEventListener('wallet-balance-updated', onWalletUpdate);
      window.removeEventListener('currency-changed', onCurrencyChanged);
    };
  }, [userEmail]);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('transactions.transactionHistory')}</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">{t('transactions.type')}</th>
            <th className="p-2">{t('transactions.amount')}</th>
            <th className="p-2">{t('transactions.toFrom')}</th>
            <th className="p-2">{t('transactions.date')}</th>
            <th className="p-2">{t('transactions.status')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr><td colSpan={5} className="p-2 text-center text-muted-foreground">{t('transactions.noTransactionsFound')}</td></tr>
          )}
          {transactions.map(tx => (
            <tr key={tx.id} className="border-t">
              <td className="p-2 capitalize">{t(`transactions.${tx.type}`)}</td>
              <td className="p-2">{formatCurrency(tx.amount, userCurrency)}</td>
              <td className="p-2">{tx.recipient || '-'}</td>
              <td className="p-2">{tx.date}</td>
              <td className="p-2">{tx.status || t('transactions.completed')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
