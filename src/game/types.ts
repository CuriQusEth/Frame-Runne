export type GameState = 'MENU' | 'PLAYING' | 'CRASHED' | 'LEADERBOARD';

export interface RunData {
  score: number;
  distance: number;
  maxCombo: number;
}
