"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
const admin = __importStar(require("firebase-admin"));
// import { seedAuthUsers } from "./seed/auth.seed";
// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDtjzpZqtvLfaeosvgnHZvPKMDEV-xTivo",
//   authDomain: "minhaagenda-ferias.firebaseapp.com",
//   projectId: "minhaagenda-ferias",
//   storageBucket: "minhaagenda-ferias.firebasestorage.app",
//   messagingSenderId: "791586289938",
//   appId: "1:791586289938:web:32a905e4a5efe76c441bcb",
// };
// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// ✅ inicializa UMA vez
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.db = admin.firestore();
exports.auth = admin.auth();
// console.log('chegou aqui no seeeeed....');
// console.log(process.env.FUNCTIONS_EMULATOR === "true");
// // 🔥 roda apenas no emulador
// if (process.env.FUNCTIONS_EMULATOR === "true") {
//   seedAuthUsers()
//     .then(() => console.log("🔥 Seed de Auth concluído"))
//     .catch(console.error);
// }
//# sourceMappingURL=firebase.js.map