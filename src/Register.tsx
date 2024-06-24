import React, { useState } from "react";
import CryptoJS from "crypto-js";
import {Form, Toast} from "react-bootstrap";

function hashPassword(password: string) {
     return CryptoJS.SHA256(password).toString();
}

function Register(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [passValid, setPassValid] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmPass, setConfirmPass] = useState("");

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassInput = e.target.value;
    setConfirmPass(confirmPassInput);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target.value;
    setEmail(emailInput);
    setEmailValid(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordInput = e.target.value;
    setPass(passwordInput);
    setPassValid(passwordInput !== "" && validatePassword(passwordInput));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (email === "" || pass === "") {
      setToastMessage("Toate câmpurile sunt obligatorii!");
      setShowToast(true);
      return;
    }

    if (!validatePassword(pass)) {
      setToastMessage("Parola trebuie să aibă cel puțin 8 caractere.");
      setShowToast(true);
      return;
    }

    if (pass !== confirmPass) {
      setToastMessage("Parolele introduse nu sunt identice.");
      setShowToast(true);
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
        if (pass !== "" && validatePassword(pass)) {
          setToastMessage(responseText);
          setShowToast(true);
          if (responseText === "Contul a fost creat cu succes!") {
            setTimeout(() => {
              props.onFormSwitch("login");
            }, 3000);
          }
        }
      }
    } else {
      const responseText = await response.text();
      if (pass !== "" && validatePassword(pass)) {
        setToastMessage(responseText);
        setShowToast(true);
      }
    }
  };

  return (
      <div className="auth-form-container login-background" style={{background: 'linear-gradient(to top right, #5C1298, #CC8C01)'}}>
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
            {pass === "" ? 'Parola nu poate fi goală.' : 'Parola trebuie să aibă cel puțin 8 caractere.'}
          </div>
          <Form.Label className="authLabel" htmlFor="confirmPassword">
            Confirmă parola
          </Form.Label>
          <Form.Control
              className={`authInput ${passValid || !formSubmitted ? '' : 'is-invalid'}`}
              value={confirmPass}
              onChange={handleConfirmPasswordChange}
              type="password"
              placeholder="************"
              id="confirmPassword"
              name="confirmPassword"
          />
          <div className="invalid-feedback">
            {pass === "" ? 'Parola de confirmare nu poate fi goală.' : 'Parolele introduse nu sunt identice.'}
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