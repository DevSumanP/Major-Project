import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from "firebase/auth";
import { collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaN6l0gS39Xuh8Orf8tmuTYOJiBuFz7gE",
  authDomain: "smart-shopping-app-12cfd.firebaseapp.com",
  databaseURL: "https://smart-shopping-app-12cfd-default-rtdb.firebaseio.com",
  projectId: "smart-shopping-app-12cfd",
  storageBucket: "smart-shopping-app-12cfd.firebasestorage.app",
  messagingSenderId: "52215147179",
  appId: "1:52215147179:web:cb4feff245702bbd56a5ee",
  measurementId: "G-B7J8FNG28Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
// Get Firestore database instance
const db = getFirestore(app)


export { app, auth , db};
