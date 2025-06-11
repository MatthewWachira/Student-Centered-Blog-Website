// GoogleLogin.js
import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function GoogleLogin() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: "strathmore.edu", // restrict to @strathmore.edu
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email.endsWith("@strathmore.edu")) {
        setMessage("Only @strathmore.edu accounts are allowed.");
        await auth.signOut(); // Sign out immediately if not allowed
        return;
      }

      setMessage("Login successful!");
      navigate("/"); // or wherever your homepage is
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setMessage("Failed to log in. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign in with Strathmore Google Account</h2>
        <button onClick={handleGoogleLogin}>Sign in with Google</button>
        {message && <div className="login-message">{message}</div>}
      </div>
    </div>
  );
}
