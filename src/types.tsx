export type Match = {
  id: number;
  utcDate: string;
  matchday: number;
  homeTeam: string;
  awayTeam: string;
};

export type Prediction = {
  homeGoals: string;
  awayGoals: string;
};
