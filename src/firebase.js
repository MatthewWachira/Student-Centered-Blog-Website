// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwLRM4PsO3mz8MoJeyz849s6gKWAVlEwg",
  authDomain: "strathmoreblog.firebaseapp.com",
  projectId: "strathmoreblog",
  storageBucket: "strathmoreblog.appspot.com", 
  messagingSenderId: "828059595871",
  appId: "1:828059595871:web:28390489ad60ba3cca57ea",
  measurementId: "G-1FK6V8GQPW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

export { auth, provider };
