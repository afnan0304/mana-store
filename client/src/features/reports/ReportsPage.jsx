import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, Clock3, PackageCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LineChart, BarList, Donut, ColumnChart } from '../../components/ui/Charts';
import { activityLabels, activitySeries, monthlyOverdue, topBorrowedItems, departmentUsage, avgLoanDuration } from '../../data/mockData';

const statusMix = [
  { label: 'Available', value: 86, color: '#0f766e' },
  { label: 'Issued', value: 34, color: '#2563eb' },
  { label: 'Maintenance', value: 11, color: '#d97706' },
  { label: 'Retired', value: 4, color: '#94a3b8' },
];

export default function ReportsPage() {
  const [range, setRange] = useState('30');
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const rows = [['Metric', 'Value'], ['Circulation rate', '68%'], ['Average loan length', '4.8 days'], ['Items recovered', '94%']];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `northline-report-${range}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Operations intelligence</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Reports & analytics</h2>
          <p className="mt-1 text-sm text-slate-500">A clear read on circulation, demand, and asset health for the last 30 days.</p>
        </div>
        <div className="flex gap-2">
          <select value={range} onChange={(event) => setRange(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
          <Button size="sm" onClick={handleExport} leftIcon={<Download className="h-3.5 w-3.5" />}>{exported ? 'Exported' : 'Export report'}</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[['Circulation rate', '68%', '+8.4% vs last month', TrendingUp], ['Avg. loan length', '4.8d', 'Within target of 5 days', Clock3], ['Items recovered', '94%', 'Return compliance', PackageCheck]].map(([label, value, note, Icon]) => (
          <Card key={label} className="p-4">
            <div className="flex items-start justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><Icon className="h-4 w-4 text-teal-700" /></div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <Card>
          <CardHeader className="flex items-center justify-between border-b border-slate-100"><div><CardTitle>Issue and return activity</CardTitle><p className="mt-1 text-xs text-slate-500">Daily movement across the store desk</p></div><Badge variant="available" dot>Live sample</Badge></CardHeader>
          <CardContent><LineChart labels={activityLabels} series={activitySeries} height={250} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current asset mix</CardTitle><p className="mt-1 text-xs text-slate-500">132 catalogued items</p></CardHeader>
          <CardContent><Donut data={statusMix} size={150} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Most requested equipment</CardTitle></CardHeader><CardContent><BarList data={topBorrowedItems} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Borrowing by department</CardTitle></CardHeader><CardContent><BarList data={departmentUsage} unit=" loans" /></CardContent></Card>
        <Card><CardHeader><CardTitle>Overdue trend</CardTitle></CardHeader><CardContent><ColumnChart data={monthlyOverdue} color="#e11d48" height={190} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Average loan duration</CardTitle></CardHeader><CardContent><BarList data={avgLoanDuration.map((item) => ({ ...item, value: Number(item.value.toFixed(1)) }))} unit=" days" /></CardContent></Card>
      </div>
    </div>
  );
}
