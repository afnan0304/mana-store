import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { getDashboardMetrics, getOverdueItems } from '../../services/storeService';
import ReturnModal from '../transactions/ReturnModal';
import IssueModal from '../transactions/IssueModal';
import {
  Package,
  CheckCircle2,
  ArrowUpRight,
  ClockAlert,
  Wrench,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  History,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, overdueRes] = await Promise.all([
        getDashboardMetrics(),
        getOverdueItems(),
      ]);

      if (dashRes?.metrics) {
        setMetrics(dashRes.metrics);
        setRecentTransactions(dashRes.recentTransactions || []);
      }
      if (overdueRes?.items) {
        setOverdueItems(overdueRes.items);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (item) => {
    setSelectedReturnItem(item);
    setReturnModalOpen(true);
  };

  const kpis = [
    {
      label: 'Total Equipment',
      value: metrics?.totalItems ?? '—',
      icon: Package,
      iconColor: 'text-slate-700 bg-slate-100',
      subtext: 'Catalog assets',
    },
    {
      label: 'Available in Store',
      value: metrics?.availableCount ?? '—',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
      subtext: 'Ready for issue',
    },
    {
      label: 'Currently Issued',
      value: metrics?.issuedCount ?? '—',
      icon: ArrowUpRight,
      iconColor: 'text-sky-700 bg-sky-50 border border-sky-200/60',
      subtext: `${metrics?.activeBorrowersCount ?? 0} active borrowers`,
    },
    {
      label: 'Overdue Returns',
      value: metrics?.overdueCount ?? '—',
      icon: ClockAlert,
      iconColor: 'text-rose-700 bg-rose-50 border border-rose-200/60',
      subtext: 'Action required',
    },
    {
      label: 'In Maintenance',
      value: metrics?.maintenanceCount ?? '—',
      icon: Wrench,
      iconColor: 'text-amber-700 bg-amber-50 border border-amber-200/60',
      subtext: 'Workshop / repair',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Store & Equipment Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time equipment inventory, checkout tracking, and operational alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIssueModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Issue Item
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4 bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg ${kpi.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.subtext}</p>
            </Card>
          );
        })}
      </div>

      {/* Overdue Items Alert Section */}
      {overdueItems.length > 0 && (
        <Card className="border border-rose-200 bg-white shadow-xs">
          <CardHeader className="bg-rose-50/60 border-b border-rose-100 py-3.5 px-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 text-rose-800">
                <ClockAlert className="h-4 w-4 text-rose-600 animate-pulse shrink-0" />
                <CardTitle className="text-rose-900 text-sm font-semibold">
                  Overdue Equipment Alert
                </CardTitle>
              </div>
              <Badge variant="overdue" dot>
                {overdueItems.length} Overdue
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
                  <TableHead>Due Date</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueItems.map((item) => (
                  <TableRow key={item._id} className="hover:bg-rose-50/20">
                    <TableCell>
                      <span className="font-mono tracking-tight text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.assetId}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 text-sm">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800">
                        {item.currentBorrower?.name || 'Assigned Borrower'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tracking-tight">
                        {item.currentBorrower?.identifier} • {item.currentBorrower?.department}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-rose-700 font-mono tracking-tight">
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
                        Return Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader className="flex items-center justify-between border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-600" />
            <span>Recent Store Operations</span>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/transactions')}
            className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            View All Desk Logs &rarr;
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Storekeeper</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableEmpty message="No recent transactions found." colSpan={6} />
              ) : (
                recentTransactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      <Badge
                        variant={
                          tx.type === 'ISSUE'
                            ? 'issued'
                            : tx.type === 'RETURN'
                            ? 'available'
                            : 'maintenance'
                        }
                        dot
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800 text-xs">
                        {tx.item?.name || 'Equipment'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tracking-tight">
                        {tx.item?.assetId}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {tx.person?.name ? (
                        <>
                          <span className="font-medium text-slate-800">{tx.person.name}</span>
                          <span className="text-slate-400 block text-[11px] font-mono tracking-tight">
                            {tx.person.identifier}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {tx.conditionAtEvent || 'GOOD'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {tx.performedBy?.username || 'Storekeeper'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono tracking-tight">
                      {new Date(tx.createdAt || tx.issueDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={fetchDashboardData}
        item={selectedReturnItem}
      />

      <IssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;
