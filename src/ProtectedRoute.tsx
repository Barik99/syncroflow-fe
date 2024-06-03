import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactElement | null;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const email = window.localStorage.getItem('email');

    React.useEffect(() => {
        if (!email) {
            navigate('/404');
        }
    }, [email, navigate]);

    return email ? children : null;
}