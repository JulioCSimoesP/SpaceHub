import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Formato de arquivo inválido. Apenas imagens JPEG, PNG e WebP são permitidas.');
        error.statusCode = 400;
        cb(error, false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter
});