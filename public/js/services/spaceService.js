import api from './api.js';

export const spaceService = {
    async getMetadata() {
        const { data } = await api.get('/spaces/metadata');
        return data;
    },

    async listSpaces(params = {}) {
        const { data } = await api.get('/spaces', { params });
        return data;
    },

    async getMySpaces() {
        const { data } = await api.get('/spaces/my-spaces');
        return data;
    },

    async getSpaceById(id) {
        const { data } = await api.get(`/spaces/${id}`);
        return data;
    },

    async createSpace(spaceData) {
        const { data } = await api.post('/spaces', spaceData);
        return data;
    },

    async updateSpace(id, spaceData) {
        const { data } = await api.put(`/spaces/${id}`, spaceData);
        return data;
    },

    async deleteSpace(id) {
        const { data } = await api.delete(`/spaces/${id}`);
        return data;
    }
};