import React, {useState} from "react";
import CryptoJS from "crypto-js";
import config from './config';

function hashPassword(password: string) {
  return CryptoJS.SHA256(password).toString();
}

function Login(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const response = await fetch(`/api/login/${email}/${hashPassword(pass)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data) {
      window.localStorage.setItem('email', email);
      window.location.href = "/";
    } else {
      setError("Incorrect email or password. Please try again.");
    }
  };

  return (
      <div className="auth-form-container">
        {error && <div className="error-notification">{error}</div>}
        <form className="loginForm" onSubmit={handleSubmit}>
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
            Log In
          </button>
        </form>
        <button
            className="authRedirectLink"
            onClick={() => props.onFormSwitch("register")}
        >
          Don't have an account? Register here.
        </button>
      </div>
  );
}

export default Login;