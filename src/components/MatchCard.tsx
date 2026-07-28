import type { Match, Prediction } from "../types";
import { isValidGoals } from "../utils/validation";

type MatchCardProps = {
  match: Match;
  prediction: Prediction;
  onPredictionChange: (
    matchId: number,
    side: "homeGoals" | "awayGoals",
    value: string,
  ) => void;
};

function getInputStyle(hasError: boolean) {
  return {
    width: 48,
    padding: 8,
    fontSize: 16,
    textAlign: "center" as const,
    border: hasError ? "2px solid #dc2626" : "1px solid #d4d4d8",
    borderRadius: 4,
  };
}

function MatchCard({ match, prediction, onPredictionChange }: MatchCardProps) {
  const kickoff = new Date(match.utcDate).toLocaleString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const homeError =
    prediction.homeGoals !== "" && !isValidGoals(prediction.homeGoals);
  const awayError =
    prediction.awayGoals !== "" && !isValidGoals(prediction.awayGoals);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 12, color: "#71717a" }}>{kickoff}</div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 8,
        }}
      >
        <span style={{ flex: 1, textAlign: "right", fontWeight: 600 }}>
          {match.homeTeam}
        </span>

        <input
          type="number"
          min={0}
          max={20}
          style={getInputStyle(homeError)}
          value={prediction.homeGoals}
          onChange={(e) =>
            onPredictionChange(match.id, "homeGoals", e.target.value)
          }
        />

        <span style={{ color: "#a1a1aa" }}>:</span>

        <input
          type="number"
          min={0}
          max={20}
          style={getInputStyle(awayError)}
          value={prediction.awayGoals}
          onChange={(e) =>
            onPredictionChange(match.id, "awayGoals", e.target.value)
          }
        />

        <span style={{ flex: 1, fontWeight: 600 }}>{match.awayTeam}</span>
      </div>
    </div>
  );
}

export default MatchCard;
