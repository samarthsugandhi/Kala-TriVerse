import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvuSuQIIWxNnHJFCgTbTk5y1gDtOCHZYQ",
  authDomain: "tracksaveinvest-c7b66.firebaseapp.com",
  projectId: "tracksaveinvest-c7b66",
  storageBucket: "tracksaveinvest-c7b66.firebasestorage.app",
  messagingSenderId: "939542495904",
  appId: "1:939542495904:web:e13bd416ac3f83d3b63fc5",
  measurementId: "G-DG919TP5ZW",
};

import { getAuth } from "firebase/auth";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
