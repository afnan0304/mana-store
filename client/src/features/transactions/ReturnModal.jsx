import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { returnItem, getItems } from '../../services/storeService';
import { AlertTriangle, Wrench, CheckCircle2, User, Package, Calendar } from 'lucide-react';

export const ReturnModal = ({
  isOpen,
  onClose,
  onSuccess,
  item = null,
}) => {
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [issuedItems, setIssuedItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSendToMaintenance(false);
    setRemarks('');
    setError('');
    setSuccessMsg('');
    if (item) {
      setReturnCondition(item.condition || 'GOOD');
      setSelectedId(item._id);
    } else {
      setReturnCondition('GOOD');
      setSelectedId('');
      getItems({ status: 'ISSUED', limit: 100 })
        .then((res) => {
          const list = res.items || [];
          setIssuedItems(list);
          if (list.length > 0) setSelectedId(list[0]._id);
        })
        .catch(() => setError('Failed to load issued items.'));
    }
  }, [item, isOpen]);

  const activeItem = item || issuedItems.find((i) => i._id === selectedId) || null;

  // Automatically enable sendToMaintenance if damaged or poor
  const handleConditionChange = (e) => {
    const val = e.target.value;
    setReturnCondition(val);
    if (val === 'DAMAGED' || val === 'POOR') {
      setSendToMaintenance(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeItem?._id) {
      setError('Please select an item to return.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await returnItem({
        itemId: activeItem._id,
        returnCondition,
        remarks,
        sendToMaintenance,
      });

      setSuccessMsg(res.message || 'Item processed successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.customMessage || err.message || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  const borrower = activeItem?.currentBorrower;
  const isOverdue =
    activeItem?.currentExpectedReturnDate &&
    new Date(activeItem.currentExpectedReturnDate) < new Date();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Equipment Return"
      description="Inspect return condition and update store inventory status."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {!item && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Issued Item *
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={submitting}
              className="w-full text-sm rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {issuedItems.length === 0 && <option value="">No issued items</option>}
              {issuedItems.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.assetId} — {i.name}{i.currentBorrower?.name ? ` (${i.currentBorrower.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeItem && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-slate-900 text-sm">
                {activeItem.name}
              </span>
            </div>
            <span className="font-mono tracking-tight text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {activeItem.assetId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1.5 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                Holder: <strong>{borrower?.name || 'Assigned Borrower'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                Due:{' '}
                {activeItem.currentExpectedReturnDate
                  ? new Date(activeItem.currentExpectedReturnDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>

          {isOverdue && (
            <div className="pt-1 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>Item is overdue! Verify condition and record damages if any.</span>
            </div>
          )}
        </div>
        )}

        {/* Return Condition */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Inspected Return Condition *
          </label>
          <select
            value={returnCondition}
            onChange={handleConditionChange}
            disabled={submitting}
            className="w-full text-sm rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            required
          >
            <option value="GOOD">GOOD - Fully Operational & Functional</option>
            <option value="FAIR">FAIR - Working with Minor Cosmetic Wear</option>
            <option value="POOR">POOR - Inoperable / Requires Workshop Service</option>
            <option value="DAMAGED">DAMAGED - Broken / Missing Components</option>
          </select>
        </div>

        {/* Maintenance Toggle */}
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wrench className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Route to Maintenance Workshop
              </p>
              <p className="text-[11px] text-slate-500">
                Sets state to <strong className="text-amber-700">UNDER_MAINTENANCE</strong> instead of Available.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={sendToMaintenance}
            onChange={(e) => setSendToMaintenance(e.target.checked)}
            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
        </div>

        {/* Return Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Return Inspection Remarks
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Returned with all cables; lens cleaned; slight scratch on chassis."
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting} disabled={!activeItem}>
            Confirm Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnModal;
