import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Auth, Firestore and Providers
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard OAuth Scopes
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.me.readonly");
