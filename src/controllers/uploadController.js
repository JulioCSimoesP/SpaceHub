import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = (fileBuffer, folder = 'spacehub/spaces') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        stream.end(fileBuffer);
    });
};

export const uploadImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            const error = new Error('Nenhum arquivo de imagem foi enviado.')
            error.statusCode = 400;
            throw error;
        }

        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
        const uploadedImages = await Promise.all(uploadPromises);

        return res.status(200).json({
            message: 'Imagens enviadas com sucesso.',
            images: uploadedImages
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteImage = async (req, res, next) => {
    try {
        const { public_id } = req.body;

        if (!public_id) {
            const error = new Error('O public_id da imagem é obrigatório.')
            error.statusCode = 400;
            throw error;
        }

        await cloudinary.uploader.destroy(public_id);

        return res.status(200).json({ message: 'Imagem excluída com sucesso do Cloudinary.' });
    } catch (error) {
        return next(error);
    }
};