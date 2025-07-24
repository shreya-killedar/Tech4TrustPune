import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "@/components/Login";
import Register from "@/components/Register";
import { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Insurance from "./components/Insurance";
import Savings from "./components/Savings";
import Settings from "./components/Settings";
import Transactions from "./components/Transactions";
import Wallet from "./components/Wallet";
import SendMoney from "./components/SendMoney";
import DashboardLayout from "./components/DashboardLayout";
import FAQ from "@/components/FAQ";

const queryClient = new QueryClient();

function isAuthenticated() {
  return !!localStorage.getItem('auth_user');
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AuthRoute({ children }: { children: JSX.Element }) {
  // Prevent access to login/register if already logged in
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/send" element={<SendMoney />} />
            <Route path="/dashboard/wallet" element={<Wallet onNavigate={function (page: string): void {
              throw new Error("Function not implemented.");
            } } />} />
            <Route path="/dashboard/savings" element={<Savings />} />
            <Route path="/dashboard/insurance" element={<Insurance />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/transactions" element={<Transactions />} />
            <Route path="/dashboard/faq" element={<FAQ />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
