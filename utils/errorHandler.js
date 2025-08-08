class AppError extends Error {
    constructor(message, statusCode = 500, errors = undefined) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'AppError';
    }
}

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            errors: err.errors || undefined
        });
    }

    console.error(err);
    res.status(500).json({
        status: 500,
        message: "Erro interno do servidor"
    });
}


module.exports = {
    AppError,
    errorHandler
};