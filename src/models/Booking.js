import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'O ID do anfitrião é obrigatório.']
        },
        guestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'O ID do hóspede/cliente é obrigatório.']
        },
        startDate: {
            type: String,
            required: [true, 'A data de início da reserva é obrigatória.'],
            match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Formato de data de início inválido. Use DD/MM/AAAA.']
        },
        endDate: {
            type: String,
            required: [true, 'A data de término da reserva é obrigatória.'],
            match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Formato de data de término inválido. Use DD/MM/AAAA.']
        },
        status: {
            type: String,
            required: [true, 'O status da reserva é obrigatório.'],
            enum: {
                values: ['pending', 'confirmed', 'canceled'],
                message: '{VALUE} não é um status de reserva válido.'
            },
            default: 'pending'
        },
        space: {
            spaceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Space',
                required: [true, 'O ID original do espaço é obrigatório.']
            },
            title: {
                type: String,
                required: [true, 'O título do anúncio é obrigatório.'],
                trim: true
            },
            description: {
                type: String,
                required: [true, 'A descrição é obrigatória.'],
                trim: true
            },
            price: {
                type: Number,
                required: [true, 'O valor da diária é obrigatório.'],
                min: [0, 'O preço da diária não pode ser negativo.'],
                validate: {
                    validator: Number.isInteger,
                    message: '{VALUE} não é um valor inteiro. Armazene o valor monetário em centavos inteiros.'
                }
            },
            cleaningTax: {
                type: Number,
                required: [true, 'A taxa de limpeza é obrigatória.'],
                min: [0, 'A taxa de limpeza não pode ser negativa.'],
                default: 0,
                validate: {
                    validator: Number.isInteger,
                    message: '{VALUE} não é um valor inteiro. Armazene o valor monetário em centavos inteiros.'
                }
            },
            serviceTax: {
                type: Number,
                required: [true, 'A taxa de serviço é obrigatória.'],
                min: [0, 'A taxa de serviço não pode ser negativa.'],
                default: 0,
                validate: {
                    validator: Number.isInteger,
                    message: '{VALUE} não é um valor inteiro. Armazene o valor monetário em centavos inteiros.'
                }
            },
            politics: {
                type: [String],
                default: []
            },
            checkinTime: {
                type: String,
                required: [true, 'O horário de check-in é obrigatório.'],
                match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora de check-in inválido. Use HH:MM.']
            },
            checkoutTime: {
                type: String,
                required: [true, 'O horário de check-out é obrigatório.'],
                match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora de check-out inválido. Use HH:MM.']
            },
            amenities: {
                type: [String],
                default: []
            },
            images: [
                {
                    url: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    public_id: {
                        type: String,
                        required: true,
                        trim: true
                    }
                }
            ],
            locale: {
                addressName: {
                    type: String,
                    required: true,
                    trim: true
                },
                addressNumber: {
                    type: String,
                    required: true,
                    trim: true
                },
                sublocality: {
                    type: String,
                    required: true,
                    trim: true
                },
                locality: {
                    type: String,
                    required: true,
                    trim: true
                },
                state: {
                    type: String,
                    required: true,
                    trim: true
                },
                country: {
                    type: String,
                    required: true,
                    default: 'Brasil',
                    trim: true
                },
                postalCode: {
                    type: String,
                    required: true,
                    trim: true
                },
                geolocation: {
                    type: {
                        type: String,
                        enum: ['Point'],
                        default: 'Point'
                    },
                    coordinates: {
                        type: [Number]
                    }
                }
            }
        }
    },
    {
        versionKey: false
    }
);

bookingSchema.index({ hostId: 1 });
bookingSchema.index({ guestId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;