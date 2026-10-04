import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { getItems, getCategories } from '../../services/storeService';
import IssueModal from '../transactions/IssueModal';
import ReturnModal from '../transactions/ReturnModal';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const InventoryListPage = () => {
  const navigate = useNavigate();

  // Data state
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal states
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [activeItemForAction, setActiveItemForAction] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems(1);
  }, [statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getItems({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });

      setItems(res.items || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  const handleOpenIssue = (item) => {
    setActiveItemForAction(item);
    setIssueModalOpen(true);
  };

  const handleOpenReturn = (item) => {
    setActiveItemForAction(item);
    setReturnModalOpen(true);
  };

  // Helper rendering semantic status badge with dot indicators
  const renderStatusBadge = (item) => {
    const isOverdue =
      item.status === 'ISSUED' &&
      item.currentExpectedReturnDate &&
      new Date(item.currentExpectedReturnDate) < new Date();

    if (isOverdue) {
      return (
        <Badge variant="overdue" dot className="animate-pulse">
          Overdue
        </Badge>
      );
    }

    switch (item.status) {
      case 'AVAILABLE':
        return <Badge variant="available" dot>Available</Badge>;
      case 'ISSUED':
        return <Badge variant="issued" dot>Issued</Badge>;
      case 'UNDER_MAINTENANCE':
        return <Badge variant="maintenance" dot>Maintenance</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Equipment Inventory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Store catalog, asset locations, and real-time equipment availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchItems(pagination.page)}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/items/new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Item
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleOpenIssue(null)}
            leftIcon={<ArrowUpRight className="h-4 w-4" />}
          >
            Issue Item
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Asset ID, equipment name, or serial number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ISSUED">Issued</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="DAMAGED">Damaged</option>
                <option value="LOST">Lost</option>
                <option value="RETIRED">Retired</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Button type="submit" size="sm" variant="secondary">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Holder</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableEmpty message="No equipment items match the current filters." colSpan={7} />
              ) : (
                items.map((item) => {
                  const borrower = item.currentBorrower;
                  const isAvailable = item.status === 'AVAILABLE';
                  const isIssued = item.status === 'ISSUED';

                  return (
                    <TableRow key={item._id}>
                      {/* Monospace for Asset ID */}
                      <TableCell>
                        <span className="font-mono tracking-tight text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.assetId}
                        </span>
                      </TableCell>

                      {/* Equipment Name & Location */}
                      <TableCell>
                        <div
                          onClick={() => navigate(`/items/${item._id}`)}
                          className="font-medium text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                        >
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Loc: <span className="text-slate-600">{item.currentLocation || 'Main Store'}</span>
                          {item.serialNumber && (
                            <span className="ml-2 font-mono text-[10px] text-slate-400">
                              SN: {item.serialNumber}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="text-slate-600 text-xs">
                        {item.category?.name || 'Uncategorized'}
                      </TableCell>

                      {/* Condition */}
                      <TableCell>
                        <span className="text-xs font-medium text-slate-600">
                          {item.condition}
                        </span>
                      </TableCell>

                      {/* Semantic Status Badge with dot */}
                      <TableCell>{renderStatusBadge(item)}</TableCell>

                      {/* Current Holder with Monospace ID */}
                      <TableCell>
                        {borrower ? (
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {borrower.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
                              {borrower.identifier}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>

                      {/* Action Hierarchy */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Primary on available: Solid Issue button */}
                          {isAvailable && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenIssue(item)}
                              leftIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                              className="text-xs px-2.5 py-1"
                            >
                              Issue
                            </Button>
                          )}

                          {/* Primary on issued: Outline Return button */}
                          {isIssued && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReturn(item)}
                              leftIcon={<ArrowDownLeft className="h-3.5 w-3.5 text-slate-600" />}
                              className="text-xs px-2.5 py-1"
                            >
                              Return
                            </Button>
                          )}

                          {/* Secondary action: Ghost History / Detail button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/items/${item._id}`)}
                            title="View Lifecycle History"
                            className="p-1.5 text-slate-400 hover:text-slate-700"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>
                Showing page <strong className="text-slate-700">{pagination.page}</strong> of{' '}
                <strong className="text-slate-700">{pagination.totalPages}</strong> (
                {pagination.total} total items)
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => fetchItems(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasNextPage}
                  onClick={() => fetchItems(pagination.page + 1)}
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
        onSuccess={() => fetchItems(pagination.page)}
        preselectedItemId={activeItemForAction?._id}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={() => fetchItems(pagination.page)}
        item={activeItemForAction}
      />
    </div>
  );
};

export default InventoryListPage;
