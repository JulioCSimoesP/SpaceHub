export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `A rota '${req.originalUrl}' não foi encontrada neste servidor.`
    });
};

export const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Erro interno no servidor.';

    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'O arquivo enviado excede o limite máximo permitido de 5MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Quantidade de arquivos enviados acima do permitido ou nome de campo incorreto.';
        } else {
            message = `Erro no upload de arquivos: ${err.message}`;
        }
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(' ');
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Recurso não encontrado com o ID informado: '${err.value}'.`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `O valor informado para o campo '${field}' já está em uso.`;
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token de autenticação inválido ou corrompido.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token de autenticação expirado. Faça login novamente.';
    }

    if (statusCode === 500) {
        console.error('❌ [ERRO INESPERADO]:', err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};