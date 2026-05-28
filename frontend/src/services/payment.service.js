import api from './api';

export const initiatePayment = (orderId) =>
    api.post('/payments/initiate', { order_id: orderId });

export const verifyPayment = (data) =>
    api.post('/payments/verify', data);