import { Link, useNavigate } from 'react-router-dom';
import React, { useRef, useState } from 'react';

import { useAuth } from '../hooks/useAuth';

const Signup: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signup(
        emailRef.current!.value,
        passwordRef.current!.value,
        displayNameRef.current!.value
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div>
      <h2>Registrati</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nome utente" ref={displayNameRef} required />
        <input type="email" placeholder="Email" ref={emailRef} required />
        <input type="password" placeholder="Password" ref={passwordRef} required />
        <button type="submit">Registrati</button>
      </form>
      <p>Hai già un account? <Link to="/login">Accedi</Link></p>
    </div>
  );
};

export default Signup;
