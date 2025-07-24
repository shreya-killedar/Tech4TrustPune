import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';


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
  const [selectedTx, setSelectedTx] = useState<any | null>(null);


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
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
            <th className="p-2">To/From</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr><td colSpan={5} className="p-2 text-center text-muted-foreground">{t('transactions.noTransactionsFound')}</td></tr>
          )}
          {transactions.map(tx => (
            <Dialog key={tx.id}>
            <DialogTrigger asChild>
              <tr className="border-t cursor-pointer hover:bg-muted/30" onClick={() => setSelectedTx(tx)}>
                <td className="p-2 capitalize">{t(`transactions.${tx.type}`)}</td>
                <td className="p-2">{formatCurrency(tx.amount, userCurrency)}</td>
                <td className="p-2">{tx.recipient || '-'}</td>
                <td className="p-2">{tx.date}</td>
                <td className="p-2">{tx.status || t('transactions.completed')}</td>
              </tr>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('transactions.transactionSummary')}</DialogTitle>
                <DialogDescription>
                  <div className="space-y-2 mt-2">
                    <div><b>{t('transactions.type')}:</b> {t(`transactions.${tx.type}`)}</div>
                    <div><b>{t('transactions.amount')}:</b> {formatCurrency(tx.amount, userCurrency)}</div>
                    <div><b>{t('transactions.toFrom')}:</b> {tx.recipient || '-'}</div>
                    <div><b>{t('transactions.date')}:</b> {tx.date}</div>
                    <div><b>{t('transactions.status')}:</b> {tx.status || t('transactions.completed')}</div>
                    {tx.fee !== undefined && <div><b>{t('transactions.fee')}:</b> {formatCurrency(tx.fee, userCurrency)}</div>}
                    {tx.exchangeRate !== undefined && <div><b>{t('transactions.exchangeRate')}:</b> {tx.exchangeRate}</div>}
                    {tx.recipientCountry && <div><b>{t('transactions.recipientCountry')}:</b> {tx.recipientCountry}</div>}
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
