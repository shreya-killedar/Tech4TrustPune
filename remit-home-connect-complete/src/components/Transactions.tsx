import React, { useState, useEffect } from 'react';

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
  const userCurrency = getUserCurrency();
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
    return () => window.removeEventListener('wallet-balance-updated', onWalletUpdate);
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
            <tr><td colSpan={5} className="p-2 text-center text-muted-foreground">No transactions found</td></tr>
          )}
          {transactions.map(tx => (
            <tr key={tx.id} className="border-t">
              <td className="p-2 capitalize">{tx.type}</td>
              <td className="p-2">{formatCurrency(tx.amount, userCurrency)}</td>
              <td className="p-2">{tx.recipient || '-'}</td>
              <td className="p-2">{tx.date}</td>
              <td className="p-2">{tx.status || 'Completed'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
