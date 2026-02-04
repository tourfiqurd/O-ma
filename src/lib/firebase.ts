
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBq29zseOyFv6roQeOgGZXHtqtiugR6HBU",
  authDomain: "chat-app-5d321.firebaseapp.com",
  databaseURL: "https://chat-app-5d321-default-rtdb.firebaseio.com",
  projectId: "chat-app-5d321",
  storageBucket: "chat-app-5d321.firebasestorage.app",
  messagingSenderId: "982329831497",
  appId: "1:982329831497:web:d82e00654b73ff523a8f98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);
