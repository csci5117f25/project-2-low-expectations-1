// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAd7DZkLed2OVzys8jeWOkWLdCEiLnfBio",
  authDomain: "gamblr-16a50.firebaseapp.com",
  projectId: "gamblr-16a50",
  storageBucket: "gamblr-16a50.firebasestorage.app",
  messagingSenderId: "255591283768",
  appId: "1:255591283768:web:c56f1b79ae5e56c857facd",
  measurementId: "G-GTVN16TNC8"
};

// Initialize Firebase

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp)

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
