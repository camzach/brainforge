export type KeyforgePuzzle = {
  id: string;
  /** Code passed to the play page: https://brainforge-puzzles.fly.dev/play?code=${code} */
  code: string;
  title: string;
  publishedAt: string; // YYYY-MM-DD
  difficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  author?: string;
  description?: string;
  goal: string;
  hints?: string[];
  solution?: {
    overview?: string;
    steps: string[];
    explanation?: string;
  };
};
