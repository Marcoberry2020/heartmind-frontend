 import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API = process.env.REACT_APP_API_URL || "https://heartmind-vghw.onrender.com";

// ✅ Helper for Authorization headers
function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export default function Dashboard() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi I'm HeartMind. Tell me how you’re feeling." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [journalInput, setJournalInput] = useState('');
  const [journals, setJournals] = useState([]);
  const [mood, setMood] = useState('');
  const [user, setUser] = useState(null);

  const chatEnd = useRef();

  // ✅ Fetch user journals
  const fetchJournals = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/data/journal`, { headers: authHeaders() });
      setJournals(res.data);
    } catch (e) {
      console.error("Error fetching journals:", e);
    }
  }, []);

  // ✅ Fetch user
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`, { headers: authHeaders() });
      setUser(res.data);
      localStorage.setItem("userId", res.data._id);
    } catch (e) {
      console.error("Error fetching user:", e);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchJournals();
  }, []);

  const now = new Date();
  const isSubscribed =
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > now;

  const remainingFreeMessages = user?.freeMessages ?? 0;
  const canChat = isSubscribed || remainingFreeMessages > 0;

  // ✅ Helper to slowly type assistant message
  const typeMessage = (fullText) => {
    return new Promise((resolve) => {
      let current = '';
      const interval = setInterval(() => {
        current += fullText[current.length];
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1].text = current; // update last assistant message
          return msgs;
        });
        if (current.length === fullText.length) {
          clearInterval(interval);
          resolve();
        }
      }, 30); // 30ms per character
    });
  };

  // ✅ Send chat message
  const sendChat = async () => {
    if (!chatInput.trim() || !user) return;
    if (!canChat) return alert("You have used all free messages. Please subscribe.");

    const nextMsgs = [...messages, { role: 'user', text: chatInput }];
    setMessages(nextMsgs);
    setChatInput('');

    try {
      const res = await axios.post(
        `${API}/api/ai-chat`,
        { messages: nextMsgs },
        { headers: authHeaders() }
      );

      // Add assistant placeholder first
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);
      await typeMessage(res.data.reply);

      if (!isSubscribed && remainingFreeMessages > 0) {
        await axios.post(`${API}/api/auth/decrement-free`, {}, { headers: authHeaders() });
        fetchUser(); // refresh freeMessages count
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }]);
    } finally {
      chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const saveJournal = async () => {
    if (!journalInput.trim() && !mood) return;
    try {
      await axios.post(
        `${API}/api/data/journal`,
        { entry: journalInput, mood },
        { headers: authHeaders() }
      );
      setJournalInput('');
      setMood('');
      fetchJournals();
    } catch (e) {
      console.error("Failed to save journal:", e);
    }
  };

  const deleteJournal = async (id) => {
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      await axios.delete(`${API}/api/data/journal/${id}`, { headers: authHeaders() });
      setJournals(prev => prev.filter(j => j._id !== id));
    } catch (e) {
      console.error("Failed to delete journal:", e);
    }
  };

  const handleSubscribe = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return alert("User not found.");

      const res = await axios.post(`${API}/api/payment/create-session`, {
        userId,
        callback_url: `https://heartmindai.netlify.app/payment-success?userId=${userId}`
      });

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Payment redirect error:", err.response?.data || err);
      alert("Payment failed to start.");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <div className="dashboard">
      <header className="top">
        <h2>HeartMind</h2>
        <button className="btn ghost" onClick={logout}>Logout</button>
      </header>

      <main className="grid">
        {/* CHAT */}
        <section className="card chat">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.role === 'assistant' && <img src="/heartmind.jpeg" alt="HeartMind" className="avatar" />}
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            <div ref={chatEnd} />
          </div>

          <div className="composer">
            {!canChat ? (
              <button className="btn" onClick={handleSubscribe}>
                Subscribe ₦750 to Continue
              </button>
            ) : (
              <>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Write to HeartMind..."
                />
                <button className="btn" onClick={sendChat}>Send</button>
              </>
            )}
          </div>
        </section>

        {/* JOURNAL */}
        <aside className="card tools">
          <h3>Journaling</h3>
          <textarea
            value={journalInput}
            onChange={(e) => setJournalInput(e.target.value)}
            placeholder="Write something..."
          />
          <div style={{ marginTop: 8 }}>
            <label>Mood:</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="">(choose)</option>
              <option>Sad</option>
              <option>Angry</option>
              <option>Relieved</option>
              <option>Confused</option>
              <option>Hopeful</option>
            </select>
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={saveJournal}>
            Save Journal
          </button>

          <h3 style={{ marginTop: 20 }}>Recent entries</h3>
          <div className="journals">
            {journals.map(j => (
              <div key={j._id} className="journalItem">
                <div className="mood">{j.mood || '—'}</div>
                <div className="text">{j.entry}</div>
                <div className="time">{new Date(j.createdAt).toLocaleString()}</div>
                <button className="delete-btn" onClick={() => deleteJournal(j._id)}>🗑 Delete</button>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
