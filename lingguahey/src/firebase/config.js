// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // if using authentication
import { getFirestore } from "firebase/firestore"; // if using Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdmWtixidturIIJ3B17k6rWa7ntyaqf6Q",
  authDomain: "lingguuahey.firebaseapp.com",
  projectId: "lingguuahey",
  storageBucket: "lingguuahey.firebasestorage.app",
  messagingSenderId: "502843805415",
  appId: "1:502843805415:web:55414c35cc7bb904b01c42",
  measurementId: "G-YQKYV12TN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // if using Firestore