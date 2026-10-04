import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getItems, getPeople, issueItem } from '../../services/storeService';
import { AlertCircle, CheckCircle2, Calendar, User, Package } from 'lucide-react';

export const IssueModal = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedItemId = null,
}) => {
  const [items, setItems] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || '');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [condition, setCondition] = useState('GOOD');
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
    }
  }, [preselectedItemId]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    setLoadingOptions(true);
    try {
      const [itemsRes, peopleRes] = await Promise.all([
        getItems({ status: 'AVAILABLE', limit: 100 }),
        getPeople({ status: 'ACTIVE', limit: 100 }),
      ]);
      setItems(itemsRes.items || []);
      setBorrowers(peopleRes.people || []);

      if (preselectedItemId) {
        setSelectedItemId(preselectedItemId);
      } else if (itemsRes.items?.length > 0 && !selectedItemId) {
        setSelectedItemId(itemsRes.items[0]._id);
      }

      if (peopleRes.people?.length > 0 && !selectedPersonId) {
        setSelectedPersonId(peopleRes.people[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch available items or borrowers list.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !selectedPersonId) {
      setError('Please select both an equipment item and a borrower.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await issueItem({
        itemId: selectedItemId,
        personId: selectedPersonId,
        expectedReturnDate,
        purpose,
        condition,
        remarks,
      });

      setSuccessMsg(res.message || 'Item issued successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.customMessage || err.message || 'Failed to issue equipment item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Equipment"
      description="Authorize equipment checkout and track expected return date."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Item Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span>Equipment Item *</span>
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            disabled={loadingOptions || submitting}
            className="w-full text-sm rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            required
          >
            <option value="">-- Choose Available Item --</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                [{item.assetId}] {item.name} ({item.condition})
              </option>
            ))}
          </select>
          {items.length === 0 && !loadingOptions && (
            <p className="text-[11px] text-amber-600 mt-1">
              No equipment currently marked as AVAILABLE.
            </p>
          )}
        </div>

        {/* Borrower Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Authorized Borrower *</span>
          </label>
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            disabled={loadingOptions || submitting}
            className="w-full text-sm rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          >
            <option value="">-- Choose Registered Borrower --</option>
            {borrowers.map((b) => (
              <option key={b._id} value={b._id}>
                [{b.identifier}] {b.name} ({b.type} - {b.department})
              </option>
            ))}
          </select>
        </div>

        {/* Expected Return Date & Initial Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Expected Return Date *</span>
            </label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Handover Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="NEW">NEW - Mint Condition</option>
              <option value="GOOD">GOOD - Fully Operational</option>
              <option value="FAIR">FAIR - Minor Cosmetic Wear</option>
            </select>
          </div>
        </div>

        {/* Purpose / Project */}
        <div>
          <Input
            label="Project or Purpose"
            placeholder="e.g. Senior Capstone Field Survey, Robotics Lab"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        {/* Remarks / Accessories Included */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Remarks & Included Accessories
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Carrying case, 2 test probes, battery pack included."
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            disabled={loadingOptions || items.length === 0}
          >
            Confirm Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueModal;
