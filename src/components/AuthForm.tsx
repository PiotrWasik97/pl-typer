import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const fieldStyle = {
  width: "100%",
  padding: 10,
  fontSize: 16,
  marginBottom: 12,
  border: "1px solid #d4d4d8",
  borderRadius: 4,
  boxSizing: "border-box" as const,
};

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
    <div
      style={{
        maxWidth: 360,
        margin: "0 auto",
        background: "white",
        padding: 24,
        borderRadius: 8,
      }}
    >
      <h1>{isRegister ? "Rejestracja" : "Logowanie"}</h1>

      {isRegister && (
        <input
          type="text"
          placeholder="Nick"
          style={fieldStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        style={fieldStyle}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Hasło"
        style={fieldStyle}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 8,
          border: "none",
          background: loading ? "#a1a1aa" : "#16a34a",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Czekaj..." : isRegister ? "Zarejestruj się" : "Zaloguj się"}
      </button>

      <p style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setError(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isRegister ? "Mam już konto" : "Nie mam konta"}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
