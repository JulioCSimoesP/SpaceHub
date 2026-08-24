import Space from '../models/Space.js';
import { AMENITIES, POLITICS } from '../constants/spaceOptions.js';

export const getSpaceMetadata = async (req, res) => {
    return res.status(200).json({
        amenities: AMENITIES,
        politics: POLITICS
    });
};

export const listSpaces = async (req, res) => {
    try {
        const { minPrice, maxPrice, amenities, locality, state, lng, lat, maxDistanceKm } = req.query;
        const filter = {};

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseInt(minPrice, 10);
            if (maxPrice) filter.price.$lte = parseInt(maxPrice, 10);
        }

        if (amenities) {
            const amenitiesList = Array.isArray(amenities)
                ? amenities
                : amenities.split(',').map((item) => item.trim());
            filter.amenities = { $all: amenitiesList };
        }

        if (locality) {
            filter['locale.locality'] = { $regex: locality, $options: 'i' };
        }
        if (state) {
            filter['locale.state'] = { $regex: state, $options: 'i' };
        }

        if (lng && lat) {
            const parsedLng = parseFloat(lng);
            const parsedLat = parseFloat(lat);
            const distanceInMeters = (parseFloat(maxDistanceKm) || 10) * 1000;

            filter['locale.geolocation'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    $maxDistance: distanceInMeters
                }
            };
        }

        const spaces = await Space.find(filter).populate('host', 'name email phoneNumber');

        return res.status(200).json({
            total: spaces.length,
            spaces
        });
    } catch (error) {
        return res.status(500).json({ message: `Erro ao listar espaços: ${error.message}` });
    }
};

export const getMySpaces = async (req, res) => {
    try {
        const hostId = req.user.id;
        const spaces = await Space.find({ host: hostId });

        return res.status(200).json({
            total: spaces.length,
            spaces
        });
    } catch (error) {
        return res.status(500).json({ message: `Erro ao buscar seus espaços: ${error.message}` });
    }
};

export const getSpaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const space = await Space.findById(id).populate('host', 'name email phoneNumber');

        if (!space) {
            return res.status(404).json({ message: 'Espaço não encontrado.' });
        }

        return res.status(200).json(space);
    } catch (error) {
        return res.status(500).json({ message: `Erro ao buscar detalhes do espaço: ${error.message}` });
    }
};

export const createSpace = async (req, res) => {
    try {
        const hostId = req.user.id;
        const spaceData = { ...req.body, host: hostId };

        const newSpace = await Space.create(spaceData);

        return res.status(201).json({
            message: 'Espaço cadastrado com sucesso.',
            space: newSpace
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: messages.join(' ') });
        }
        return res.status(500).json({ message: `Erro ao cadastrar espaço: ${error.message}` });
    }
};

export const updateSpace = async (req, res) => {
    try {
        const { id } = req.params;
        const hostId = req.user.id;

        const space = await Space.findById(id);
        if (!space) {
            return res.status(404).json({ message: 'Espaço não encontrado.' });
        }

        if (space.host.toString() !== hostId) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar este espaço.' });
        }

        const updatedSpace = await Space.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            message: 'Espaço atualizado com sucesso.',
            space: updatedSpace
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: messages.join(' ') });
        }
        return res.status(500).json({ message: `Erro ao atualizar espaço: ${error.message}` });
    }
};

export const deleteSpace = async (req, res) => {
    try {
        const { id } = req.params;
        const hostId = req.user.id;

        const space = await Space.findById(id);
        if (!space) {
            return res.status(404).json({ message: 'Espaço não encontrado.' });
        }

        if (space.host.toString() !== hostId) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para excluir este espaço.' });
        }

        await Space.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Espaço removido com sucesso.' });
    } catch (error) {
        return res.status(500).json({ message: `Erro ao excluir espaço: ${error.message}` });
    }
};