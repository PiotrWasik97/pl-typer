import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import MatchCard from "./components/MatchCard";
import AuthForm from "./components/AuthForm";
import { supabase } from "./lib/supabaseClient";
import type { Match, Prediction } from "./types";
import { isValidGoals } from "./utils/validation";

const EMPTY_PREDICTION: Prediction = { homeGoals: "", awayGoals: "" };

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {},
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    async function loadMatches() {
      setLoadingMatches(true);
      setMatchesError(null);

      const { data, error } = await supabase
        .from("matches")
        .select(
          "id, matchday, utcDate:utc_date, homeTeam:home_team, awayTeam:away_team",
        )
        .order("utc_date", { ascending: true });

      if (error) {
        setMatchesError(error.message);
      } else {
        setMatches(data as Match[]);
      }

      setLoadingMatches(false);
    }

    loadMatches();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const userId = session.user.id;

    async function loadPredictions() {
      const { data, error } = await supabase
        .from("predictions")
        .select("match_id, home_goals, away_goals")
        .eq("user_id", userId);

      if (error || !data) return;

      const loaded: Record<number, Prediction> = {};
      for (const row of data) {
        loaded[row.match_id] = {
          homeGoals: String(row.home_goals),
          awayGoals: String(row.away_goals),
        };
      }

      setPredictions(loaded);
    }

    loadPredictions();
  }, [session]);

  function handlePredictionChange(
    matchId: number,
    side: "homeGoals" | "awayGoals",
    value: string,
  ) {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? EMPTY_PREDICTION),
        [side]: value,
      },
    }));
  }

  async function handleSave() {
    if (!session) return;

    setSaving(true);
    setSaveError(null);

    const rows = completePredictions.map((p) => ({
      user_id: session.user.id,
      match_id: p.matchId,
      home_goals: p.homeGoals,
      away_goals: p.awayGoals,
    }));

    const { error } = await supabase
      .from("predictions")
      .upsert(rows, { onConflict: "user_id,match_id" });

    if (error) {
      setSaveError(error.message);
    } else {
      setSavedAt(new Date().toLocaleTimeString("pl-PL"));
    }

    setSaving(false);
  }

  const completePredictions = Object.entries(predictions)
    .filter(([, p]) => isValidGoals(p.homeGoals) && isValidGoals(p.awayGoals))
    .map(([matchId, p]) => ({
      matchId: Number(matchId),
      homeGoals: Number(p.homeGoals),
      awayGoals: Number(p.awayGoals),
    }));

  const hasErrors = Object.values(predictions).some(
    (p) =>
      (p.homeGoals !== "" && !isValidGoals(p.homeGoals)) ||
      (p.awayGoals !== "" && !isValidGoals(p.awayGoals)),
  );

  const saveDisabled = saving || completePredictions.length === 0 || hasErrors;

  if (loadingSession) {
    return <p>Ładowanie...</p>;
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Typer Premier League</h1>

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 12, color: "#71717a" }}>
          {session.user.email}
        </span>
        <button onClick={() => supabase.auth.signOut()}>Wyloguj</button>
      </div>

      <h2>Kolejka 1</h2>
      <h2>Liczba meczów: {matches.length}</h2>
      <h2>
        Wypełnione: {completePredictions.length} / {matches.length}
      </h2>

      {matchesError && <p style={{ color: "#dc2626" }}>Błąd: {matchesError}</p>}
      {loadingMatches && <p>Ładowanie meczów...</p>}

      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          prediction={predictions[match.id] ?? EMPTY_PREDICTION}
          onPredictionChange={handlePredictionChange}
        />
      ))}

      <pre style={{ background: "#e4e4e7", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(predictions, null, 2)}
      </pre>

      <button
        onClick={handleSave}
        disabled={saveDisabled}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          fontWeight: 600,
          marginTop: 8,
          borderRadius: 8,
          border: "none",
          background: saveDisabled ? "#a1a1aa" : "#16a34a",
          color: "white",
          cursor: saveDisabled ? "not-allowed" : "pointer",
        }}
      >
        {saving
          ? "Zapisywanie..."
          : `Zapisz typy (${completePredictions.length})`}
      </button>

      {saveError && (
        <p style={{ color: "#dc2626" }}>Błąd zapisu: {saveError}</p>
      )}
      {savedAt && <p style={{ color: "#16a34a" }}>Zapisano o {savedAt}</p>}
    </div>
  );
}

export default App;
