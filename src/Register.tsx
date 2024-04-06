import React, { useState } from "react";
import CryptoJS from "crypto-js";

function hashPassword(password: string) {
     return CryptoJS.SHA256(password).toString();
}

function Register(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); // Add this line

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:8080/register/${email}/${hashPassword(pass)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data) {
      setNotification("Your account has been registered successfully!"); // Add this line
      window.location.href = "/login";
    } else {
      setError("The account could not be registered");
    }
  };

  return (
    <div className="auth-form-container">
      {error && <div className="error-notification">{error}</div>}
      {notification && <div className="notification">{notification}</div>} {/* Add this line */}
      <form className="registerForm" onSubmit={handleSubmit}>
        <label className="authLabel" htmlFor="email">
          Email
        </label>
        <input
            className="authInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email@gmail.com"
            id="email"
            name="email"
        />
        <label className="authLabel" htmlFor="password">
          Password
        </label>
        <input
            className="authInput"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            placeholder="************"
            id="password"
            name="password"
        />
        <button className="authButton" type="submit">
          Register
        </button>
      </form>
      <button
        className="authRedirectLink"
        onClick={() => props.onFormSwitch("login")}
      >
        Already have an account? Login here.
      </button>
    </div>
  );
}

export default Register;