import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBubV3swAj7UrBZHesnhngC9l4F4wgqkek",
  authDomain: "steal-tracker.firebaseapp.com",
  projectId: "steal-tracker",
  storageBucket: "steal-tracker.appspot.com",
  messagingSenderId: "872226712918",
  appId: "1:872226712918:web:26461d8d87612a8ffafaf7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
