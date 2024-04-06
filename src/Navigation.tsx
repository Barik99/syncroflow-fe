function Navigation() {
  return (
    <nav className="nav">
      <div>
        <a href="/" className="site-logo text-white">
          <img src="..\images\logo.png" />
        </a>
        <a href="/" className="dashboard text-white">
          Dashboard
        </a>
      </div>
      <div className="login-create">
        <button className="create-button">+ Create</button>
        <a href="/login" className="login-button text-white">
          Login
        </a>
      </div>
    </nav>
  );
}

export default Navigation;
