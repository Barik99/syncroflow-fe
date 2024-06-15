import React, {useState} from "react";
import CryptoJS from "crypto-js";
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';

function hashPassword(password: string) {
  return CryptoJS.SHA256(password).toString();
}

function Login(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [passValid, setPassValid] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const validatePassword = (password: string) => {
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target.value;
    setEmail(emailInput);
    setEmailValid(emailInput !== "" && validateEmail(emailInput));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordInput = e.target.value;
    setPass(passwordInput);
    setPassValid(passwordInput !== "" && validatePassword(passwordInput));
  };


  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setEmailValid(email !== "");
    setPassValid(pass !== "");

    if (email === "" || pass === "") {
      return;
    }

    setEmailValid(validateEmail(email));
    setPassValid(validatePassword(pass));

    if (!emailValid || !passValid) {
      return;
    }

    const response = await fetch(`/api/login/${email}/${hashPassword(pass)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const responseText = await response.text();
      if (responseText === "Email sau parolă incorectă!") {
        setToastMessage(responseText);
        setShowToast(true);
        return;
      } else {
        // Do not show toast if password is empty or invalid
        if (pass !== "" && validatePassword(pass)) {
          if (responseText === "Autentificare reușită!") {
            window.localStorage.setItem('email', email);
            window.location.href = "/rules";
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
            className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Autentificare reușită!') ? 'text-bg-success' : 'text-bg-danger'}`}
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
          <h2>Autentifică-te</h2>
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
              className={`authInput ${passValid ? '' : 'is-invalid'}`}
              value={pass}
              onChange={handlePasswordChange}
              type="password"
              placeholder="************"
              id="password"
              name="password"
          />
          <div className="invalid-feedback">
            {pass === "" ? 'Password cannot be empty.' : ''}
          </div>
          <div className="auth-form-container">
            <button className="authButton btn btn-primary confirm-button" type="submit">
              Confirmă
            </button>
          </div>
        </Form>
        <button
            className="authRedirectLink btn btn-link"
            onClick={() => props.onFormSwitch("register")}
            style={{color: 'white', marginTop: '1rem'}}
        >
          Nu ai un cont? Înregistrează-te aici.
        </button>
      </div>
  );
}

export default Login;