import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SendMoney from '@/components/SendMoney';
import Wallet from '@/components/Wallet';
import Savings from '@/components/Savings';
import Insurance from '@/components/Insurance';
import Settings from '@/components/Settings';
import Transactions from '@/components/Transactions';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'send':
        return <SendMoney />;
      case 'wallet':
        return <Wallet />;
      case 'savings':
        return <Savings />;
      case 'insurance':
        return <Insurance />;
      case 'settings':
        return <Settings />;
      case 'transactions':
        return <Transactions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {renderPage()}
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
