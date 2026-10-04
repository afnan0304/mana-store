import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

const demoAccounts = [
  { label: 'Administrator', email: 'admin@mana.store', password: 'Admin@123', detail: 'Full workspace access' },
  { label: 'Storekeeper', email: 'storekeeper@mana.store', password: 'Store@123', detail: 'Desk and inventory access' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setIsLoading(true);
    setError('');
    const response = await login(email, password);
    setIsLoading(false);
    if (response.success) navigate(from, { replace: true });
    else setError(response.message);
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <main className="min-h-screen bg-[#e9ede8] text-slate-900 lg:grid lg:grid-cols-[minmax(300px,0.8fr)_minmax(440px,1.2fr)]">
      <section className="hidden border-r border-[#314542] bg-[#172523] p-10 text-[#e9ede8] lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-400 text-slate-950"><Store className="h-5 w-5" /></span><div><p className="text-sm font-bold tracking-[0.18em] text-white">NORTHLINE</p><p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#9fb1ab]">Equipment operations</p></div></div>
          <div className="mt-24 max-w-sm"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Workspace access</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white">The store desk, ready for the next handover.</h1><p className="mt-5 max-w-xs text-sm leading-6 text-[#aebdb8]">Track equipment, borrowers, returns, and maintenance from one considered workspace.</p></div>
        </div>
        <div className="grid grid-cols-3 border-t border-[#314542] pt-5 text-[11px] text-[#9fb1ab]"><div><p className="font-mono text-white">01</p><p className="mt-1">Inventory</p></div><div><p className="font-mono text-white">02</p><p className="mt-1">Borrowers</p></div><div><p className="font-mono text-white">03</p><p className="mt-1">Audit trail</p></div></div>
      </section>

      <section className="flex min-h-screen flex-col justify-center px-5 py-8 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-slate-950"><Store className="h-4 w-4" /></span><div><p className="text-sm font-bold tracking-[0.16em]">NORTHLINE</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Equipment operations</p></div></div>
          <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Secure sign in</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Welcome back.</h2><p className="mt-2 text-sm text-slate-500">Use your workspace credentials to continue.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="flex items-center gap-2 border-l-2 border-rose-600 bg-rose-50 px-3 py-2.5 text-xs text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Email address</span><div className="relative mt-1.5"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@mana.store" className="w-full border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100" /></div></label>
            <label className="block"><span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Password</span><div className="relative mt-1.5"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" className="w-full border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100" /><button type="button" title={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
            <Button type="submit" isLoading={isLoading} className="w-full py-3" rightIcon={<ArrowRight className="h-4 w-4" />}>Sign in</Button>
          </form>

          <div className="mt-9 border-t border-slate-300 pt-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"><ShieldCheck className="h-4 w-4 text-teal-700" /> Demo workspace access</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{demoAccounts.map((account) => <button key={account.email} type="button" onClick={() => fillDemo(account)} className="border border-slate-300 bg-white px-3 py-3 text-left transition hover:border-teal-700 hover:bg-[#f7faf6]"><p className="text-sm font-semibold text-slate-800">{account.label}</p><p className="mt-1 text-[11px] text-slate-500">{account.detail}</p></button>)}</div></div>
          <p className="mt-8 text-center text-[11px] text-slate-500">Authorized workspace · Northline</p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
