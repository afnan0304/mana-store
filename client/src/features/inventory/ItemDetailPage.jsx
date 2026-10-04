import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getItemById } from '../../services/storeService';
import IssueModal from '../transactions/IssueModal';
import ReturnModal from '../transactions/ReturnModal';
import {
  ArrowLeft,
  User,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Wrench,
  FileText,
} from 'lucide-react';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getItemById(id);
      setItem(res.item);
      setHistory(res.transactionHistory || []);
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch equipment details.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (item) => {
    const isOverdue =
      item.status === 'ISSUED' &&
      item.currentExpectedReturnDate &&
      new Date(item.currentExpectedReturnDate) < new Date();

    if (isOverdue) {
      return (
        <Badge variant="overdue" dot className="animate-pulse">
          Overdue Loan
        </Badge>
      );
    }

    switch (item.status) {
      case 'AVAILABLE':
        return <Badge variant="available" dot>Available for Issue</Badge>;
      case 'ISSUED':
        return <Badge variant="issued" dot>Currently Issued</Badge>;
      case 'UNDER_MAINTENANCE':
        return <Badge variant="maintenance" dot>Under Maintenance</Badge>;
      case 'DAMAGED':
        return <Badge variant="damaged" dot>Damaged</Badge>;
      case 'LOST':
        return <Badge variant="lost" dot>Lost</Badge>;
      case 'RETIRED':
        return <Badge variant="retired" dot>Retired</Badge>;
      default:
        return <Badge variant="neutral">{item.status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">Loading equipment lifecycle details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/items')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Inventory
        </Button>
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error || 'Equipment item not found.'}
        </div>
      </div>
    );
  }

  const borrower = item.currentBorrower;
  const isOverdue =
    item.status === 'ISSUED' &&
    item.currentExpectedReturnDate &&
    new Date(item.currentExpectedReturnDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/items')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Inventory
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{item.name}</span>
              <span className="font-mono tracking-tight text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {item.assetId}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-medium text-slate-700">{item.category?.name || 'Uncategorized'}</span>
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          {item.status === 'AVAILABLE' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIssueModalOpen(true)}
              leftIcon={<ArrowUpRight className="h-4 w-4" />}
            >
              Issue Item
            </Button>
          )}
          {item.status === 'ISSUED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReturnModalOpen(true)}
              leftIcon={<ArrowDownLeft className="h-4 w-4 text-slate-700" />}
            >
              Process Return
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/items/${item._id}/edit`)}
          >
            Edit item
          </Button>
        </div>
      </div>

      {/* Current State Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Card */}
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Current Status</span>
          <div className="mt-2">{renderStatusBadge(item)}</div>
          {isOverdue && (
            <span className="text-[11px] text-rose-600 font-semibold mt-1.5 block">
              ⚠️ Immediate return required!
            </span>
          )}
        </Card>

        {/* Current Holder Card with Monospace ID */}
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Current Holder</span>
          {borrower ? (
            <div className="mt-1.5">
              <p className="text-sm font-bold text-slate-900">{borrower.name}</p>
              <p className="text-xs text-slate-500 font-mono tracking-tight">
                {borrower.identifier} • {borrower.department}
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400 mt-2">In Store Storage</p>
          )}
        </Card>

        {/* Location & Condition */}
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Location & Condition</span>
          <div className="mt-1.5">
            <p className="text-sm font-bold text-slate-900">{item.currentLocation || 'Main Store'}</p>
            <p className="text-xs text-slate-500">
              Condition: <strong className="text-slate-700">{item.condition}</strong>
            </p>
          </div>
        </Card>

        {/* Return Due Date */}
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">Return Due Date</span>
          <div className="mt-1.5">
            <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">
              {item.currentExpectedReturnDate
                ? new Date(item.currentExpectedReturnDate).toLocaleDateString()
                : 'None Active'}
            </p>
            <p className="text-xs text-slate-400">
              SN: <span className="font-mono text-slate-600">{item.serialNumber || 'N/A'}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Chronological History Timeline */}
      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Chronological Lifecycle & Loan History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No transactions recorded for this equipment yet.
            </p>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {history.map((tx) => {
                const isIssue = tx.type === 'ISSUE';
                const isReturn = tx.type === 'RETURN';
                const isMaintenance = tx.type.startsWith('MAINTENANCE');

                return (
                  <div key={tx._id} className="relative group">
                    {/* Timeline Node Icon */}
                    <div
                      className={`absolute -left-[33px] top-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm ${
                        isIssue
                          ? 'bg-sky-500'
                          : isReturn
                          ? 'bg-emerald-500'
                          : isMaintenance
                          ? 'bg-amber-500'
                          : 'bg-slate-600'
                      }`}
                    >
                      {isIssue && <ArrowUpRight className="h-3.5 w-3.5" />}
                      {isReturn && <ArrowDownLeft className="h-3.5 w-3.5" />}
                      {isMaintenance && <Wrench className="h-3.5 w-3.5" />}
                      {!isIssue && !isReturn && !isMaintenance && <FileText className="h-3.5 w-3.5" />}
                    </div>

                    {/* Timeline Event Details */}
                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {tx.type}
                          </span>
                          <Badge
                            variant={
                              isIssue
                                ? 'issued'
                                : isReturn
                                ? 'available'
                                : 'maintenance'
                            }
                            size="sm"
                          >
                            Condition: {tx.conditionAtEvent}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400 font-mono tracking-tight">
                          {new Date(tx.createdAt || tx.issueDate).toLocaleString()}
                        </span>
                      </div>

                      {/* Participant Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                        {tx.person && (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              Borrower: <strong>{tx.person.name}</strong> (
                              <span className="font-mono">{tx.person.identifier}</span>)
                            </span>
                          </div>
                        )}
                        {tx.performedBy && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Processed by:</span>
                            <span className="font-medium text-slate-700">
                              {tx.performedBy.username} ({tx.performedBy.role})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Purpose or Remarks */}
                      {tx.purpose && (
                        <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                          <strong>Purpose:</strong> {tx.purpose}
                        </p>
                      )}

                      {tx.remarks && (
                        <p className="text-xs text-slate-500 italic mt-1.5">
                          Remarks: "{tx.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <IssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onSuccess={fetchItemDetails}
        preselectedItemId={item._id}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={fetchItemDetails}
        item={item}
      />
    </div>
  );
};

export default ItemDetailPage;
