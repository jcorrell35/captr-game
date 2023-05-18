// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgVpAn2hCtA1FT5JW15zMGkVEDzt6cTsQ",
  authDomain: "captr-game.firebaseapp.com",
  projectId: "captr-game",
  storageBucket: "captr-game.appspot.com",
  messagingSenderId: "941323940817",
  appId: "1:941323940817:web:646fb8efe7c75c50d5e6f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


export {auth, provider}
export const db = getFirestore(app)