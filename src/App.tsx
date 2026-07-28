import { useState } from "react";
import MatchCard from "./components/MatchCard";
import { mockMatches } from "./data/mockMatches";
import type { Prediction } from "./types";
import { isValidGoals } from "./utils/validation";

const EMPTY_PREDICTION: Prediction = { homeGoals: "", awayGoals: "" };

function App() {
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {},
  );

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

  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSave() {
    console.log("Do zapisania:", completePredictions);
    setSavedAt(new Date().toLocaleTimeString("pl-PL"));
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Typer Premier League</h1>
      <h2>Kolejka 1</h2>
      <h2>Liczba meczów: {mockMatches.length}</h2>
      <h2>
        Wypełnione: {completePredictions.length} / {mockMatches.length}
      </h2>

      {mockMatches.map((match) => (
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
        disabled={completePredictions.length === 0 || hasErrors}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          fontWeight: 600,
          marginTop: 8,
          borderRadius: 8,
          border: "none",
          background:
            completePredictions.length === 0 || hasErrors
              ? "#a1a1aa"
              : "#16a34a",
          color: "white",
          cursor:
            completePredictions.length === 0 || hasErrors
              ? "not-allowed"
              : "pointer",
        }}
      >
        Zapisz typy ({completePredictions.length})
      </button>

      {savedAt && <p style={{ color: "#16a34a" }}>Zapisano o {savedAt}</p>}
    </div>
  );
}

export default App;
