import { Link, useNavigate } from 'react-router-dom';
import React, { useRef, useState } from 'react';

import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login, signinWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(emailRef.current!.value, passwordRef.current!.value);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signinWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div>
      <h2>Accedi</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" ref={emailRef} required />
        <input type="password" placeholder="Password" ref={passwordRef} required />
        <button type="submit">Accedi</button>
      </form>
      <button onClick={handleGoogleSignIn}>Accedi con Google</button>
      <p>Non hai un account? <Link to="/signup">Registrati</Link></p>
    </div>
  );
};

export default Login;
