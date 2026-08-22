import mongoose from 'mongoose';
import { getFormattedDate } from '../utils/dateUtils.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'O nome é obrigatório.'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'O e-mail é obrigatório.'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Por favor, informe um e-mail válido.']
        },
        password: {
            type: String,
            required: [true, 'A senha é obrigatória.'],
            minlength: [8, 'A senha deve ter no mínimo 8 caracteres.']
        },
        profileType: {
            type: String,
            required: [true, 'O tipo de perfil é obrigatório.'],
            enum: {
                values: ['client', 'host'],
                message: '{VALUE} não é um tipo de perfil válido.'
            },
            default: 'client'
        },
        phoneNumber: {
            type: String,
            required: [true, 'O telefone é obrigatório.'],
            trim: true,
            match: [
                /^[1-9]{2}(?:[2-8][0-9]{7}|9[1-9][0-9]{7})$/,
                'O número de telefone deve conter apenas números com DDD (10 dígitos para fixo ou 11 para celular).'
            ]
        },
        createdAt: {
            type: String,
            default: () => getFormattedDate(),
            match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Formato de data inválido. Use DD/MM/AAAA.']
        }
    },
    {
        versionKey: false
    }
);

const User = mongoose.model('User', userSchema);

export default User;