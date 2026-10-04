import React, { useState } from 'react';
import { Bell, Database, Save, Shield, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockUsers } from '../../data/mockData';

export default function SettingsPage() {
  const [users, setUsers] = useState(mockUsers);
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState('Northline');

  const inviteUser = () => setUsers((current) => [...current, { id: `u${current.length + 1}`, username: 'new.user', email: 'new.user@northline.store', role: 'VIEWER', isActive: true, lastLogin: 'Never' }]);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Workspace controls</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Settings</h2><p className="mt-1 text-sm text-slate-500">Manage workspace preferences and who can access the desk.</p></div><Button size="sm" onClick={() => setSaved(true)} leftIcon={<Save className="h-4 w-4" />}>{saved ? 'Saved' : 'Save changes'}</Button></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-teal-700" /> Workspace preferences</CardTitle></CardHeader><CardContent className="space-y-5"><label className="block"><span className="text-xs font-semibold text-slate-700">Workspace name</span><input value={storeName} onChange={(event) => setStoreName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600" /></label><label className="block"><span className="text-xs font-semibold text-slate-700">Return reminder window</span><select className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600" defaultValue="2"><option value="1">1 day before due</option><option value="2">2 days before due</option><option value="3">3 days before due</option></select></label><label className="flex items-center justify-between rounded-lg border border-slate-200 p-3"><span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Bell className="h-4 w-4 text-slate-400" /> Daily overdue digest</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-teal-700" /></label><div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500"><Database className="h-4 w-4" /> Demo mode uses local sample data for analytics.</div></CardContent></Card>
      <Card><CardHeader className="flex items-center justify-between"><div><CardTitle>User access</CardTitle><p className="mt-1 text-xs text-slate-500">{users.filter((user) => user.isActive).length} active accounts</p></div><Button size="sm" variant="outline" onClick={inviteUser} leftIcon={<UserPlus className="h-3.5 w-3.5" />}>Invite user</Button></CardHeader><CardContent className="p-0"><div className="divide-y divide-slate-100">{users.map((user) => <div key={user.id} className="flex items-center justify-between gap-3 p-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">{user.username.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{user.username}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div></div><div className="flex shrink-0 items-center gap-3"><Badge variant={user.isActive ? 'available' : 'neutral'}>{user.role}</Badge><span className="hidden text-xs text-slate-400 sm:block">{user.lastLogin}</span></div></div>)}</div></CardContent></Card>
    </div>
  </div>;
}
