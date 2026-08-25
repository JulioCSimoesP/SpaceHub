import api from './api.js';

export const authService = {
    async register(userData) {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },

    async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    },

    async getMe() {
        const { data } = await api.get('/auth/me');
        return data;
    }
};