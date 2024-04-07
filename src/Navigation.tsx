import React from "react";

function Navigation() {
  const email = window.localStorage.getItem('email') || 'Login';

  return (
    <nav className="nav">
      <div>
        <a href="/" className="site-logo text-white">
          <img src="..\images\logo.png" />
        </a>
        <a href="/rules" className="dashboard text-white">
          Rules
        </a>
        <a href="/triggers" className="dashboard text-white">
          Triggers
        </a>
        <a href="/actions" className="dashboard text-white">
          Actions
        </a>
      </div>
      <div className="login-create">
        <button className="create-button">+ Create</button>
        <a href="/login" className="login-button text-white">
          {email}
        </a>
      </div>
    </nav>
  );
}

export default Navigation;