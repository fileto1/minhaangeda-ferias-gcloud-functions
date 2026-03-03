"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const firestore_1 = require("firebase-admin/firestore");
class DateUtils {
    /**
     * Converte string | Date | Dayjs para Firestore Timestamp
     */
    static toTimestamp(value, normalize = true) {
        const d = (0, dayjs_1.default)(value);
        const normalized = normalize ? d.startOf("day") : d;
        return firestore_1.Timestamp.fromDate(normalized.toDate());
    }
    /**
     * Converte Timestamp para Dayjs
     */
    static toDayjs(timestamp) {
        if (!timestamp)
            return undefined;
        return (0, dayjs_1.default)(timestamp.toDate());
    }
    /**
     * Converte Timestamp para Dayjs no StartOfDay
     */
    static toDayjsStartOfDay(timestamp) {
        return (0, dayjs_1.default)(timestamp.toDate()).startOf("day");
    }
    /**
     * Converte Timestamp para YYYY-MM-DD
     */
    static toISO(timestamp) {
        if (!timestamp)
            return undefined;
        return (0, dayjs_1.default)(timestamp.toDate()).format("YYYY-MM-DD");
    }
    /**
     * Cria range de Timestamp
     */
    static toRange(start, end) {
        return {
            start: this.toTimestamp(start),
            end: this.toTimestamp(end),
        };
    }
    static isSameTimestamp(a, b) {
        if (!a || !b)
            return a === b;
        return a.toMillis() === b.toMillis();
    }
}
exports.DateUtils = DateUtils;
//# sourceMappingURL=date.utils.js.map