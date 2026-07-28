import { useState } from "react";
import MatchCard from "./components/MatchCard";
import { mockMatches } from "./data/mockMatches";
import type { Prediction } from "./types";

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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Typer Premier League</h1>
      <h2>Kolejka 1</h2>
      <h2>Liczba meczów: {mockMatches.length}</h2>

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
    </div>
  );
}

export default App;
