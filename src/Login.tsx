import React, { useState } from "react";

function Login(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <div className="auth-form-container">
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
      </form>
      <button
        className="authRedirectLink"
        onClick={() => props.onFormSwitch("register")}
      >
        Don't have an account? Register here.
      </button>
      <button className="authButton" type="submit">
        Log In
      </button>
    </div>
  );
}

export default Login;
