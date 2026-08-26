import api from './api.js';

export const uploadService = {
    async uploadImages(files) {
        let formData;

        if (files instanceof FormData) {
            formData = files;
        } else {
            formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('images', file);
            });
        }

        const { data } = await api.post('/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    },

    async deleteImage(public_id) {
        const { data } = await api.delete('/uploads', { data: { public_id } });
        return data;
    }
};