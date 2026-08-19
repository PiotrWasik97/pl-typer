import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type RankingRow = {
  user_id: string;
  username: string;
  total_points: number;
  exact_hits: number;
  winner_hits: number;
};

const cellStyle = {
  padding: 8,
  textAlign: "left" as const,
  borderBottom: "1px solid #e4e4e7",
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

  if (loading) return <p>Ładowanie rankingu...</p>;
  if (error) return <p style={{ color: "#dc2626" }}>Błąd: {error}</p>;

  return (
    <table
      style={{
        width: "100%",
        background: "white",
        borderRadius: 8,
        borderCollapse: "collapse" as const,
      }}
    >
      <thead>
        <tr>
          <th style={cellStyle}>#</th>
          <th style={cellStyle}>Gracz</th>
          <th style={cellStyle}>Punkty</th>
          <th style={cellStyle}>Wyniki</th>
          <th style={cellStyle}>Zwycięzcy</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.user_id}>
            <td style={cellStyle}>{index + 1}</td>
            <td style={cellStyle}>{row.username}</td>
            <td style={{ ...cellStyle, fontWeight: 600 }}>
              {row.total_points}
            </td>
            <td style={cellStyle}>{row.exact_hits}</td>
            <td style={cellStyle}>{row.winner_hits}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Ranking;
