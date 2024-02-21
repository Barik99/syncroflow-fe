import React, { useState } from "react";

function Register(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <div className="auth-form-container">
      <form className="registerForm" onSubmit={handleSubmit}>
        <label className="authLabel" htmlFor="name" color="#ffffff">
          Full Name
        </label>
        <input
          className="authInput"
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="name"
          placeholder="Full Name"
          id="name"
          name="name"
        />
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
        onClick={() => props.onFormSwitch("login")}
      >
        Already have an account? Login here.
      </button>
      <button className="authButton" type="submit">
        Register
      </button>
    </div>
  );
}

export default Register;
