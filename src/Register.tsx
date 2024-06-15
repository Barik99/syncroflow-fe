import React, { useState } from "react";
import CryptoJS from "crypto-js";
import {Form, Toast} from "react-bootstrap";

function hashPassword(password: string) {
     return CryptoJS.SHA256(password).toString();
}

function Register(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); // Add this line
  const [pass, setPass] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [passValid, setPassValid] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const validatePassword = (password: string) => {
    return password.length >= 8;
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target.value;
    setEmail(emailInput);
    setEmailValid(true); // reset validation state
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordInput = e.target.value;
    setPass(passwordInput);
    setPassValid(true); // reset validation state
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Mutăm logica de validare aici
    setEmailValid(email !== "" && validateEmail(email));
    setPassValid(pass !== "" && validatePassword(pass));
    setFormSubmitted(true);

    // Dacă datele nu sunt valide, nu continuăm cu cererea
    if (!emailValid || !passValid) {
      return;
    }

    const response = await fetch(`/api/register/${email}/${hashPassword(pass)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const responseText = await response.text();
      if (responseText === "Există deja un cont cu acest email!") {
        setToastMessage(responseText);
        setShowToast(true);
        return;
      } else {
        // Do not show toast if password is empty or invalid
        if (pass !== "" && validatePassword(pass)) {
          setToastMessage(responseText);
          setShowToast(true);
          if (responseText === "Contul a fost creat cu succes!") {
            props.onFormSwitch("login");
          }
        }
      }
    } else {
      const responseText = await response.text();
      // Do not show toast if password is empty or invalid
      if (pass !== "" && validatePassword(pass)) {
        setToastMessage(responseText);
        setShowToast(true);
      }
    }
  };

  return (
      <div className="auth-form-container login-background">
        <Toast
            className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Contul a fost creat cu succes!') ? 'text-bg-success' : 'text-bg-danger'}`}
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={5000}
            autohide
        >
          <div className="d-flex">
            <div className="toast-body">
              {toastMessage}
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto"
                    onClick={() => setShowToast(false)} aria-label="Close"></button>
          </div>
        </Toast>
        <Form className="loginForm" onSubmit={handleSubmit}>
          <h2>Înregistrează-te</h2>
          <br/>

          <Form.Label className="authLabel" htmlFor="email">
            Adresa de email
          </Form.Label>
          <Form.Control
              className={`authInput ${emailValid ? '' : 'is-invalid'}`}
              value={email}
              onChange={handleEmailChange}
              type="email"
              placeholder="email@gmail.com"
              id="email"
              name="email"
          />
          <div className="invalid-feedback">
            {emailValid ? 'Vă rugăm să introduceți o adresă de email validă.' : 'Email-ul nu poate fi gol.'}
          </div>
          <Form.Label className="authLabel" htmlFor="email">
            Parola
          </Form.Label>
          <Form.Control
              className={`authInput ${passValid || !formSubmitted ? '' : 'is-invalid'}`}
              value={pass}
              onChange={handlePasswordChange}
              type="password"
              placeholder="************"
              id="password"
              name="password"
          />
          <div className="invalid-feedback">
            {pass === "" ? 'Password cannot be empty.' : 'Password must be at least 8 characters long.'}
          </div>
          <div className="auth-form-container">
            <button className="authButton btn btn-primary confirm-button" type="submit">
              Confirmă
            </button>
          </div>
        </Form>
        <button
            className="authRedirectLink btn btn-link"
            onClick={() => props.onFormSwitch("login")}
            style={{color: 'white', marginTop: '1rem'}}
        >
          Ai deja un cont? Autentifică-te aici.
        </button>
      </div>
  );
}

export default Register;