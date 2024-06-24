import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const NotFoundPage = () => {
    const handleRedirect = () => {
        // Verificăm dacă utilizatorul este autentificat
        const email = window.localStorage.getItem('email');
        // Redirecționăm către pagina corespunzătoare
        window.location.href = email ? "/rules" : "/";
    };

    // Verificăm dacă utilizatorul este autentificat
    const email = window.localStorage.getItem('email');
    // Setăm textul butonului în funcție de starea de autentificare a utilizatorului
    const buttonText = email ? "Navighează la reguli" : "Conectează-te";

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="text-center">
                <h1 className="display-1 fw-bold">404</h1>
                <p className="fs-3"> <span className="text-danger">Opps!</span> Pagina nu a fost găsită.</p>
                <p className="lead">
                    Pagina pe care o cauți nu a fost gasită.
                </p>
                <button onClick={handleRedirect} className="btn btn-primary">{buttonText}</button>
            </div>
        </div>
    );
}

export default NotFoundPage;