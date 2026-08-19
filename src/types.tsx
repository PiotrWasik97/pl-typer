export type Match = {
  id: number;
  utcDate: string;
  matchday: number;
  homeTeam: string;
  awayTeam: string;
  status: string;
  homeGoals: number | null;
  awayGoals: number | null;
};

export type Prediction = {
  homeGoals: string;
  awayGoals: string;
};
