import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, AlertTriangle, Clock3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const initialQueue = [
  { id: 'MNT-204', item: 'Epson EB-X41 Projector', asset: 'MANA-PRJ-014', issue: 'Lamp flickers after warm-up', owner: 'Facilities', priority: 'High', status: 'In progress', due: 'Today' },
  { id: 'MNT-203', item: 'Digital Multimeter', asset: 'MANA-ELC-032', issue: 'Calibration certificate expired', owner: 'Electronics Lab', priority: 'Medium', status: 'Queued', due: 'Oct 05' },
  { id: 'MNT-201', item: 'Air Blower 2HP', asset: 'MANA-TLS-009', issue: 'Replace intake filter', owner: 'Workshop', priority: 'Low', status: 'Queued', due: 'Oct 08' },
  { id: 'MNT-198', item: 'Cricket Kit Bag', asset: 'MANA-SPT-041', issue: 'Two grips need replacement', owner: 'Sports Office', priority: 'Low', status: 'Ready', due: 'Done' },
];
const blankJob = { item: '', asset: '', issue: '', owner: 'Workshop', priority: 'Medium' };
const tone = { High: 'overdue', Medium: 'warning', Low: 'neutral' };
const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100';

export default function MaintenancePage() {
  const [queue, setQueue] = useState(initialQueue);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blankJob);
  const [saved, setSaved] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const complete = (id) => setQueue((current) => current.map((job) => job.id === id ? { ...job, status: 'Ready', due: 'Done' } : job));
  const handleSubmit = (event) => {
    event.preventDefault();
    setQueue((current) => [{ ...form, id: `MNT-${204 + current.length + 1}`, status: 'Queued', due: 'Next review' }, ...current]);
    setForm(blankJob);
    setSaved(true);
    window.setTimeout(() => { setSaved(false); setModalOpen(false); }, 700);
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Asset health</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Maintenance queue</h2><p className="mt-1 text-sm text-slate-500">Track repairs, inspections, and the next item ready for circulation.</p></div><Button size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>Log maintenance</Button></div>
    <div className="grid gap-3 sm:grid-cols-3">{[['Open work orders', queue.filter((job) => job.status !== 'Ready').length, Wrench], ['Due today', 1, Clock3], ['Ready to return', queue.filter((job) => job.status === 'Ready').length, CheckCircle2]].map(([label, value, Icon]) => <Card key={label} className="p-4"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><Icon className="h-4 w-4 text-amber-700" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p></Card>)}</div>
    <Card><CardHeader className="border-b border-slate-100"><CardTitle>Work orders</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y divide-slate-100">{queue.map((job) => <div key={job.id} className="grid gap-3 p-4 md:grid-cols-[1.5fr_1.2fr_0.8fr_0.7fr_auto] md:items-center"><div><div className="flex items-center gap-2"><span className="font-mono text-[11px] text-slate-400">{job.id}</span><Badge variant={tone[job.priority]}>{job.priority}</Badge></div><p className="mt-1 font-semibold text-slate-900">{job.item}</p><p className="text-xs text-slate-500">{job.asset} · {job.issue}</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Assigned to</p><p className="mt-1 text-sm text-slate-700">{job.owner}</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Status</p><Badge variant={job.status === 'Ready' ? 'available' : job.status === 'In progress' ? 'issued' : 'neutral'} dot>{job.status}</Badge></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Due</p><p className="mt-1 text-sm font-medium text-slate-700">{job.due}</p></div><div className="md:text-right">{job.status !== 'Ready' ? <Button size="sm" variant="outline" onClick={() => complete(job.id)} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>Mark ready</Button> : <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Cleared</span>}</div></div>)}</div></CardContent></Card>
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle className="h-4 w-4 shrink-0" />Two items have been held for more than seven days. Review the queue before the next issue window.</div>
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log maintenance" description="Add an item to the local maintenance queue."><form onSubmit={handleSubmit} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Item name<input className={inputClass} name="item" value={form.item} onChange={update} required placeholder="Digital Multimeter" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Asset ID<input className={`${inputClass} font-mono`} name="asset" value={form.asset} onChange={update} required placeholder="MANA-ELC-032" /></label><label className="block text-sm font-medium text-slate-700">Priority<select className={inputClass} name="priority" value={form.priority} onChange={update}><option>High</option><option>Medium</option><option>Low</option></select></label></div><label className="block text-sm font-medium text-slate-700">Issue<textarea className={`${inputClass} min-h-20`} name="issue" value={form.issue} onChange={update} required placeholder="Describe the inspection or repair needed" /></label><label className="block text-sm font-medium text-slate-700">Assigned team<input className={inputClass} name="owner" value={form.owner} onChange={update} /></label><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">{saved ? 'Added' : 'Add work order'}</Button></div></form></Modal>
  </div>;
}
