import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

interface ErrorResponse {
    status: string;
    message: string;
    details?: unknown;
}

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
): void => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const response: ErrorResponse = {
            status: 'error',
            message: 'Validation error',
            details: err.errors,
        };
        res.status(400).json(response);
        return;
    }

    // Handle custom application errors
    if (err instanceof AppError) {
        const response: ErrorResponse = {
            status: 'error',
            message: err.message,
            details: err.details,
        };
        res.status(err.statusCode).json(response);
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const response: ErrorResponse = {
            status: 'error',
            message: 'Database operation failed',
            details: err.message,
        };
        res.status(400).json(response);
        return;
    }

    // Handle unknown errors
    console.error('Unhandled error:', err);
    const response: ErrorResponse = {
        status: 'error',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    };
    res.status(500).json(response);
}; 