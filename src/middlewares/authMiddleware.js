import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Acesso negado. Token de autenticação não fornecido ou formato inválido.');
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return next(error);
    }
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user || !allowedRoles.includes(req.user.profileType)) {
                const error = new Error('Acesso negado. Você não tem permissão para acessar este recurso.');
                error.statusCode = 403;
                throw error;
            }
            return next();
        } catch (error) {
            return next(error);
        }
    };
};