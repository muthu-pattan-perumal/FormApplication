'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import './SignUp.css'; // Reuse or copy styles from Login.css
import { FaEye, FaEyeSlash } from 'react-icons/fa';
export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const register = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      router.push("/sign-in");
    } else {
      const { error } = await res.json();
      alert(error || "Registration failed");
    }
  };

  return (
   <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Sign Up</h1>

        <input
          className="login-input"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            className="login-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="login-button" onClick={register}>Create Account</button>

        <p className="signup-text">
          Already have an account? <a href="/sign-in">Sign In</a>
        </p>
      </div>
    </div>
  );
}
