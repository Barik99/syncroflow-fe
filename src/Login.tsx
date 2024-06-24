import React, {useState} from "react";
import CryptoJS from "crypto-js";
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';

function Login(props: { onFormSwitch: (arg0: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [passValid, setPassValid] = useState(true);

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const validatePassword = (password: string) => {
    return true;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (email === "" || pass === "") {
      setToastMessage("Toate câmpurile sunt obligatorii!");
      setShowToast(true);
      return;
    }

    setEmailValid(validateEmail(email));
    setPassValid(validatePassword(pass));

    if (!emailValid || !passValid) {
      return;
    }

    const response = await fetch(`/api/login/${email}/${CryptoJS.SHA256(pass).toString()}`, {
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
        if (responseText === "Autentificare reușită!") {
          window.localStorage.setItem('email', email);
          window.location.href = "/rules";
        }
      }
    } else {
      const responseText = await response.text();
      setToastMessage(responseText);
      setShowToast(true);
    }
  };

  return (
      <div className="auth-form-container login-background" style={{background: 'linear-gradient(to top right, #5C1298, #CC8C01)'}}>
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
              className={`authInput ${!emailValid ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="email@gmail.com"
              id="email"
              name="email"
          />
          {!emailValid && <div className="invalid-feedback">Emailul este obligatoriu</div>}
          <Form.Label className="authLabel" htmlFor="email">
            Parola
          </Form.Label>
          <Form.Control
              className={`authInput ${!passValid ? 'is-invalid' : ''}`}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type="password"
              placeholder="************"
              id="password"
              name="password"
          />
          {!passValid && <div className="invalid-feedback">Parola este obligatorie</div>}
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