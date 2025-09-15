import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { auth as firebaseAuthApp } from '../firebase';
import type { BackendUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<BackendUser | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const signinWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuthApp, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const idToken = credential?.idToken;
    if (!idToken) {
      throw new Error('Google sign-in failed: no ID token.');
    }
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Google login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    token.value = data.access_token;
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    await login(email, password);
  };

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    token.value = data.access_token;
  };

  const logout = async () => {
    await firebaseSignOut(firebaseAuthApp);
    localStorage.removeItem('token');
    token.value = null;
    currentUser.value = null;
  };

  const fetchUser = async () => {
    if (!token.value) return;
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    if (!res.ok) {
      throw new Error('Fetch user failed');
    }
    const user: BackendUser = await res.json();
    currentUser.value = user;
  };

  return {
    currentUser,
    token,
    signinWithGoogle,
    signup,
    login,
    logout,
    fetchUser,
  };
});