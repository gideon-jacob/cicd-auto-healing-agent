import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (err instanceof AppError) {
        logger.warn(`AppError: ${err.message} (${err.statusCode})`);
        res.status(err.statusCode).json({
            error: {
                message: err.message,
                statusCode: err.statusCode,
            },
        });
        return;
    }

    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: {
            message: 'Internal server error',
            statusCode: 500,
        },
    });
}

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
