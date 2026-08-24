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

export const register = async (req, res) => {
    try {
        const { name, email, password, profileType, phoneNumber } = req.body;

        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado no sistema.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
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
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(' ') });
        }

        return res.status(500).json({ message: `Erro interno ao cadastrar usuário: ${error.message}` });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
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
        return res.status(500).json({ message: `Erro interno no servidor: ${error.message}` });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.status(200).json({
            user,
            redirectTo: user.profileType === 'host' ? '/host/dashboard' : '/client/explore'
        });
    } catch (error) {
        return res.status(500).json({ message: `Erro interno no servidor: ${error.message}` });
    }
};