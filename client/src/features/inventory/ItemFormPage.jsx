import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getCategories, getItemById, createItem, updateItem } from '../../services/storeService';

const emptyForm = {
  assetId: '',
  name: '',
  category: '',
  condition: 'GOOD',
  currentLocation: 'Main Store',
  serialNumber: '',
  notes: '',
  quantity: 1,
};

const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100';

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
  </label>
);

export default function ItemFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const categoryResponse = await getCategories();
        setCategories(categoryResponse.categories || []);
        if (editing) {
          const itemResponse = await getItemById(id);
          const item = itemResponse.item;
          setForm({
            assetId: item.assetId || '',
            name: item.name || '',
            category: item.category?._id || item.category || '',
            condition: item.condition || 'GOOD',
            currentLocation: item.currentLocation || 'Main Store',
            serialNumber: item.serialNumber || '',
            notes: item.notes || '',
            quantity: item.quantity || 1,
          });
        }
      } catch (requestError) {
        setError(requestError.customMessage || 'Unable to load item details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [editing, id]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      if (editing) await updateItem(id, payload);
      else await createItem(payload);
      navigate('/items');
    } catch (requestError) {
      setError(requestError.customMessage || 'Unable to save item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Loading item details...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate('/items')} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to inventory</button>
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Catalog record</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{editing ? 'Edit item' : 'Add inventory item'}</h2><p className="mt-1 text-sm text-slate-500">Capture the details your store desk needs at a glance.</p></div>
      <Card>
        <CardHeader><CardTitle>Item details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Item name"><input className={inputClass} name="name" value={form.name} onChange={updateField} required placeholder="e.g. Digital Multimeter" /></Field>
              <Field label="Asset ID" hint="Use a unique, scannable identifier."><input className={`${inputClass} font-mono`} name="assetId" value={form.assetId} onChange={updateField} required placeholder="MANA-ELC-032" /></Field>
              <Field label="Category"><select className={inputClass} name="category" value={form.category} onChange={updateField} required><option value="">Choose a category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></Field>
              <Field label="Condition"><select className={inputClass} name="condition" value={form.condition} onChange={updateField}><option value="NEW">New</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Needs attention</option></select></Field>
              <Field label="Purchase quantity"><input type="number" min="1" className={inputClass} name="quantity" value={form.quantity} onChange={updateField} required /></Field>
              <Field label="Serial number"><input className={`${inputClass} font-mono`} name="serialNumber" value={form.serialNumber} onChange={updateField} placeholder="Optional" /></Field>
            </div>
            <Field label="Storage location"><input className={inputClass} name="currentLocation" value={form.currentLocation} onChange={updateField} /></Field>
            <Field label="Description"><textarea className={`${inputClass} min-h-28 resize-y`} name="notes" value={form.notes} onChange={updateField} placeholder="Add notes about what is included or special about this item." /></Field>
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><ImagePlus className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-2 text-sm font-medium text-slate-700">Reference photos can be added later</p><p className="mt-1 text-xs text-slate-500">Image upload is not connected to the current API.</p></div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-5"><Button variant="outline" type="button" onClick={() => navigate('/items')} disabled={submitting}>Cancel</Button><Button type="submit" isLoading={submitting} leftIcon={<Save className="h-4 w-4" />}>{editing ? 'Save changes' : 'Save item'}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
