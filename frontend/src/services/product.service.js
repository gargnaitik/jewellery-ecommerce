import api from './api';

export const getProducts = (params) =>
    api.get('/products', { params });

export const getProductById = (id) =>
    api.get(`/products/${id}`);

export const getGoldRates = () =>
    api.get('/pricing/gold-rates');

export const calculatePrice = (data) =>
    api.post('/pricing/calculate', data);