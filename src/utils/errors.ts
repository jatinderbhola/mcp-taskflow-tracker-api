export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true,
        public details?: unknown,
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(400, message, true, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(401, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string) {
        super(403, message);
    }
} 