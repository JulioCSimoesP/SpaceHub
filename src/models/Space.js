import mongoose from 'mongoose';

const spaceSchema = new mongoose.Schema(
    {
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'O anfitrião (host) é obrigatório.']
        },
        title: {
            type: String,
            required: [true, 'O título do anúncio é obrigatório.'],
            trim: true,
            maxlength: [100, 'O título não pode ultrapassar 100 caracteres.']
        },
        description: {
            type: String,
            required: [true, 'A descrição é obrigatória.'],
            trim: true,
            maxlength: [500, 'A descrição não pode ultrapassar 500 caracteres.']
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
            default: [],
            enum: {
                values: [
                    'Proibido fumar',
                    'Proibido animais',
                    'Proibido festas ou eventos',
                    'Silêncio após às 22h',
                ],
                message: '{VALUE} não é uma regra/política válida.'
            }
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
            default: [],
            enum: {
                values: [
                    'Wi-Fi',
                    'Ar-condicionado',
                    'Estacionamento',
                    'Elevador',
                    'Cozinha',
                    'Acessibilidade',
                    'Segurança 24h',
                    'Área para fumantes',
                    'TV'
                ],
                message: '{VALUE} não é uma comodidade válida.'
            }
        },
        images: {
            type: [
                {
                    url: {
                        type: String,
                        required: [true, 'A URL da imagem é obrigatória.'],
                        trim: true
                    },
                    public_id: {
                        type: String,
                        required: [true, 'O public_id do Cloudinary é obrigatório.'],
                        trim: true
                    }
                }
            ],
            required: [true, 'Pelo menos uma imagem é obrigatória.'],
            validate: [array => array.length > 0, 'Adicione ao menos uma imagem para o anúncio.']
        },
        locale: {
            addressName: {
                type: String,
                required: [true, 'O nome do logradouro/rua é obrigatório.'],
                trim: true
            },
            addressNumber: {
                type: String,
                required: [true, 'O número do endereço é obrigatório.'],
                trim: true
            },
            sublocality: {
                type: String,
                required: [true, 'O bairro é obrigatório.'],
                trim: true
            },
            locality: {
                type: String,
                required: [true, 'A cidade é obrigatória.'],
                trim: true
            },
            state: {
                type: String,
                required: [true, 'O estado/UF é obrigatório.'],
                trim: true
            },
            country: {
                type: String,
                required: [true, 'O país é obrigatório.'],
                default: 'Brasil',
                trim: true
            },
            postalCode: {
                type: String,
                required: [true, 'O CEP é obrigatório.'],
                trim: true,
                match: [/^\d{8}$/, 'O CEP deve conter exatamente 8 dígitos numéricos.']
            },
            geolocation: {
                type: {
                    type: String,
                    enum: ['Point'],
                    required: true,
                    default: 'Point'
                },
                coordinates: {
                    type: [Number],
                    required: [true, 'As coordenadas geográficas são obrigatórias.'],
                    validate: [
                        val => val.length === 2,
                        'As coordenadas devem conter exatamente 2 valores: [Longitude, Latitude].'
                    ]
                }
            }
        }
    },
    {
        versionKey: false
    }
);

spaceSchema.index({ 'locale.geolocation': '2dsphere' });

const Space = mongoose.model('Space', spaceSchema);

export default Space;