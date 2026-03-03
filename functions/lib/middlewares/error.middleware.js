"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const AppError_1 = require("../shared/errors/AppError");
function errorMiddleware(error, req, res, next) {
    if (error instanceof AppError_1.AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }
    console.error("🔥 Unexpected Error:", error);
    return res.status(500).json({
        message: "Erro interno do servidor.",
    });
}
//# sourceMappingURL=error.middleware.js.map