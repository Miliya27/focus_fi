import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// 🔥 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAF7uCHiX8H8Z5Y1ga_hGdaxr6cVymwt68",
  authDomain: "focus-fi-b60c6.firebaseapp.com",
  databaseURL: "https://focus-fi-b60c6-default-rtdb.firebaseio.com",
  projectId: "focus-fi-b60c6",
  storageBucket: "focus-fi-b60c6.appspot.com",
  messagingSenderId: "571850504074", // add if available
  appId: "1:571850504074:web:2facd0d3c783d94e823a73" // add if available
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Database + Auth exports
export const db = getDatabase(app);
export const auth = getAuth(app);

// 🔥 Anonymous login (for hackathon simplicity)
signInAnonymously(auth)
  .then(() => {
    console.log("Anonymous login success");
  })
  .catch((error) => {
    console.error("Auth error:", error);
  });