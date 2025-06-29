import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAwLRM4PsO3mz8MoJeyz849s6gKWAVlEwg",
  authDomain: "strathmoreblog.firebaseapp.com",
  projectId: "strathmoreblog",
  storageBucket: "strathmoreblog.firebasestorage.app",
  messagingSenderId: "828059595871",
  appId: "1:828059595871:web:28390489ad60ba3cca57ea",
  measurementId: "G-1FK6V8GQPW"
};

// ✅ Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);
const storage = getStorage(app);

// ✅ Optional: Customize Google Sign-in prompt
provider.setCustomParameters({
  prompt: "select_account"
});

// ✅ Export your Firebase modules
export { auth, provider, db, storage };
