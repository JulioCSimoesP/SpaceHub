import api from './api.js';

export const bookingService = {
    async createBooking({ spaceId, startDate, endDate }) {
        const { data } = await api.post('/bookings', { spaceId, startDate, endDate });
        return data;
    },

    async listMyBookings() {
        const { data } = await api.get('/bookings');
        return data;
    },

    async getBookingById(id) {
        const { data } = await api.get(`/bookings/${id}`);
        return data;
    }
};