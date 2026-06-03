import api from './api';

export const register = (data) =>
    api.post('/auth/register', data);

export const login = (data) =>
    api.post('/auth/login', data);

export const sendOTP = (phone) =>
    api.post('/auth/send-otp', { phone });

export const verifyOTP = (data) =>
    api.post('/auth/verify-otp', data);

export const getMe = () =>
    api.get('/auth/me');

export const logout = () =>
    api.post('/auth/logout');

export const forgotPassword = (email) =>
    api.post('/auth/forgot-password', { email });

export const resetPassword = ({ email, otp, newPassword }) =>
    api.post('/auth/reset-password', { email, otp, newPassword });