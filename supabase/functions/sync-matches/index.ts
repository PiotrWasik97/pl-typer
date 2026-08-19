// @ts-nocheck

import { createClient } from "jsr:@supabase/supabase-js@2";

const FOOTBALL_API = "https://api.football-data.org/v4/competitions/PL/matches";

Deno.serve(async () => {
  const apiKey = Deno.env.get("FOOTBALL_DATA_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!apiKey || !supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Brak konfiguracji" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch(FOOTBALL_API, {
    headers: { "X-Auth-Token": apiKey },
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: `football-data: ${response.status}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const json = await response.json();

  const rows = json.matches.map((m) => ({
    id: m.id,
    matchday: m.matchday,
    utc_date: m.utcDate,
    home_team: m.homeTeam.shortName ?? m.homeTeam.name,
    away_team: m.awayTeam.shortName ?? m.awayTeam.name,
    home_crest: m.homeTeam.crest ?? null,
    away_crest: m.awayTeam.crest ?? null,
    home_goals: m.score.fullTime.home,
    away_goals: m.score.fullTime.away,
    status: m.status,
  }));

  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ synced: rows.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
