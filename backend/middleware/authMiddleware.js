import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse.js';

export const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return next(new ErrorResponse('Not authorized, token failed', 401));
        }
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized, no token', 401));
    }
};