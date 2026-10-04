import api from './api';

// ==================== DASHBOARD SERVICES ====================
export const getDashboardMetrics = async () => {
  return await api.get('/dashboard/metrics');
};

export const getAuditLogs = async (params = {}) => {
  return await api.get('/dashboard/audit-logs', { params });
};

// ==================== INVENTORY SERVICES ====================
export const getItems = async (params = {}) => {
  return await api.get('/items', { params });
};

export const getItemById = async (id) => {
  return await api.get(`/items/${id}`);
};

export const createItem = async (itemData) => {
  return await api.post('/items', itemData);
};

export const getCategories = async () => {
  return await api.get('/items/categories');
};

// ==================== PEOPLE SERVICES ====================
export const getPeople = async (params = {}) => {
  return await api.get('/people', { params });
};

export const getPersonById = async (id) => {
  return await api.get(`/people/${id}`);
};

export const createPerson = async (personData) => {
  return await api.post('/people', personData);
};

// ==================== TRANSACTION SERVICES ====================
export const issueItem = async ({
  itemId,
  personId,
  expectedReturnDate,
  purpose,
  condition,
  remarks,
}) => {
  return await api.post('/transactions/issue', {
    itemId,
    personId,
    expectedReturnDate,
    purpose,
    condition,
    remarks,
  });
};

export const returnItem = async ({
  itemId,
  returnCondition,
  remarks,
  sendToMaintenance,
}) => {
  return await api.post('/transactions/return', {
    itemId,
    returnCondition,
    remarks,
    sendToMaintenance,
  });
};

export const getOverdueItems = async () => {
  return await api.get('/transactions/overdue');
};

export const getTransactions = async (params = {}) => {
  return await api.get('/transactions', { params });
};

export default {
  getDashboardMetrics,
  getAuditLogs,
  getItems,
  getItemById,
  createItem,
  getCategories,
  getPeople,
  getPersonById,
  createPerson,
  issueItem,
  returnItem,
  getOverdueItems,
  getTransactions,
};
