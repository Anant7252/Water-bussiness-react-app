import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA7UmdydQOUW1Qylf04jTiJPrTkGJ6uH0g",
    authDomain: "water-bussiness-app.firebaseapp.com",
    projectId: "water-bussiness-app",
    storageBucket: "water-bussiness-app.firebasestorage.app",
    messagingSenderId: "728107875525",
    appId: "1:728107875525:web:6f578a0e9529df27d504ac",
    measurementId: "G-KFVYPS2GH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db };

