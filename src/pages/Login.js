import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [form,setForm] = useState({email:'',password:''});
  const [err,setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await axios.post(process.env.REACT_APP_API_URL + '/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container">
      <h2>Welcome back</h2>
      <form onSubmit={submit} className="card">
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button className="btn" type="submit">Log in</button>
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}
