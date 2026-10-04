// Demo data for views with no backend endpoint yet (trend charts, user admin).
// Replace with API calls when the corresponding endpoints exist.

const dayLabel = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const issuedSeries = [4, 6, 5, 9, 7, 3, 2, 8, 10, 7, 6, 11, 9, 5, 4, 7, 12, 10, 8, 6, 3, 9, 11, 13, 9, 7, 5, 8, 10, 12];
const returnedSeries = [3, 4, 6, 7, 6, 4, 2, 6, 8, 8, 5, 9, 9, 6, 3, 6, 9, 10, 8, 7, 4, 7, 9, 11, 10, 8, 4, 6, 9, 10];

export const activityLabels = issuedSeries.map((_, i) => dayLabel(issuedSeries.length - 1 - i));
export const activitySeries = [
  { name: 'Issued', color: '#4f46e5', data: issuedSeries },
  { name: 'Returned', color: '#10b981', data: returnedSeries },
];

export const monthlyOverdue = [
  { label: 'May', value: 6 },
  { label: 'Jun', value: 9 },
  { label: 'Jul', value: 4 },
  { label: 'Aug', value: 11 },
  { label: 'Sep', value: 7 },
  { label: 'Oct', value: 5 },
];

export const topBorrowedItems = [
  { label: 'Projector (Epson EB-X41)', value: 38 },
  { label: 'Cricket Kit Bag', value: 31 },
  { label: 'Digital Multimeter', value: 27 },
  { label: 'Air Blower 2HP', value: 22 },
  { label: 'Soldering Station', value: 19 },
  { label: 'Football (Size 5)', value: 15 },
];

export const departmentUsage = [
  { label: 'Physical Education', value: 64 },
  { label: 'Electronics', value: 52 },
  { label: 'Mechanical', value: 41 },
  { label: 'Computer Science', value: 33 },
  { label: 'Library', value: 12 },
];

export const avgLoanDuration = [
  { label: 'Sports', value: 3.2 },
  { label: 'Electronics', value: 5.8 },
  { label: 'Tools', value: 2.4 },
  { label: 'Lab', value: 6.7 },
  { label: 'Books', value: 14.1 },
];

export const mockUsers = [
  { id: 'u1', username: 'admin', email: 'admin@mana.store', role: 'ADMIN', isActive: true, lastLogin: '2 min ago' },
  { id: 'u2', username: 'storekeeper', email: 'storekeeper@mana.store', role: 'STOREKEEPER', isActive: true, lastLogin: '1 hr ago' },
  { id: 'u3', username: 'r.nair', email: 'r.nair@mana.store', role: 'STOREKEEPER', isActive: true, lastLogin: 'Yesterday' },
  { id: 'u4', username: 'a.khan', email: 'a.khan@mana.store', role: 'VIEWER', isActive: true, lastLogin: '3 days ago' },
  { id: 'u5', username: 'j.thomas', email: 'j.thomas@mana.store', role: 'VIEWER', isActive: false, lastLogin: '41 days ago' },
];
