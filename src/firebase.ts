// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtrTWcijATOER6k3GKJgoFE8EkQZdeLK8",
  authDomain: "cronograma-proyecto.firebaseapp.com",
  projectId: "cronograma-proyecto",
  storageBucket: "cronograma-proyecto.firebasestorage.app",
  messagingSenderId: "169185109215",
  appId: "1:169185109215:web:3e05fb00ac131498f9f56a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);