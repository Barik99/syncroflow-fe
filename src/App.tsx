import React, { useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";

function App() {
  const [currentForm, setCurrentForm] = useState("login");
  const toggleForm = (fromName: React.SetStateAction<string>) => {
    setCurrentForm(fromName);
  };
  return (
    <div className="App">
      {currentForm === "login" ? (
        <Login onFormSwitch={toggleForm} />
      ) : (
        <Register onFormSwitch={toggleForm} />
      )}
    </div>
  );
}

export default App;
