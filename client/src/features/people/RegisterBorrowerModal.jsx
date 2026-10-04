import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createPerson } from '../../services/storeService';

const initialForm = { name: '', type: 'STUDENT', identifier: '', department: '', email: '', phone: '' };

export default function RegisterBorrowerModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setError('');
    setSuccess('');
    onClose();
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await createPerson(form);
      setSuccess(response.message || 'Borrower registered successfully.');
      onSuccess?.();
      window.setTimeout(handleClose, 900);
    } catch (requestError) {
      setError(requestError.customMessage || 'Unable to register borrower.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Register borrower" description="Create an active borrowing profile for a student, staff member, or faculty user.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        {success && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Full name" name="name" value={form.name} onChange={update} required placeholder="Riya Nair" />
          <Input label="Borrower ID" name="identifier" value={form.identifier} onChange={update} required placeholder="STU-2041" />
          <label className="block text-sm font-medium text-slate-700">Type<select name="type" value={form.type} onChange={update} className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"><option>STUDENT</option><option>STAFF</option><option>FACULTY</option><option>DEPARTMENT</option><option>OTHER</option></select></label>
          <Input label="Department" name="department" value={form.department} onChange={update} required placeholder="Electronics" />
          <Input label="Email" type="email" name="email" value={form.email} onChange={update} placeholder="name@campus.edu" />
          <Input label="Phone" name="phone" value={form.phone} onChange={update} placeholder="+91 98765 40211" />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button><Button type="submit" isLoading={submitting}>Register borrower</Button></div>
      </form>
    </Modal>
  );
}
