import Booking from '../models/Booking.js';
import Space from '../models/Space.js';
import { parseDateString, isOverlapping } from '../utils/dateUtils.js';

export const createBooking = async (req, res, next) => {
    try {
        const guestId = req.user.id;
        const { spaceId, startDate, endDate } = req.body;

        if (!spaceId || !startDate || !endDate) {
            const error = new Error('O ID do espaço, data de início e data de término são obrigatórios.')
            error.statusCode = 400;
            throw error;
        }

        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            const error = new Error('Formato de data inválido. Use DD/MM/AAAA.')
            error.statusCode = 400;
            throw error;
        }

        const start = parseDateString(startDate);
        const end = parseDateString(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            const error = new Error('A data de início da reserva não pode ser no passado.')
            error.statusCode = 400;
            throw error;
        }

        if (end <= start) {
            const error = new Error('A data de término deve ser posterior à data de início.')
            error.statusCode = 400;
            throw error;
        }

        const space = await Space.findById(spaceId);
        if (!space) {
            const error = new Error('Espaço solicitado para reserva não foi encontrado.')
            error.statusCode = 404;
            throw error;
        }

        const existingBookings = await Booking.find({
            'space.spaceId': spaceId,
            status: { $in: ['pending', 'confirmed'] }
        });

        const hasConflict = existingBookings.some((booking) => {
            const existingStart = parseDateString(booking.startDate);
            const existingEnd = parseDateString(booking.endDate);
            return isOverlapping(start, end, existingStart, existingEnd);
        });

        if (hasConflict) {
            const error = new Error('O espaço já possui uma reserva confirmada ou pendente no período selecionado.')
            error.statusCode = 409;
            throw error;
        }

        const spaceSnapshot = {
            spaceId: space._id,
            title: space.title,
            description: space.description,
            price: space.price,
            cleaningTax: space.cleaningTax,
            serviceTax: space.serviceTax,
            politics: space.politics,
            checkinTime: space.checkinTime,
            checkoutTime: space.checkoutTime,
            amenities: space.amenities,
            images: space.images,
            locale: space.locale
        };

        const newBooking = await Booking.create({
            hostId: space.host,
            guestId: guestId,
            startDate,
            endDate,
            status: 'confirmed',
            space: spaceSnapshot
        });

        return res.status(201).json({
            message: 'Reserva realizada com sucesso.',
            booking: newBooking
        });
    } catch (error) {
        return next(error);
    }
};

export const listMyBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profileType = req.user.profileType;

        let query = {};

        if (profileType === 'client') {
            query.guestId = userId;
        } else if (profileType === 'host') {
            query.hostId = userId;
        } else {
            const error = new Error('Perfil não autorizado.')
            error.statusCode = 403;
            throw error;
        }

        const bookings = await Booking.find(query)
            .populate('hostId', 'name email phoneNumber')
            .populate('guestId', 'name email phoneNumber')
            .sort({ _id: -1 });

        return res.status(200).json({
            total: bookings.length,
            bookings
        });
    } catch (error) {
        return next(error);
    }
};

export const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findById(id)
            .populate('hostId', 'name email phoneNumber')
            .populate('guestId', 'name email phoneNumber');

        if (!booking) {
            const error = new Error('Reserva não encontrada.')
            error.statusCode = 404;
            throw error;
        }

        const isGuest = booking.guestId._id.toString() === userId;
        const isHost = booking.hostId._id.toString() === userId;

        if (!isGuest && !isHost) {
            const error = new Error('Acesso negado. Você não tem permissão para visualizar esta reserva.')
            error.statusCode = 403;
            throw error;
        }

        return res.status(200).json(booking);
    } catch (error) {
        return next(error);
    }
};