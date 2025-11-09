 import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Signup.css';
export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();

  // fallback base URL so it still works even if .env fails
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const endpoint = `${API_URL}/api/auth/signup`;
      console.log("Submitting to:", endpoint); // helpful debug
      const res = await axios.post(endpoint, form);
      localStorage.setItem("token", res.data.token);
      nav("/dashboard");
    } catch (e) {
      console.error("Signup error:", e);
      setErr(e?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="container">
      <h2>Create account</h2>
      <form onSubmit={submit} className="card">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn" type="submit">
          Sign up
        </button>
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}
