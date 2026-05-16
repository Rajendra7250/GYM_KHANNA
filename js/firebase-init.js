import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXq77yspmNv_IKo7V0_FGitFyxnWmjZKw",
  authDomain: "gymkhanna-b97cd.firebaseapp.com",
  projectId: "gymkhanna-b97cd",
  storageBucket: "gymkhanna-b97cd.firebasestorage.app",
  messagingSenderId: "189337533932",
  appId: "1:189337533932:web:be022f2531042d0e4c94c9",
  measurementId: "G-8WM2LCS215"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.FirebaseAPI = {
  auth, db, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc, getDoc
};

// Dispatch an event so other scripts know Firebase is ready
window.dispatchEvent(new Event('firebase-ready'));
