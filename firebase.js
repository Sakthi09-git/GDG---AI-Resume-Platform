// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase JS SDK v7.20.0
const firebaseConfig = {
  apiKey: "AIzaSyAtyOdKk_wdRTopB8gymeIvxEIoE5qDohU",
  authDomain: "ai-resume-platform-aa7ec.firebaseapp.com",
  projectId: "ai-resume-platform-aa7ec",
  storageBucket: "ai-resume-platform-aa7ec.firebasestorage.app",
  messagingSenderId: "700791652758",
  appId: "1:700791652758:web:019c343979b96d30645db7",
  measurementId: "G-EZVNKR561Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, addDoc, collection };