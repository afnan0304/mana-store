import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { getTransactions } from '../../services/storeService';
import IssueModal from './IssueModal';
import ReturnModal from './ReturnModal';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  History,
} from 'lucide-react';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions(1);
  }, [typeFilter]);

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getTransactions({
        page,
        limit: 15,
        type: typeFilter || undefined,
      });
      setTransactions(res.transactions || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'ISSUE':
        return <Badge variant="issued" dot>ISSUE</Badge>;
      case 'RETURN':
        return <Badge variant="available" dot>RETURN</Badge>;
      case 'MAINTENANCE_IN':
      case 'MAINTENANCE_OUT':
        return <Badge variant="maintenance" dot>MAINTENANCE</Badge>;
      case 'REPORT_DAMAGE':
      case 'REPORT_LOST':
        return <Badge variant="damaged" dot>{type}</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Issue & Return Desk</h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable ledger of equipment checkouts, handovers, check-ins, and workshop routings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions(pagination.page)}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReturnModalOpen(true)}
            leftIcon={<ArrowDownLeft className="h-4 w-4 text-slate-600" />}
          >
            Process Return
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIssueModalOpen(true)}
            leftIcon={<ArrowUpRight className="h-4 w-4" />}
          >
            Issue Item
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Filter by Action:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="">All Transactions</option>
              <option value="ISSUE">ISSUE</option>
              <option value="RETURN">RETURN</option>
              <option value="MAINTENANCE_IN">MAINTENANCE_IN</option>
              <option value="MAINTENANCE_OUT">MAINTENANCE_OUT</option>
              <option value="REPORT_DAMAGE">REPORT_DAMAGE</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pagination.total} total logged records
          </span>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Equipment Item</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Purpose / Remarks</TableHead>
                <TableHead>Storekeeper</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableEmpty message="No transactions recorded matching the selected filter." colSpan={7} />
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell>{getTransactionBadge(tx.type)}</TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">
                        {tx.item?.name || 'Equipment Item'}
                      </div>
                      <div className="font-mono tracking-tight text-[11px] text-slate-500">
                        {tx.item?.assetId}
                      </div>
                    </TableCell>

                    <TableCell>
                      {tx.person ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{tx.person.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono tracking-tight">
                            {tx.person.identifier}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-600">
                        {tx.conditionAtEvent || 'GOOD'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-700 max-w-xs truncate">
                        {tx.purpose || tx.remarks || 'Standard store operation'}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {tx.performedBy?.username || 'Storekeeper'}
                    </TableCell>

                    <TableCell className="text-xs text-slate-400 font-mono tracking-tight">
                      {new Date(tx.createdAt || tx.issueDate).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>
                Showing page <strong className="text-slate-700">{pagination.page}</strong> of{' '}
                <strong className="text-slate-700">{pagination.totalPages}</strong>
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTransactions(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTransactions(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <IssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onSuccess={() => fetchTransactions(pagination.page)}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={() => fetchTransactions(pagination.page)}
      />
    </div>
  );
};

export default TransactionsPage;
