import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { getAuditLogs } from '../../services/storeService';
import { ShieldCheck, RefreshCw, Search } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: 20,
        action: actionFilter || undefined,
      });
      setLogs(res.logs || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('ISSUE')) return <Badge variant="issued">{action}</Badge>;
    if (action.includes('RETURN')) return <Badge variant="available">{action}</Badge>;
    if (action.includes('MAINTENANCE')) return <Badge variant="maintenance">{action}</Badge>;
    if (action.includes('LOGIN')) return <Badge variant="brand">{action}</Badge>;
    return <Badge variant="neutral">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Audit & Activity Trail</h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable system logs tracing administrative actions, equipment checkouts, and system events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(pagination.page)}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Filter Action:
            </span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="ITEM_CREATED">ITEM_CREATED</option>
              <option value="ITEM_ISSUED">ITEM_ISSUED</option>
              <option value="ITEM_RETURNED">ITEM_RETURNED</option>
              <option value="SYSTEM_INITIALIZED">SYSTEM_INITIALIZED</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pagination.total} immutable audit records
          </span>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor / User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Activity Details</TableHead>
                <TableHead>Client IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableEmpty message="No audit logs recorded matching criteria." colSpan={6} />
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-xs text-slate-400 tracking-tight whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">
                        {log.performedBy?.username || 'System Event'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {log.performedBy?.role || 'SYSTEM'}
                      </div>
                    </TableCell>

                    <TableCell>{getActionBadge(log.action)}</TableCell>

                    <TableCell className="text-xs font-medium text-slate-700">
                      {log.targetEntity || 'System'}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-600 max-w-sm font-mono truncate">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details)
                          : String(log.details || '—')}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-400 tracking-tight">
                      {log.ipAddress || '127.0.0.1'}
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
                Page <strong className="text-slate-700">{pagination.page}</strong> of{' '}
                <strong className="text-slate-700">{pagination.totalPages}</strong>
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchLogs(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
