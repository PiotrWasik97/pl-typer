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

function MatchCard({ match, prediction, onPredictionChange }: MatchCardProps) {
  const matchDate = new Date(match.utcDate);
  const kickoff = matchDate.toLocaleString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLocked = matchDate.getTime() < Date.now();
  const isFinished = match.status === "FINISHED";

  const homeError =
    prediction.homeGoals !== "" && !isValidGoals(prediction.homeGoals);
  const awayError =
    prediction.awayGoals !== "" && !isValidGoals(prediction.awayGoals);

  return (
    <div className={isLocked ? "match locked" : "match"}>
      <div className="match-date">
        {kickoff}
        {isFinished && ` — ${match.homeGoals}:${match.awayGoals}`}
      </div>

      <div className="match-row">
        <span className="team home">{match.homeTeam}</span>

        {isLocked ? (
          <span className="locked-label">Typowanie zamknięte</span>
        ) : (
          <>
            <input
              type="number"
              min={0}
              max={20}
              className={homeError ? "score error" : "score"}
              value={prediction.homeGoals}
              onChange={(e) =>
                onPredictionChange(match.id, "homeGoals", e.target.value)
              }
            />
            <span className="colon">:</span>
            <input
              type="number"
              min={0}
              max={20}
              className={awayError ? "score error" : "score"}
              value={prediction.awayGoals}
              onChange={(e) =>
                onPredictionChange(match.id, "awayGoals", e.target.value)
              }
            />
          </>
        )}

        <span className="team">{match.awayTeam}</span>
      </div>
    </div>
  );
}

export default MatchCard;
