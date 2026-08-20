import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError(null);
    setInfo(null);
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (isRegister && username.trim() === "") {
      setError("Podaj nick");
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      });

      if (error) {
        setError(error.message);
      } else if (!data.session) {
        setMode("login");
        setPassword("");
        setUsername("");
        setInfo(
          "Konto założone. Potwierdź adres linkiem z maila, a potem zaloguj się.",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="auth-card">
      <h1>{isRegister ? "Rejestracja" : "Logowanie"}</h1>

      {isRegister && (
        <input
          type="text"
          placeholder="Nick"
          className="field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        className="field"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Hasło"
        className="field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="msg-error">{error}</p>}
      {info && <p className="msg-ok">{info}</p>}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Czekaj..." : isRegister ? "Zarejestruj się" : "Zaloguj się"}
      </button>

      <button className="link-btn" onClick={switchMode}>
        {isRegister ? "Mam już konto" : "Nie mam konta"}
      </button>
    </div>
  );
}

export default AuthForm;
