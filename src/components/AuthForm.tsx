import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) setError(error.message);
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

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Czekaj..." : isRegister ? "Zarejestruj się" : "Zaloguj się"}
      </button>

      <button
        className="link-btn"
        onClick={() => {
          setMode(isRegister ? "login" : "register");
          setError(null);
        }}
      >
        {isRegister ? "Mam już konto" : "Nie mam konta"}
      </button>
    </div>
  );
}

export default AuthForm;
