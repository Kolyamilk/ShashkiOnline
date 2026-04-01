// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDCPM51PpwoIlh60wTgXpuog1cPYWV__Cg",
  authDomain: "mobileapp-5d6e6.firebaseapp.com",
  databaseURL: "https://mobileapp-5d6e6-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "mobileapp-5d6e6",
  storageBucket: "mobileapp-5d6e6.firebasestorage.app",
  messagingSenderId: "635804140201",
  appId: "1:635804140201:web:02eb7eae0c4e59fe1d9fb8",
  measurementId: "G-7RLE9VV2P0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);