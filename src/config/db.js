import mongoose from 'mongoose';

const connectDB = async () => {
    mongoose.connection.once('open', () => {
        console.log('MongoDB Atlas: Conexão estabelecida com sucesso.');
    });

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB Atlas: Erro na conexão -> ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB Atlas: Desconectado. Tentando reconectar...');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB Atlas: Reconectado com sucesso.');
    });

    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB Atlas: Conexão encerrada pelo encerramento da aplicação (SIGINT).');
        process.exit(0);
    });

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
    } catch (error) {
        console.error(`MongoDB Atlas: Falha crítica na conexão inicial -> ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;