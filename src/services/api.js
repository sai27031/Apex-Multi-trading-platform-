import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const clientService = {
  getSummary: () => api.get('/clients/summary'),
  getAllClients: () => api.get('/clients'),
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (data) => api.post('/clients', data),
  executeTrade: (id, tradeData) => api.post(`/clients/${id}/trade`, tradeData)
};

export const tradingService = {
  getTickers: () => api.get('/trading/tickers'),
  getOrders: () => api.get('/trading/orders'),
  placeOrder: (orderData) => api.post('/trading/orders', orderData),
  getOrderBook: (symbol) => api.get(`/trading/orderbook/${symbol}`)
};

export const aiService = {
  getStockPicks: () => api.get('/ai/picks'),
  sendChatMessage: (message, context) => api.post('/ai/chat', { message, context })
};

export const ipoService = {
  getIpos: (status) => api.get('/ipos', { params: status ? { status } : {} }),
  applyIpo: (id, bidData) => api.post(`/ipos/${id}/bid`, bidData)
};

export const newsService = {
  getNews: (category, search) => api.get('/news', { params: { category, search } })
};

export default api;
