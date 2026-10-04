import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getPersonById } from '../../services/storeService';

export default function BorrowerProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPersonById(id).then(setProfile).catch((requestError) => setError(requestError.customMessage || 'Unable to load borrower profile.'));
  }, [id]);

  if (error) return <div className="space-y-4"><Button variant="outline" onClick={() => navigate('/people')} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to borrowers</Button><div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div></div>;
  if (!profile) return <div className="py-16 text-center text-sm text-slate-500">Loading borrower profile...</div>;

  const { person, currentHeldItems = [], borrowHistory = [] } = profile;
  const email = person.email || '';
  return <div className="space-y-6">
    <button onClick={() => navigate('/people')} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to borrowers</button>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-800">{person.name.slice(0, 2).toUpperCase()}</div><div><p className="font-mono text-xs text-slate-400">{person.identifier}</p><h2 className="text-2xl font-bold text-slate-950">{person.name}</h2><p className="text-sm text-slate-500">{person.type} · {person.department}</p></div></div><Button variant="outline" disabled={!email} onClick={() => { window.location.href = `mailto:${email}`; }} leftIcon={<Mail className="h-4 w-4" />}>Contact borrower</Button></div>
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.5fr]"><Card><CardHeader><CardTitle>Borrower details</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex gap-3"><Mail className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Email</p><p className="mt-0.5 text-slate-700">{person.email || 'Not provided'}</p></div></div><div className="flex gap-3"><Phone className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Phone</p><p className="mt-0.5 text-slate-700">{person.phone || 'Not provided'}</p></div></div><div className="flex gap-3"><Building2 className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Department</p><p className="mt-0.5 text-slate-700">{person.department}</p></div></div><div className="flex gap-3"><CalendarDays className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Registered</p><p className="mt-0.5 text-slate-700">{person.createdAt ? new Date(person.createdAt).toLocaleDateString() : '—'}</p></div></div><div className="flex gap-3 border-t border-slate-100 pt-4"><ShieldCheck className="h-4 w-4 text-emerald-600" /><div><p className="text-xs text-slate-400">Account standing</p><p className="mt-0.5 font-medium text-emerald-700">{person.status || 'ACTIVE'}</p></div></div></CardContent></Card><Card><CardHeader className="flex items-center justify-between"><div><CardTitle>Active loans</CardTitle><p className="mt-1 text-xs text-slate-500">{currentHeldItems.length} items currently issued</p></div><Badge variant={currentHeldItems.length ? 'issued' : 'available'} dot>{currentHeldItems.length ? 'In progress' : 'Clear'}</Badge></CardHeader><CardContent className="p-0"><div className="divide-y divide-slate-100">{currentHeldItems.length === 0 ? <p className="p-5 text-sm text-slate-500">No active loans.</p> : currentHeldItems.map((loan) => <div key={loan._id} className="grid gap-3 p-4 sm:grid-cols-[1.4fr_0.8fr_0.7fr] sm:items-center"><div><p className="font-medium text-slate-900">{loan.name}</p><p className="font-mono text-[11px] text-slate-400">{loan.assetId}</p></div><div><p className="text-[11px] text-slate-400">Due date</p><p className="text-sm text-slate-700">{loan.currentExpectedReturnDate ? new Date(loan.currentExpectedReturnDate).toLocaleDateString() : '—'}</p></div><Badge variant="issued" dot>Issued</Badge></div>)}</div></CardContent></Card></div><Card><CardHeader><CardTitle>Borrow history</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{borrowHistory.length} recorded transaction{borrowHistory.length === 1 ? '' : 's'}.</p></CardContent></Card>
  </div>;
}
