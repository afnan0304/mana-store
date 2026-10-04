import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { getOverdueItems } from '../../services/storeService';
import ReturnModal from './ReturnModal';
import { ClockAlert, ArrowDownLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OverduePage = () => {
  const [overdues, setOverdues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reminderStatus, setReminderStatus] = useState('');

  useEffect(() => {
    fetchOverdues();
  }, []);

  const fetchOverdues = async () => {
    setLoading(true);
    try {
      const res = await getOverdueItems();
      setOverdues(res.items || []);
    } catch (err) {
      console.error('Failed to load overdue items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (item) => {
    setSelectedItem(item);
    setReturnModalOpen(true);
  };

  const handleSendReminders = () => {
    const recipients = overdues
      .map((item) => item.currentBorrower?.email)
      .filter(Boolean);

    if (recipients.length === 0) {
      setReminderStatus('No borrower email addresses are available for the current overdue items.');
      return;
    }

    const subject = encodeURIComponent('Northline equipment return reminder');
    const body = encodeURIComponent(
      'Hello,\n\nThis is a reminder that equipment issued from Northline is overdue. Please contact the store desk to arrange its return.\n\nThank you.'
    );
    window.location.href = `mailto:?bcc=${encodeURIComponent(recipients.join(','))}&subject=${subject}&body=${body}`;
    setReminderStatus(`Reminder draft prepared for ${recipients.length} borrower${recipients.length === 1 ? '' : 's'}.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overdue Equipment</h2>
          <p className="text-sm text-slate-500 mt-1">
            Active loans that have passed their expected return deadline requiring storekeeper action.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverdues}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSendReminders}
            disabled={overdues.length === 0}
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Send Overdue Reminders
          </Button>
        </div>
      </div>

      {reminderStatus && (
        <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {reminderStatus}
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border border-rose-200">
        <CardHeader className="bg-rose-50/50 border-b border-rose-100 py-4 px-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <ClockAlert className="h-5 w-5 text-rose-600 animate-pulse" />
              <CardTitle className="text-rose-900 text-base font-semibold">
                Critical Overdue Register
              </CardTitle>
            </div>
            <Badge variant="overdue" dot>
              {overdues.length} Action Items
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expected Due Date</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdues.length === 0 ? (
                <TableEmpty message="No equipment items are currently overdue! All loans are on schedule." colSpan={7} />
              ) : (
                overdues.map((item) => (
                  <TableRow key={item._id} className="hover:bg-rose-50/20">
                    <TableCell>
                      <span className="font-mono tracking-tight text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.assetId}
                      </span>
                    </TableCell>

                    <TableCell className="font-semibold text-slate-900 text-sm">
                      {item.name}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800">
                        {item.currentBorrower?.name || 'Assigned Borrower'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tracking-tight">
                        {item.currentBorrower?.identifier}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {item.currentBorrower?.department || '—'}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-rose-700 tracking-tight">
                      {item.currentExpectedReturnDate
                        ? new Date(item.currentExpectedReturnDate).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>

                    <TableCell>
                      <Badge variant="overdue" dot>
                        +{item.daysOverdue || 1}d
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReturnClick(item)}
                        leftIcon={<ArrowDownLeft className="h-3.5 w-3.5 text-slate-600" />}
                        className="text-xs px-2.5 py-1"
                      >
                        Return Item
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Return Modal */}
      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={fetchOverdues}
        item={selectedItem}
      />
    </div>
  );
};

export default OverduePage;
