import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIRE_API_KEY,
  authDomain: "flixxit-capsproj.firebaseapp.com",
  projectId: "flixxit-capsproj",
  storageBucket: "flixxit-capsproj.appspot.com",
  messagingSenderId: "626580951538",
  appId: "1:626580951538:web:9c0b2c6310569eda759b6b",
  measurementId: "G-K2C254YNRC"
};


const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);