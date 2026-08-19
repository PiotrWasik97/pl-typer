import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import MatchCard from "./components/MatchCard";
import AuthForm from "./components/AuthForm";
import Ranking from "./components/Ranking";
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
  const [tab, setTab] = useState<"typy" | "ranking">("typy");

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
          "id, matchday, utcDate:utc_date, homeTeam:home_team, awayTeam:away_team, status, homeGoals:home_goals, awayGoals:away_goals",
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

  const unfinished = matches.filter((m) => m.status !== "FINISHED");

  const currentMatchday =
    unfinished.length > 0
      ? Math.min(...unfinished.map((m) => m.matchday))
      : Math.max(...matches.map((m) => m.matchday), 0);

  const visibleMatches = matches.filter((m) => m.matchday === currentMatchday);
  const visibleIds = new Set(visibleMatches.map((m) => m.id));

  const completePredictions = Object.entries(predictions)
    .filter(([matchId, p]) => {
      if (!visibleIds.has(Number(matchId))) return false;
      return isValidGoals(p.homeGoals) && isValidGoals(p.awayGoals);
    })
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
    return <p className="msg-plain">Ładowanie...</p>;
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="app">
      <h1>Typer Premier League</h1>
      <p className="subtitle">Premier League 2026/27</p>

      <div className="topbar">
        <span>{session.user.email}</span>
        <button
          className="btn btn-ghost"
          onClick={() => supabase.auth.signOut()}
        >
          Wyloguj
        </button>
      </div>

      <div className="tabs">
        <button
          className="btn btn-tab"
          onClick={() => setTab("typy")}
          disabled={tab === "typy"}
        >
          Typy
        </button>
        <button
          className="btn btn-tab"
          onClick={() => setTab("ranking")}
          disabled={tab === "ranking"}
        >
          Ranking
        </button>
      </div>

      {tab === "ranking" && <Ranking />}

      {tab === "typy" && (
        <>
          <div className="meta">
            <h2>Kolejka {currentMatchday}</h2>
            <span>
              Wypełnione {completePredictions.length} / {visibleMatches.length}
            </span>
          </div>

          {matchesError && <p className="msg-error">Błąd: {matchesError}</p>}
          {loadingMatches && <p className="msg-plain">Ładowanie meczów...</p>}

          {visibleMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictions[match.id] ?? EMPTY_PREDICTION}
              onPredictionChange={handlePredictionChange}
            />
          ))}

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saveDisabled}
          >
            {saving
              ? "Zapisywanie..."
              : `Zapisz typy (${completePredictions.length})`}
          </button>

          {saveError && <p className="msg-error">Błąd zapisu: {saveError}</p>}
          {savedAt && <p className="msg-ok">Zapisano o {savedAt}</p>}
        </>
      )}
    </div>
  );
}

export default App;
