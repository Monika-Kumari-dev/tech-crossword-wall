import { useState } from "react";
import { accessRequest, getDeviceId } from "../utils/access";

export default function AdminLogin({ onAuthenticated }) {
  const [username, setUsername] = useState("info@techfluence");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      getDeviceId();
      await accessRequest("login", { username: username.trim(), password });
      setPassword("");
      onAuthenticated();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="admin-entry-screen">
    <header className="admin-entry-heading">
      <p className="eyebrow">GED WEEK FY27 · BANGALORE</p>
      <h1>Tech crossword wall</h1>
    </header>
    <section className="admin-entry-card">
      <p className="eyebrow">ADMIN ACCESS</p>
      <h2>Admin sign in</h2>
      <form className="admin-login-form" onSubmit={submit}>
        <label htmlFor="tv-admin-name">Admin username</label>
        <input id="tv-admin-name" type="text" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
        <label htmlFor="tv-admin-password">Password</label>
        <input id="tv-admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to continue →"}</button>
      </form>
    </section>
    <footer className="admin-entry-artwork" aria-label="GED event artwork">
      <div className="home-brand-artwork">
        <picture className="reference-track"><source media="(max-width: 600px)" srcSet="/ged-reference-track-mobile.svg" /><img src="/ged-reference-track.svg" alt="" /></picture>
        <img className="event-logo" src="/ged-logo.svg" alt="GED" width="76" height="117" />
      </div>
    </footer>
  </main>;
}
