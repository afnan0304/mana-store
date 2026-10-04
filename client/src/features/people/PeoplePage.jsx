import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';
import { getPeople } from '../../services/storeService';
import { UserPlus, Search, RefreshCw, Mail, Phone } from 'lucide-react';

export const PeoplePage = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchPeople();
  }, [typeFilter]);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const res = await getPeople({
        search: search.trim() || undefined,
        type: typeFilter || undefined,
      });
      setPeople(res.people || []);
    } catch (err) {
      console.error('Failed to load borrowers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPeople();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">People & Borrowers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registered students, faculty, and department staff with equipment borrowing privileges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPeople}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button size="sm" variant="primary" leftIcon={<UserPlus className="h-4 w-4" />}>
            Register Borrower
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, student ID, department, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
                <option value="FACULTY">Faculty</option>
                <option value="DEPARTMENT">Department</option>
              </select>

              <Button type="submit" size="sm" variant="secondary">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Borrowers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role / Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Active Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.length === 0 ? (
                <TableEmpty message="No borrowers found matching criteria." colSpan={7} />
              ) : (
                people.map((person) => (
                  <TableRow key={person._id}>
                    {/* Monospace Identifier */}
                    <TableCell>
                      <span className="font-mono tracking-tight text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {person.identifier}
                      </span>
                    </TableCell>

                    <TableCell className="font-semibold text-slate-900 text-sm">
                      {person.name}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {person.type}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {person.department}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {person.email && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{person.email}</span>
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {person.activeItemsCount || 0}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={person.status === 'ACTIVE' ? 'available' : 'damaged'}
                        dot
                      >
                        {person.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeoplePage;
