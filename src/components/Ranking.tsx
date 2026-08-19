import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type RankingRow = {
  user_id: string;
  username: string;
  total_points: number;
  exact_hits: number;
  winner_hits: number;
};

function Ranking() {
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRanking() {
      const { data, error } = await supabase
        .from("ranking")
        .select("*")
        .order("total_points", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setRows(data as RankingRow[]);
      }

      setLoading(false);
    }

    loadRanking();
  }, []);

  if (loading) return <p className="msg-plain">Ładowanie rankingu...</p>;
  if (error) return <p className="msg-error">Błąd: {error}</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Gracz</th>
          <th>Punkty</th>
          <th>Wyniki</th>
          <th>Zwycięzcy</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.user_id}>
            <td>{index + 1}</td>
            <td>{row.username}</td>
            <td className="points">{row.total_points}</td>
            <td>{row.exact_hits}</td>
            <td>{row.winner_hits}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Ranking;
