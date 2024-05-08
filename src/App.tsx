import React, { useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Navigation from "./Navigation";
import Rules from "./Rules"; // Import the Rules component

function App() {
  const [currentForm, setCurrentForm] = useState("login");
  const toggleForm = (fromName: React.SetStateAction<string>) => {
    setCurrentForm(fromName);
  };

  return (
    <div className="App">
      {currentForm !== "login" && currentForm !== "register" && <Navigation />}
      <div className="loginNav">
        {currentForm === "login" ? (
          <Login onFormSwitch={toggleForm} />
        ) : (
          <Register onFormSwitch={toggleForm} />
        )}
      </div>
    </div>
  );
}

export default App;