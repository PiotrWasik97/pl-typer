import MatchCard from "./components/MatchCard";
import { mockMatches } from "./data/mockMatches";

function App() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Typer Premier League</h1>
      <h2>Kolejka 1</h2>
      <h2>Liczba meczy: {mockMatches.length}</h2>
      {mockMatches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

export default App;
