export type GameMode = 'battle' | 'balance' | 'word_chain';

export type OpponentType = 'boss' | 'older_brother' | 'ex';

export type Winner = 'me' | 'ai' | 'draw' | null;

export interface Score {
  me: number;
  ai: number;
}

export interface BalancePrompt {
  id?: string;
  question: string;
  choices: string[];
}

export interface CreateGameResponse {
  gameId: string;
  mode: GameMode;
  status: string;
  round: number;
  maxRounds?: number;
  score: Score;
  opponent?: { type: OpponentType; name: string };
  message: string;
  quickReplies?: string[];
  nextPrompt?: string | BalancePrompt;
  wordHistory?: string[];
}

export interface TurnAnalysis {
  logic: number;
  impact: number;
  flow: number;
  aggressionLevel: number;
  angerPenalty: number;
}

export interface TurnResponse {
  reply: string;
  round: number;
  score: Score;
  turnScore?: Score;
  analysis?: TurnAnalysis;
  judgeReason?: string;
  quickReplies?: string[];
  accepted?: boolean;
  nextPrompt?: string | BalancePrompt;
  wordHistory?: string[];
  ended?: boolean;
  winner?: Winner;
}

export interface GameResult {
  mode: GameMode;
  opponentType?: OpponentType;
  opponentName?: string;
  winner: 'me' | 'ai' | 'draw';
  title: string;
  finalScore: number;
  metrics: Record<string, number>;
  bestLine?: string;
  reason?: string;
}
