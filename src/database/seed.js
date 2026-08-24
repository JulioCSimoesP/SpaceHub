// Script para preencher o Banco de Dados com dados de teste. EXECUTAR EM AMBIENTE DE DESENVOLVIMENTO APENAS.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Space from '../models/Space.js';
import Booking from '../models/Booking.js';
import { getFormattedDate } from '../utils/dateUtils.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('MongoDB Atlas conectado para execução do seed.');

        await Promise.all([
            User.deleteMany({}),
            Space.deleteMany({}),
            Booking.deleteMany({})
        ]);
        console.log('Coleções limpas com sucesso.');

        const defaultPasswordHash = await bcrypt.hash('SenhaForte@123', 10);

        const usersToCreate = [
            {
                name: 'Carlos Mendes',
                email: 'carlos.mendes@email.com',
                password: defaultPasswordHash,
                profileType: 'host',
                phoneNumber: '11987654321',
                createdAt: getFormattedDate()
            },
            {
                name: 'Mariana Vasconcelos',
                email: 'mariana.vasconcelos@email.com',
                password: defaultPasswordHash,
                profileType: 'host',
                phoneNumber: '21976543210',
                createdAt: getFormattedDate()
            },
            {
                name: 'Lucas Ferreira',
                email: 'lucas.ferreira@email.com',
                password: defaultPasswordHash,
                profileType: 'client',
                phoneNumber: '11912345678',
                createdAt: getFormattedDate()
            },
            {
                name: 'Beatriz Almeida',
                email: 'beatriz.almeida@email.com',
                password: defaultPasswordHash,
                profileType: 'client',
                phoneNumber: '31923456789',
                createdAt: getFormattedDate()
            }
        ];

        const [host1, host2, client1, client2] = await User.insertMany(usersToCreate);
        console.log('4 usuários criados com sucesso (2 hosts e 2 clients).');

        const spacesToCreate = [
            {
                host: host1._id,
                title: 'Estúdio Moderno na Vila Madalena',
                description: 'Espaço compacto e totalmente equipado no coração cultural da cidade, próximo ao metrô e cafés.',
                price: 18000,
                cleaningTax: 6000,
                serviceTax: 2500,
                politics: ['Proibido fumar', 'Silêncio após às 22h'],
                checkinTime: '14:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Elevador', 'TV'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/studio-vila-madalena-1.jpg', public_id: 'spaces/studio-vila-madalena-1' },
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/studio-vila-madalena-2.jpg', public_id: 'spaces/studio-vila-madalena-2' }
                ],
                locale: {
                    addressName: 'Rua Harmonia',
                    addressNumber: '320',
                    sublocality: 'Vila Madalena',
                    locality: 'São Paulo',
                    state: 'SP',
                    country: 'Brasil',
                    postalCode: '05435000',
                    geolocation: { type: 'Point', coordinates: [-46.6874, -23.5539] }
                }
            },
            {
                host: host1._id,
                title: 'Loft Executivo na Av. Paulista',
                description: 'Design industrial e sofisticado para viagens de negócios a passos das principais empresas e teatros.',
                price: 25000,
                cleaningTax: 8000,
                serviceTax: 3000,
                politics: ['Proibido festas ou eventos', 'Silêncio após às 22h'],
                checkinTime: '15:00',
                checkoutTime: '12:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Elevador', 'Segurança 24h', 'Acessibilidade'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/loft-paulista-1.jpg', public_id: 'spaces/loft-paulista-1' }
                ],
                locale: {
                    addressName: 'Avenida Paulista',
                    addressNumber: '1500',
                    sublocality: 'Bela Vista',
                    locality: 'São Paulo',
                    state: 'SP',
                    country: 'Brasil',
                    postalCode: '01310100',
                    geolocation: { type: 'Point', coordinates: [-46.6565, -23.5614] }
                }
            },
            {
                host: host1._id,
                title: 'Apartamento Conforto em Moema',
                description: 'Ambiente familiar e arborizado, a 10 minutos a pé do Parque Ibirapuera com vaga inclusa.',
                price: 22000,
                cleaningTax: 7000,
                serviceTax: 2000,
                politics: ['Proibido fumar', 'Proibido animais', 'Silêncio após às 22h'],
                checkinTime: '14:00',
                checkoutTime: '10:00',
                amenities: ['Wi-Fi', 'Estacionamento', 'Cozinha', 'Elevador', 'TV'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/apto-moema-1.jpg', public_id: 'spaces/apto-moema-1' }
                ],
                locale: {
                    addressName: 'Alameda dos Maracatins',
                    addressNumber: '450',
                    sublocality: 'Moema',
                    locality: 'São Paulo',
                    state: 'SP',
                    country: 'Brasil',
                    postalCode: '04089000',
                    geolocation: { type: 'Point', coordinates: [-46.6612, -23.6015] }
                }
            },
            {
                host: host1._id,
                title: 'Casa Espaçosa com Quintal em Pinheiros',
                description: 'Refúgio tranquilo no bairro mais gastronômico da cidade, perfeito para estadias prolongadas.',
                price: 34000,
                cleaningTax: 10000,
                serviceTax: 4000,
                politics: ['Proibido festas ou eventos', 'Silêncio após às 22h'],
                checkinTime: '15:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Estacionamento', 'Cozinha', 'Área para fumantes'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/casa-pinheiros-1.jpg', public_id: 'spaces/casa-pinheiros-1' }
                ],
                locale: {
                    addressName: 'Rua dos Pinheiros',
                    addressNumber: '890',
                    sublocality: 'Pinheiros',
                    locality: 'São Paulo',
                    state: 'SP',
                    country: 'Brasil',
                    postalCode: '05422000',
                    geolocation: { type: 'Point', coordinates: [-46.6853, -23.5678] }
                }
            },
            {
                host: host1._id,
                title: 'Studio Tech no Itaim Bibi',
                description: 'Ambiente automatizado com internet de altíssima velocidade para nômades digitais.',
                price: 21000,
                cleaningTax: 6500,
                serviceTax: 2500,
                politics: ['Proibido fumar', 'Proibido festas ou eventos'],
                checkinTime: '14:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Elevador', 'Segurança 24h'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/studio-itaim-1.jpg', public_id: 'spaces/studio-itaim-1' }
                ],
                locale: {
                    addressName: 'Rua Joaquim Floriano',
                    addressNumber: '240',
                    sublocality: 'Itaim Bibi',
                    locality: 'São Paulo',
                    state: 'SP',
                    country: 'Brasil',
                    postalCode: '04534000',
                    geolocation: { type: 'Point', coordinates: [-46.6781, -23.5836] }
                }
            },

            {
                host: host2._id,
                title: 'Apartamento Vista Mar em Copacabana',
                description: 'Localizado na quadra da praia, arejado e cercado de comércio, bares tradicionais e transporte.',
                price: 28000,
                cleaningTax: 9000,
                serviceTax: 3500,
                politics: ['Proibido fumar', 'Silêncio após às 22h'],
                checkinTime: '14:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Elevador', 'TV', 'Segurança 24h'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/copa-vista-mar-1.jpg', public_id: 'spaces/copa-vista-mar-1' }
                ],
                locale: {
                    addressName: 'Avenida Atlântica',
                    addressNumber: '2100',
                    sublocality: 'Copacabana',
                    locality: 'Rio de Janeiro',
                    state: 'RJ',
                    country: 'Brasil',
                    postalCode: '22041001',
                    geolocation: { type: 'Point', coordinates: [-43.1812, -22.9714] }
                }
            },
            {
                host: host2._id,
                title: 'Studio Charmoso em Ipanema',
                description: 'A duas quadras do Posto 9 com decoração praiana, ar condicionado potente e cozinha completa.',
                price: 31000,
                cleaningTax: 8500,
                serviceTax: 3800,
                politics: ['Proibido fumar', 'Proibido animais'],
                checkinTime: '15:00',
                checkoutTime: '12:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Cozinha', 'Elevador', 'TV'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/studio-ipanema-1.jpg', public_id: 'spaces/studio-ipanema-1' }
                ],
                locale: {
                    addressName: 'Rua Visconde de Pirajá',
                    addressNumber: '351',
                    sublocality: 'Ipanema',
                    locality: 'Rio de Janeiro',
                    state: 'RJ',
                    country: 'Brasil',
                    postalCode: '22410003',
                    geolocation: { type: 'Point', coordinates: [-43.2036, -22.9842] }
                }
            },
            {
                host: host2._id,
                title: 'Cobertura com Terraço no Leblon',
                description: 'Terraço privativo exclusivo, vista panorâmica e privacidade total no bairro nobre.',
                price: 52000,
                cleaningTax: 15000,
                serviceTax: 6000,
                politics: ['Proibido festas ou eventos', 'Silêncio após às 22h'],
                checkinTime: '15:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Estacionamento', 'Elevador', 'Segurança 24h'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/cobertura-leblon-1.jpg', public_id: 'spaces/cobertura-leblon-1' }
                ],
                locale: {
                    addressName: 'Avenida Delfim Moreira',
                    addressNumber: '700',
                    sublocality: 'Leblon',
                    locality: 'Rio de Janeiro',
                    state: 'RJ',
                    country: 'Brasil',
                    postalCode: '22441050',
                    geolocation: { type: 'Point', coordinates: [-43.2241, -22.9876] }
                }
            },
            {
                host: host2._id,
                title: 'Casarão Colonial em Santa Teresa',
                description: 'Arquitetura histórica e ambiente silencioso para quem busca inspiração artística e descanso.',
                price: 24000,
                cleaningTax: 8000,
                serviceTax: 2800,
                politics: ['Silêncio após às 22h', 'Proibido fumar'],
                checkinTime: '14:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Cozinha', 'Área para fumantes'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/santa-teresa-1.jpg', public_id: 'spaces/santa-teresa-1' }
                ],
                locale: {
                    addressName: 'Rua Paschoal Carlos Magno',
                    addressNumber: '115',
                    sublocality: 'Santa Teresa',
                    locality: 'Rio de Janeiro',
                    state: 'RJ',
                    country: 'Brasil',
                    postalCode: '20240290',
                    geolocation: { type: 'Point', coordinates: [-43.1856, -22.9213] }
                }
            },
            {
                host: host2._id,
                title: 'Flat Aconchegante em Botafogo',
                description: 'Próximo ao polo gastronômico e estação de metrô, com vista privilegiada para o Cristo.',
                price: 19500,
                cleaningTax: 6000,
                serviceTax: 2400,
                politics: ['Proibido fumar', 'Proibido festas ou eventos'],
                checkinTime: '14:00',
                checkoutTime: '11:00',
                amenities: ['Wi-Fi', 'Ar-condicionado', 'Elevador', 'TV', 'Acessibilidade'],
                images: [
                    { url: 'https://res.cloudinary.com/demo/image/upload/v1/spaces/flat-botafogo-1.jpg', public_id: 'spaces/flat-botafogo-1' }
                ],
                locale: {
                    addressName: 'Rua Voluntários da Pátria',
                    addressNumber: '180',
                    sublocality: 'Botafogo',
                    locality: 'Rio de Janeiro',
                    state: 'RJ',
                    country: 'Brasil',
                    postalCode: '22270010',
                    geolocation: { type: 'Point', coordinates: [-43.1895, -22.9518] }
                }
            }
        ];

        const insertedSpaces = await Space.insertMany(spacesToCreate);
        console.log('10 espaços criados com sucesso (5 para cada host).');

        const buildSpaceSnapshot = (spaceDoc) => ({
            spaceId: spaceDoc._id,
            title: spaceDoc.title,
            description: spaceDoc.description,
            price: spaceDoc.price,
            cleaningTax: spaceDoc.cleaningTax,
            serviceTax: spaceDoc.serviceTax,
            politics: spaceDoc.politics,
            checkinTime: spaceDoc.checkinTime,
            checkoutTime: spaceDoc.checkoutTime,
            amenities: spaceDoc.amenities,
            images: spaceDoc.images,
            locale: spaceDoc.locale
        });

        const bookingsToCreate = [
            {
                hostId: host1._id,
                guestId: client1._id,
                startDate: '01/10/2026',
                endDate: '05/10/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[0])
            },
            {
                hostId: host1._id,
                guestId: client2._id,
                startDate: '10/10/2026',
                endDate: '15/10/2026',
                status: 'pending',
                space: buildSpaceSnapshot(insertedSpaces[0])
            },
            {
                hostId: host1._id,
                guestId: client1._id,
                startDate: '02/11/2026',
                endDate: '07/11/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[1])
            },
            {
                hostId: host1._id,
                guestId: client2._id,
                startDate: '12/11/2026',
                endDate: '16/11/2026',
                status: 'canceled',
                space: buildSpaceSnapshot(insertedSpaces[2])
            },
            {
                hostId: host1._id,
                guestId: client1._id,
                startDate: '01/12/2026',
                endDate: '06/12/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[3])
            },

            {
                hostId: host2._id,
                guestId: client2._id,
                startDate: '05/10/2026',
                endDate: '10/10/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[5])
            },
            {
                hostId: host2._id,
                guestId: client1._id,
                startDate: '15/10/2026',
                endDate: '20/10/2026',
                status: 'pending',
                space: buildSpaceSnapshot(insertedSpaces[6])
            },
            {
                hostId: host2._id,
                guestId: client2._id,
                startDate: '01/11/2026',
                endDate: '05/11/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[7])
            },
            {
                hostId: host2._id,
                guestId: client1._id,
                startDate: '10/11/2026',
                endDate: '14/11/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[8])
            },
            {
                hostId: host2._id,
                guestId: client2._id,
                startDate: '20/11/2026',
                endDate: '25/11/2026',
                status: 'confirmed',
                space: buildSpaceSnapshot(insertedSpaces[9])
            }
        ];

        await Booking.insertMany(bookingsToCreate);
        console.log('10 reservas criadas com snapshots imutáveis e sem conflitos de datas.');

        console.log('Seed finalizado com 100% de sucesso!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(`Erro ao executar o seed: ${error.message}`);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();