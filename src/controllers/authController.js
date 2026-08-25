import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getFormattedDate } from '../utils/dateUtils.js';

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            profileType: user.profileType
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password, profileType, phoneNumber } = req.body;

        if (!name || !email || !password || !phoneNumber) {
            const error = new Error('Todos os campos obrigatórios devem ser preenchidos.')
            error.statusCode = 400;
            throw error;
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('Este e-mail já está cadastrado no sistema.')
            error.statusCode = 409;
            throw error;
        }

        if (password.length < 8) {
            const error = new Error('A senha deve ter no mínimo 8 caracteres.')
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profileType: profileType || 'client',
            phoneNumber,
            createdAt: getFormattedDate()
        });

        const token = generateToken(newUser);

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso.',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                profileType: newUser.profileType,
                phoneNumber: newUser.phoneNumber,
                createdAt: newUser.createdAt
            },
            redirectTo: newUser.profileType === 'host' ? '/host/dashboard' : '/client/dashboard'
        });
    } catch (error) {
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('E-mail e senha são obrigatórios.')
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('Credenciais inválidas.')
            error.statusCode = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Credenciais inválidas.')
            error.statusCode = 401;
            throw error;
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: 'Login realizado com sucesso.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileType: user.profileType
            },
            redirectTo: user.profileType === 'host' ? '/host/dashboard' : '/client/explore'
        });
    } catch (error) {
        return next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            const error = new Error('Usuário não encontrado.')
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({
            user,
            redirectTo: user.profileType === 'host' ? '/host/dashboard' : '/client/explore'
        });
    } catch (error) {
        return next(error);
    }
};