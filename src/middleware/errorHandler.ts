import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';

interface ErrorResponse {
    status: 'error';
    message: string;
    code?: string;
    details?: unknown;
}

export function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    console.error('Error:', error);

    const response: ErrorResponse = {
        status: 'error',
        message: 'Internal server error',
    };

    if (error instanceof ZodError) {
        response.message = 'Validation error';
        response.code = 'VALIDATION_ERROR';
        response.details = error.errors;
        res.status(400).json(response);
        return;
    }

    if (error instanceof ValidationError) {
        response.message = error.message;
        response.code = 'VALIDATION_ERROR';
        res.status(400).json(response);
        return;
    }

    if (error instanceof NotFoundError) {
        response.message = error.message;
        response.code = 'NOT_FOUND';
        res.status(404).json(response);
        return;
    }

    if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                response.message = 'Unique constraint violation';
                response.code = 'UNIQUE_VIOLATION';
                res.status(409).json(response);
                return;
            case 'P2025':
                response.message = 'Record not found';
                response.code = 'NOT_FOUND';
                res.status(404).json(response);
                return;
            default:
                response.message = 'Database error';
                response.code = 'DATABASE_ERROR';
                res.status(500).json(response);
                return;
        }
    }

    if (error instanceof AppError) {
        response.message = error.message;
        response.code = error.code;
        res.status(error.statusCode).json(response);
        return;
    }

    // Default error response
    res.status(500).json(response);
} 