import type { Match } from "../types";

type MatchCardProps = {
  match: Match;
};

function MatchCard({ match }: MatchCardProps) {
  const kickoff = new Date(match.utcDate).toLocaleString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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
      <div style={{ fontWeight: 600 }}>
        {match.homeTeam} — {match.awayTeam}
      </div>
    </div>
  );
}

export default MatchCard;
