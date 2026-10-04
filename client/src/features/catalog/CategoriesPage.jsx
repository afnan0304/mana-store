import React, { useState } from 'react';
import { Plus, MoreHorizontal, Package, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const initialCategories = [
  { name: 'Sports & Recreation', description: 'Court, field, and fitness equipment', count: 28, color: 'bg-emerald-100 text-emerald-800', updated: 'Today' },
  { name: 'Electronics', description: 'Meters, kits, and presentation gear', count: 24, color: 'bg-sky-100 text-sky-800', updated: 'Yesterday' },
  { name: 'Workshop Tools', description: 'Hand tools and powered equipment', count: 31, color: 'bg-amber-100 text-amber-800', updated: 'Sep 28' },
  { name: 'Laboratory', description: 'Teaching and practical lab assets', count: 19, color: 'bg-violet-100 text-violet-800', updated: 'Sep 21' },
  { name: 'Media & Events', description: 'Audio, video, and event supplies', count: 17, color: 'bg-rose-100 text-rose-800', updated: 'Sep 18' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [query, setQuery] = useState('');
  const handleAddCategory = () => {
    const name = window.prompt('Category name');
    if (!name?.trim()) return;
    setCategories((current) => [...current, { name: name.trim(), description: 'New inventory category', count: 0, color: 'bg-slate-100 text-slate-700', updated: 'Just now' }]);
  };
  const handleRemoveCategory = (name) => {
    if (window.confirm(`Remove ${name} from this demo catalog?`)) setCategories((current) => current.filter((category) => category.name !== name));
  };
  const visible = categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Catalog structure</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Categories</h2><p className="mt-1 text-sm text-slate-500">Keep the inventory easy to browse and report on.</p></div><Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddCategory}>New category</Button></div>
      <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{categories.length} active categories</p><p className="text-xs text-slate-500">Grouped for quick checkout and reporting</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter categories" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:bg-white sm:w-64" /></CardContent></Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map((category) => <Card key={category.name} className="group p-5 transition hover:-translate-y-0.5 hover:border-slate-300"><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}><Package className="h-5 w-5" /></span><button type="button" title={`Remove ${category.name}`} onClick={() => handleRemoveCategory(category.name)} className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700"><MoreHorizontal className="h-4 w-4" /></button></div><h3 className="mt-5 font-semibold text-slate-950">{category.name}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{category.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3"><span className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><Archive className="h-3.5 w-3.5" />{category.count} items</span><Badge variant="neutral">Updated {category.updated}</Badge></div></Card>)}</div>
    </div>
  );
}
