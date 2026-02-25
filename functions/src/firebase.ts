// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
import * as admin from "firebase-admin";
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

export const db = admin.firestore();
export const auth = admin.auth();

// console.log('chegou aqui no seeeeed....');
// console.log(process.env.FUNCTIONS_EMULATOR === "true");
// // 🔥 roda apenas no emulador
// if (process.env.FUNCTIONS_EMULATOR === "true") {
//   seedAuthUsers()
//     .then(() => console.log("🔥 Seed de Auth concluído"))
//     .catch(console.error);
// }
